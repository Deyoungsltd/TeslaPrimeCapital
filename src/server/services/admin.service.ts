/**
 * TeslaPrimeCapital — Admin Governance & Treasury Domain Service (`admin.service.ts`)
 * Enforces our approved policy: 100% Mandatory Admin Review for All Withdrawals (`totpCode` MFA required).
 */

import { adminRepository } from '../repositories/admin.repository';
import { userRepository } from '../repositories/user.repository';
import { adminMessagingService } from './admin-messaging.service';
import { CryptoUtil } from '@/utils/crypto.util';
import { logger } from '@/utils/logger.util';
import { prisma } from '@/lib/prisma';
import { UserGovernanceUpdateInput, WithdrawalApprovalInput, DepositApprovalInput, BroadcastMessageInput, AdminQueryInput } from '../validators/admin.validator';
import { authenticator } from 'otplib';

authenticator.options = { window: 1 };

const BROADCAST_DESK_MAP: Record<BroadcastMessageInput['desk'], { category: 'GENERAL' | 'DEPOSIT_WITHDRAWAL' | 'INVESTMENT_PLAN' | 'KYC_VERIFICATION' | 'SECURITY_2FA'; notificationType: 'SYSTEM' | 'TRANSACTION' | 'INVESTMENT' | 'SECURITY' | 'KYC' }> = {
  'Compliance Desk': { category: 'KYC_VERIFICATION', notificationType: 'KYC' },
  'Treasury Desk': { category: 'DEPOSIT_WITHDRAWAL', notificationType: 'TRANSACTION' },
  'Portfolio Desk': { category: 'INVESTMENT_PLAN', notificationType: 'INVESTMENT' },
  'Security Desk': { category: 'SECURITY_2FA', notificationType: 'SECURITY' },
  'Client Services Desk': { category: 'GENERAL', notificationType: 'SYSTEM' },
};

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

    // Fan out the treasury verdict as a personal Treasury Desk message across
    // notification + support thread + email. Messaging is fail-safe and can
    // never roll back the settled treasury decision.
    const approved = input.action === 'APPROVE';
    await adminMessagingService.deliverDeskMessage({
      userId: updatedTx.userId,
      adminId,
      category: 'DEPOSIT_WITHDRAWAL',
      deskLabel: 'Treasury Desk',
      subject: approved
        ? `Withdrawal Disbursed — ${updatedTx.amount} ${updatedTx.currency}`
        : `Withdrawal Declined — ${updatedTx.amount} ${updatedTx.currency}`,
      priority: 'HIGH',
      body: approved
        ? `Your withdrawal request ${updatedTx.transactionId} for ${updatedTx.amount} ${updatedTx.currency} has been approved and disbursed by the Treasury Desk to your registered destination.\n\nReference: ${updatedTx.transactionId}. Settlement confirmation appears in your ledger once the network/banking rail completes finalization.`
        : `Your withdrawal request ${updatedTx.transactionId} for ${updatedTx.amount} ${updatedTx.currency} was declined during treasury review.\n\nReview note: "${input.notes || 'Destination verification discrepancy.'}"\n\nThe full amount has been returned to your available balance — no funds were deducted. You may resubmit after correcting the flagged detail, or reply in this thread and the Treasury Desk will assist directly.`,
      notification: {
        type: 'TRANSACTION',
        title: approved ? 'Treasury Desk: Withdrawal Disbursed' : 'Treasury Desk: Withdrawal Declined',
      },
      emailRecipient: { email: updatedTx.user.email, firstName: updatedTx.user.firstName },
    });

    logger.info(`Treasury admin ${adminId} ${input.action}D withdrawal ${updatedTx.transactionId} (${updatedTx.amount} ${updatedTx.currency})`);
    return updatedTx;
  }

  public async getSystemAuditLogs(page = 1, limit = 30) {
    return await adminRepository.getAuditLogs({ page, limit });
  }

  /**
   * Verifies the acting admin's TOTP credential. Shared by treasury sign-off
   * and platform-wide dispatches — irreversible actions always carry MFA.
   */
  private async assertAdminTotp(adminId: string, totpCode: string, context: string) {
    const adminUser = await userRepository.findById(adminId);
    if (!adminUser || !adminUser.twoFactorSecret) {
      throw new Error('ERR_ADMIN_MFA_REQUIRED: Two-Factor Authentication (TOTP) must be active on your admin profile to perform this action.');
    }
    const decryptedSecret = CryptoUtil.decryptSecret(adminUser.twoFactorSecret, this.MASTER_KEY);
    const isValid = authenticator.verify({ token: totpCode, secret: decryptedSecret });
    if (!isValid) {
      logger.warn(`Invalid TOTP code provided by admin ${adminId} during ${context}.`);
      throw new Error('ERR_INVALID_TOTP: The 6-digit authenticator verification code is incorrect or expired.');
    }
  }

  public async getPendingDepositsQueue(page = 1, limit = 20) {
    return await adminRepository.getPendingDeposits({ page, limit });
  }

  /**
   * Executes treasury settlement on a pending deposit with mandatory admin TOTP,
   * then delivers the verdict as a personal Treasury Desk message.
   */
  public async executeDepositReview(adminId: string, input: DepositApprovalInput) {
    await this.assertAdminTotp(adminId, input.totpCode, 'deposit settlement sign-off');

    const updatedTx = await adminRepository.executeDepositDecision(adminId, {
      transactionId: input.transactionId,
      action: input.action,
      notes: input.notes,
    });

    const approved = input.action === 'APPROVE';
    await adminMessagingService.deliverDeskMessage({
      userId: updatedTx.userId,
      adminId,
      category: 'DEPOSIT_WITHDRAWAL',
      deskLabel: 'Treasury Desk',
      subject: approved
        ? `Deposit Confirmed & Credited — ${updatedTx.amount} ${updatedTx.currency}`
        : `Deposit Not Confirmed — ${updatedTx.amount} ${updatedTx.currency}`,
      priority: 'HIGH',
      body: approved
        ? `Your deposit ${updatedTx.transactionId} for ${updatedTx.amount} ${updatedTx.currency} has been confirmed on the settlement rail and credited to your available balance.\n\nReference: ${updatedTx.transactionId}. The funds are immediately allocatable across every plan your tier unlocks.`
        : `Your deposit ${updatedTx.transactionId} for ${updatedTx.amount} ${updatedTx.currency} could not be confirmed during settlement review.\n\nReview note: "${input.notes || 'The payment reference did not reconcile with the settlement rail.'}"\n\nNo balance was credited. Verify the reference/hash and the sending wallet, then reply in this thread — the Treasury Desk will re-inspect against the corrected detail.`,
      notification: {
        type: 'TRANSACTION',
        title: approved ? 'Treasury Desk: Deposit Credited' : 'Treasury Desk: Deposit Not Confirmed',
      },
      emailRecipient: { email: updatedTx.user.email, firstName: updatedTx.user.firstName },
    });

    logger.info(`Treasury admin ${adminId} ${input.action}D deposit ${updatedTx.transactionId} (${updatedTx.amount} ${updatedTx.currency})`);
    return updatedTx;
  }

  /**
   * Broadcasts a signed desk message to a segmented audience through the
   * standard three-channel desk pipeline. Mandatory admin TOTP; every
   * recipient delivery is isolated so one failure never stalls the run.
   */
  public async deliverBroadcast(adminId: string, input: BroadcastMessageInput) {
    await this.assertAdminTotp(adminId, input.totpCode, 'platform broadcast dispatch');

    const contacts = await adminRepository.getBroadcastAudienceContacts(input.audience);
    const desk = BROADCAST_DESK_MAP[input.desk];

    let delivered = 0;
    const failures: string[] = [];
    const BATCH_SIZE = 20;

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((contact) =>
          adminMessagingService.deliverDeskMessage({
            userId: contact.id,
            adminId,
            category: desk.category,
            deskLabel: input.desk,
            subject: input.subject,
            body: input.message,
            priority: 'HIGH',
            notification: { type: desk.notificationType, title: `${input.desk}: ${input.subject}` },
            ...(input.sendEmail ? { emailRecipient: { email: contact.email, firstName: contact.firstName } } : {}),
          })
        )
      );
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') delivered += 1;
        else failures.push(`${batch[idx].email}: ${result.reason?.message ?? 'unknown'}`);
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        actorRole: 'SUPER_ADMIN',
        actionType: 'ADMIN_BROADCAST_DISPATCHED',
        resourceId: `broadcast-${Date.now()}`,
        newValue: {
          desk: input.desk,
          subject: input.subject,
          audience: input.audience,
          sendEmail: input.sendEmail,
          targeted: contacts.length,
          delivered,
          failures: failures.length,
        },
      },
    });

    logger.info(`Broadcast dispatched by admin ${adminId}: ${delivered}/${contacts.length} delivered [${input.audience}] ${input.desk} — "${input.subject}"`);
    return {
      audience: input.audience,
      targetedCount: contacts.length,
      deliveredCount: delivered,
      failureCount: failures.length,
      sendEmail: input.sendEmail,
    };
  }
}

export const adminService = new AdminService();
