/**
 * Public Brand Media Manifest — GET /api/v1/media
 *
 * Anonymous, read-only resolution of every registered media slot to its live
 * URL (Cloudinary override or committed default art). Consumed once per
 * session by the MediaProvider; edge-cached with a short s-maxage so admin
 * replacements propagate within a minute without hammering the database.
 */
import { NextResponse } from 'next/server';
import { mediaService } from '@/server/services/media.service';
import { logger } from '@/utils/logger.util';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const assets = await mediaService.getPublicAssetMap();
    return NextResponse.json(
      { success: true, data: { assets }, meta: { timestamp: new Date().toISOString() } },
      { status: 200, headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } },
    );
  } catch (err: any) {
    logger.error(`Public media manifest error: ${err.message}`);
    // Render must never hard-fail on a media lookup: report unavailability and
    // let clients render committed default art.
    return NextResponse.json(
      { success: false, error: { code: 'ERR_MEDIA_MANIFEST_UNAVAILABLE' }, meta: { timestamp: new Date().toISOString() } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
