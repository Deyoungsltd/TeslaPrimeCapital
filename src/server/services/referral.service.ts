/**
 * TeslaPrimeCapital — Multi-Tier Affiliate Domain Service (`referral.service.ts`)
 * Enforces approved policy: Active Investment Allocation Referral Trigger (`5% / 2% / 1%`).
 */

import { referralRepository } from '../repositories/referral.repository';
import { userRepository } from '../repositories/user.repository';
import { APP_CONFIG } from '@/config/app.config';
import { ReferralTreeQueryInput } from '../validators/referral.validator';

export class ReferralService {
  public async getAffiliateProfile(userId: string, input: ReferralTreeQueryInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('ERR_USER_NOT_FOUND: User identity not found.');

    const summary = await referralRepository.getReferralSummary(userId);
    const logsData = await referralRepository.getCommissionLogs(userId, {
      page: input.page,
      limit: input.limit,
      tierLevel: input.tierLevel,
      status: input.status as any,
    });

    const referralLink = `${APP_CONFIG.platformName.toLowerCase()}.com/register?ref=${user.referralCode}`;

    const formattedLogs = logsData.logs.map((l) => ({
      id: pLogId(l.id),
      tierLevel: l.tierLevel,
      commissionPercentage: `${Number(l.commissionPercentage.toString()) * 100}%`,
      qualifyingAmount: l.qualifyingAmount.toString(),
      commissionEarned: l.commissionEarned.toString(),
      status: l.status,
      referredUser: `${l.referredUser.firstName} ${l.referredUser.lastName.slice(0, 1)}. (${maskEmail(l.referredUser.email)})`,
      createdAt: l.createdAt.toISOString(),
    }));

    return {
      referralCode: user.referralCode,
      referralLink,
      summary,
      commissions: formattedLogs,
      pagination: {
        page: input.page,
        limit: input.limit,
        totalCount: logsData.totalCount,
        hasNextPage: input.page * input.limit < logsData.totalCount,
      },
    };
  }
}

function pLogId(id: string): string { return id; }
function maskEmail(email: string): string {
  const parts = email.split('@');
  return `${parts[0].slice(0, 2)}***@${parts[1]}`;
}

export const referralService = new ReferralService();
