/**
 * TeslaPrimeCapital — KYC App Router Endpoints (`/api/v1/kyc/[...route]/route.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { kycController } from '@/server/controllers/kyc.controller';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route;
  if (route[0] === 'documents') {
    return await kycController.getUserDocuments(req);
  } else if (route[0] === 'review' && route[1] === 'queue') {
    return await kycController.getPendingQueue(req);
  } else if (route[0] === 'review' && route[1] && route[2] === 'url') {
    return await kycController.getSecureUrl(req, route[1]);
  }
  return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: 'KYC route not found.' }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'upload-signature':
      return await kycController.getUploadSignature(req);
    case 'record':
      return await kycController.recordDocument(req);
    case 'review/action':
      return await kycController.reviewAction(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: 'KYC route not found.' }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}
