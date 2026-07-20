/**
 * TeslaPrimeCapital — Authentication App Router Endpoints (`/api/v1/auth/[...route]/route.ts`)
 * Maps incoming HTTP requests to AuthController methods.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/server/controllers/auth.controller';

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');

  switch (route) {
    case 'register':
      return await authController.register(req);
    case 'login':
      return await authController.login(req);
    case 'verify-otp':
      return await authController.verifyOtp(req);
    case 'refresh':
      return await authController.refresh(req);
    case 'logout':
      return await authController.logout(req);
    case 'totp/generate':
      return await authController.generateTotp(req);
    case 'totp/enable':
      return await authController.enableTotp(req);
    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ERR_ENDPOINT_NOT_FOUND',
            message: `Authentication route [/api/v1/auth/${route}] is not defined.`,
          },
          meta: { timestamp: new Date().toISOString(), requestId: `req_${Math.random().toString(36).substring(2, 11)}` },
        },
        { status: 404 }
      );
  }
}
