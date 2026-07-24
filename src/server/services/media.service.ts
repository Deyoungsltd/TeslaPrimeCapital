/**
 * TeslaPrimeCapital — Brand Media Governance Service (`media.service.ts`)
 *
 * Contract for the CMS layer over platform imagery:
 *
 *   - Uploads are signed server-side exactly like KYC (admin-only caller,
 *     short-lived signature) but target the PUBLIC `teslaprime/site-media`
 *     folder — these assets must be publicly deliverable, unlike KYC vault
 *     documents which use the `authenticated` type.
 *   - Recording an override NEVER trusts client-supplied metadata: the
 *     Cloudinary Admin API is queried for the real dimensions/format/bytes,
 *     and the publicId must live inside our sanctioned folder (prevents an
 *     admin panel XSS from pointing slots at arbitrary remote imagery).
 *   - The public map resolves every registry slot to either its Cloudinary
 *     override URL or its committed default art, so the site renders identically
 *     with an empty table.
 *
 * No simulated fallbacks: if storage credentials are missing the service
 * throws, loudly, at administration time — never at render time.
 */
import { v2 as cloudinary } from 'cloudinary';
import { mediaRepository } from '../repositories/media.repository';
import { MEDIA_SLOTS, MEDIA_SLOT_MAP, isMediaSlotKey } from '@/content/media-registry';
import type { MediaRecordRequestInput } from '../validators/media.validator';
import { logger } from '@/utils/logger.util';

const MEDIA_FOLDER = 'teslaprime/site-media';
const DELIVERY_HOST = 'https://res.cloudinary.com';

export interface IPublicMediaAsset {
  url: string;
  alt: string;
  isOverride: boolean;
  updatedAt?: string;
}

function requireCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('ERR_MEDIA_STORAGE_UNCONFIGURED: Cloudinary credentials are not set. Populate CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.');
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return { cloudName, apiKey, apiSecret };
}

export class MediaService {
  /**
   * Issues a short-lived signed payload so the admin's browser can PUT the
   * file straight into Cloudinary without the API secret ever leaving us.
   */
  public async generateUploadSignature(adminUserId: string) {
    const { cloudName, apiKey, apiSecret } = requireCloudinaryConfig();
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder: MEDIA_FOLDER };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    logger.info(`Media upload signature issued for admin ${adminUserId}.`);
    return { timestamp, folder: MEDIA_FOLDER, signature, apiKey, cloudName, uploadType: 'upload' };
  }

  /**
   * Records (or replaces) the override for a registry slot after verifying
   * the asset genuinely exists in our sanctioned folder. Real dimensions and
   * byte-size are pulled from Cloudinary — client metadata is never trusted.
   */
  public async recordAsset(adminUserId: string, input: MediaRecordRequestInput) {
    requireCloudinaryConfig();
    if (!isMediaSlotKey(input.key)) {
      throw new Error('ERR_MEDIA_SLOT_UNKNOWN: The supplied media slot is not defined in the registry.');
    }
    if (!input.cloudinaryPublicId.startsWith(`${MEDIA_FOLDER}/`)) {
      throw new Error(`ERR_MEDIA_FOLDER_VIOLATION: Assets must live inside ${MEDIA_FOLDER}/ — re-upload through the Brand Library.`);
    }

    let resource: any;
    try {
      resource = await cloudinary.api.resource(input.cloudinaryPublicId, { resource_type: 'image' });
    } catch {
      throw new Error('ERR_MEDIA_ASSET_NOT_FOUND: Cloudinary reports no readable image under that public ID — wait a few seconds after upload and retry.');
    }

    const slot = MEDIA_SLOT_MAP[input.key];
    const row = await mediaRepository.upsertByKey(input.key, {
      cloudinaryPublicId: resource.public_id,
      altText: input.altText?.trim() || slot.defaultAlt,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      updatedByUserId: adminUserId,
    });

    logger.info(`Media slot [${input.key}] overridden by admin ${adminUserId} -> ${resource.public_id}`);
    return {
      key: row.key,
      url: this.buildDeliveryUrl(resource.public_id),
      altText: row.altText,
      width: row.width,
      height: row.height,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /** Removes an override; the slot falls back to committed default art. */
  public async revertAsset(adminUserId: string, key: string) {
    if (!isMediaSlotKey(key)) {
      throw new Error('ERR_MEDIA_SLOT_UNKNOWN: The supplied media slot is not defined in the registry.');
    }
    await mediaRepository.deleteByKey(key);
    logger.info(`Media slot [${key}] reverted to default art by admin ${adminUserId}.`);
    return { key, reverted: true };
  }

  /** Admin console view: every slot joined with its live override, if any. */
  public async listAssets() {
    const rows = await mediaRepository.listAll();
    const rowMap = new Map(rows.map((r) => [r.key, r]));
    return MEDIA_SLOTS.map((slot) => {
      const row = rowMap.get(slot.key);
      return {
        ...slot,
        override: row
          ? {
              url: this.buildDeliveryUrl(row.cloudinaryPublicId),
              altText: row.altText,
              width: row.width,
              height: row.height,
              bytes: row.bytes,
              updatedAt: row.updatedAt.toISOString(),
            }
          : null,
      };
    });
  }

  /** Public render map consumed by <ManagedImage> via /api/v1/media. */
  public async getPublicAssetMap(): Promise<Record<string, IPublicMediaAsset>> {
    const rows = await mediaRepository.listAll();
    const rowMap = new Map(rows.map((r) => [r.key, r]));
    const map: Record<string, IPublicMediaAsset> = {};
    for (const slot of MEDIA_SLOTS) {
      const row = rowMap.get(slot.key);
      map[slot.key] = row
        ? {
            url: this.buildDeliveryUrl(row.cloudinaryPublicId),
            alt: row.altText || slot.defaultAlt,
            isOverride: true,
            updatedAt: row.updatedAt.toISOString(),
          }
        : { url: slot.defaultSrc, alt: slot.defaultAlt, isOverride: false };
    }
    return map;
  }

  private buildDeliveryUrl(publicId: string): string {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
    return `${DELIVERY_HOST}/${cloudName}/image/upload/f_auto,q_auto,w_2400,c_limit/${publicId}`;
  }
}

export const mediaService = new MediaService();
