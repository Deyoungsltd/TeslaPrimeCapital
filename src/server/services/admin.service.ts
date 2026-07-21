/**
 * TeslaPrimeCapital — Admin Governance & Treasury Domain Service (`admin.service.ts`)
 * Enforces our approved policy: 100% Mandatory Admin Review for All Withdrawals (`totpCode` MFA required).
 */

import { adminRepository } from '../repositories/admin.repository';
import { userRepository } from '../repositories/user.repository';
import { emailService } from './email.service';
import { CryptoUtil } from '@/utils/crypto.util';
import { logger } from '@/utils/logger.util';
import { UserGovernanceUpdateInput, WithdrawalApprovalInput, AdminQueryInput } from '../validators/admin.validator';
import { authenticator } from 'otplib';

authenticator.options = { window: 1 };

export class AdminService {
  private readonly MASTER_KEY = process.env.SESSION_MASTER_KEY || '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';

  public async getExecutiveOverview() {
    return await adminRepository.getExecutiveMetrics();
  }

  public async getUsersList(input: AdminQueryInput) {
    return await adminRepository.getUsers({ page: input.page, limit: input.limit, role: input.role, status: input.status });
  }

  public async updateGovernance(adminId: string, input: UserGovernanceUpdateInput) {
    return await adminRepository.updateUserGovernance(adminId, {
      targetUserId: input.targetUserId,
      role: input.role as any,
      status: input.status as any,
      reason: input.reason,
    });
  }

  public async getPendingWithdrawalsQueue(page = 1, limit = 20) {
    return await adminRepository.getPendingWithdrawals({ page, limit });
  }

  /**
   * Executes treasury decision on pending withdrawal. Enforces Two-Factor Authentication (`totpCode`) from admin.
   */
  public async executeWithdrawalReview(adminId: string, input: WithdrawalApprovalInput) {
    const adminUser = await userRepository.findById(adminId);
    if (!adminUser || !adminUser.twoFactorSecret) {
      throw new Error('ERR_ADMIN_MFA_REQUIRED: Two-Factor Authentication (TOTP) must be active on your admin profile to sign off treasury disbursements.');
    }

    const decryptedSecret = CryptoUtil.decryptSecret(adminUser.twoFactorSecret, this.MASTER_KEY);
    const isValid = authenticator.verify({ token: input.totpCode, secret: decryptedSecret });
    if (!isValid) {
      logger.warn(`Invalid TOTP code provided by admin ${adminId} during withdrawal sign-off.`);
      throw new Error('ERR_INVALID_TOTP: The 6-digit authenticator verification code is incorrect or expired.');
    }

    const updatedTx = await adminRepository.executeWithdrawalDecision(adminId, {
      transactionId: input.transactionId,
      action: input.action,
      notes: input.notes,
    });

    await emailService.sendSecurityAlertEmail(
      updatedTx.user.email,
      updatedTx.user.firstName,
      `Withdrawal Request ${input.action === 'APPROVE' ? 'Processed & Disbursed' : 'Rejected'}`,
      input.action === 'APPROVE'
        ? `Good news! Your withdrawal request (${updatedTx.transactionId}) for ${updatedTx.amount} ${updatedTx.currency} has been approved by our treasury panel and disbursed to your destination address.`
        : `Your withdrawal request (${updatedTx.transactionId}) was rejected by treasury review. Reason: "${input.notes || 'Destination verification discrepancy.'}". The locked funds have been returned cleanly to your available balance.`
    );

    logger.info(`Treasury admin ${adminId} ${input.action}D withdrawal ${updatedTx.transactionId} (${updatedTx.amount} ${updatedTx.currency})`);
    return updatedTx;
  }

  public async getSystemAuditLogs(page = 1, limit = 30) {
    return await adminRepository.getAuditLogs({ page, limit });
  }
}

export const adminService = new AdminService();
