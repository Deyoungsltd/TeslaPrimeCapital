/**
 * TeslaPrimeCapital — Real-Time Anti-Fraud & Velocity Screening (`security-hooks.middleware.ts`)
 * Intercepts requests to detect structuring behavior and suspicious geophysical velocity.
 */

import { prisma } from '@/lib/prisma';
import { emailService } from '../services/email.service';
import { logger } from '@/utils/logger.util';

export async function checkGeographicVelocity(userId: string, currentIp: string, currentDevice?: string): Promise<boolean> {
  try {
    const lastSession = await prisma.session.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    if (lastSession && lastSession.ipAddress && lastSession.ipAddress !== currentIp) {
      const timeDiffHours = (Date.now() - lastSession.createdAt.getTime()) / 3600000;
      if (timeDiffHours < 2) {
        logger.warn(`Suspicious geophysical velocity intercepted for user ${userId}. IP changed from ${lastSession.ipAddress} to ${currentIp} within ${timeDiffHours.toFixed(1)}h.`);

        await prisma.auditLog.create({
          data: {
            userId,
            actorRole: lastSession.user.role,
            actionType: 'SUSPICIOUS_GEOPHYSICAL_VELOCITY',
            resourceId: currentIp,
            oldValue: { previousIp: lastSession.ipAddress, previousDevice: lastSession.deviceFingerprint },
            newValue: { currentIp, currentDevice, timeDiffHours: timeDiffHours.toFixed(2) },
            ipAddress: currentIp,
            userAgent: currentDevice,
          },
        });

        await emailService.sendSecurityAlertEmail(
          lastSession.user.email,
          lastSession.user.firstName,
          'Security Alert: Rapid Geographic IP Shift Detected',
          `We detected a rapid geographical IP address shift on your account from IP [${lastSession.ipAddress}] to [${currentIp}] within less than 2 hours. If this was not you using a VPN, immediately log out all devices via your security dashboard.`,
          currentIp,
          currentDevice
        );

        return false; // Flagged suspicious
      }
    }
    return true;
  } catch (err: any) {
    logger.error(`Geographic velocity check failure: ${err.message}`);
    return true; // Fail open to prevent locking legitimate users during network timeout
  }
}

export async function checkStructuringBehavior(userId: string, incomingDepositAmount: string): Promise<boolean> {
  try {
    const amt = parseFloat(incomingDepositAmount);
    if (amt >= 9000 && amt < 10000) {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600000);
      const recentDeposits = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'DEPOSIT',
          createdAt: { gte: fortyEightHoursAgo },
        },
      });

      const structuringDeposits = recentDeposits.filter((tx: any) => {
        const txAmt = parseFloat(tx.amount.toString());
        return txAmt >= 9000 && txAmt < 10000;
      });

      if (structuringDeposits.length >= 2) {
        logger.warn(`AML Structuring alert intercepted for user ${userId}. 3+ deposits between $9,000 and $9,999 in 48 hours.`);

        await prisma.auditLog.create({
          data: {
            userId,
            actorRole: 'INVESTOR',
            actionType: 'AML_STRUCTURING_ALERT',
            resourceId: `deposits_count_${structuringDeposits.length + 1}`,
            oldValue: { previousStructuringCount: structuringDeposits.length },
            newValue: { incomingDepositAmount, alertThresholdBreached: true },
          },
        });

        return false; // Structuring flagged
      }
    }
    return true;
  } catch (err: any) {
    logger.error(`Structuring detection check failure: ${err.message}`);
    return true;
  }
}
