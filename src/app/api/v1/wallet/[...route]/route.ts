/**
 * TeslaPrimeCapital — Wallet & Ledger App Router Endpoints (`/api/v1/wallet/[...route]/route.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { walletController } from '@/server/controllers/wallet.controller';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'balances':
      return await walletController.getBalances(req);
    case 'transactions':
      return await walletController.getTransactions(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [/api/v1/wallet/${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'deposit':
      return await walletController.deposit(req);
    case 'withdraw':
      return await walletController.withdraw(req);
    case 'exchange':
      return await walletController.exchange(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [/api/v1/wallet/${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}
