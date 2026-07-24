/**
 * TeslaPrimeCapital — Site Media Repository (`media.repository.ts`)
 * Persistence layer for CMS-managed brand imagery overrides.
 */
import { prisma } from '@/lib/prisma';
import type { SiteMediaAsset } from '@prisma/client';

export class MediaRepository {
  public async upsertByKey(
    key: string,
    data: {
      cloudinaryPublicId: string;
      altText: string;
      format?: string;
      width?: number;
      height?: number;
      bytes?: number;
      updatedByUserId?: string;
    },
  ): Promise<SiteMediaAsset> {
    return prisma.siteMediaAsset.upsert({
      where: { key },
      update: { ...data },
      create: { key, ...data },
    });
  }

  public async listAll(): Promise<SiteMediaAsset[]> {
    return prisma.siteMediaAsset.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  public async findByKey(key: string): Promise<SiteMediaAsset | null> {
    return prisma.siteMediaAsset.findUnique({ where: { key } });
  }

  public async deleteByKey(key: string): Promise<void> {
    await prisma.siteMediaAsset.deleteMany({ where: { key } });
  }
}

export const mediaRepository = new MediaRepository();
