/**
 * TeslaPrimeCapital — Admin Action Messaging Pipeline (`admin-messaging.service.ts`)
 * Turns every governance decision (KYC verdicts, treasury approvals/rejections,
 * deposit intake acknowledgements) into a personal 1:1 message from the
 * responsible desk. Delivery fans out across three channels:
 *   1. In-app real-time notification (SSE + Redis unread badge)
 *   2. Support Desk thread message (signed by the officer, reply-capable)
 *   3. Transactional email letter (Resend)
 * Every channel is isolated in its own try/catch so a messaging outage can
 * NEVER break or roll back the governance action itself.
 */

import { notificationService } from './notification.service';
import { emailService } from './email.service';
import { supportRepository } from '../repositories/support.repository';
import { NotificationType, TicketCategory, TicketPriority, SupportTicket } from '@prisma/client';
import { logger } from '@/utils/logger.util';

export interface IDeskMessageDelivery {
  userId: string;
  /** The officer who made the decision; falls back to the desk identity admin when omitted. */
  adminId?: string;
  category: TicketCategory;
  deskLabel: string;
  subject: string;
  body: string;
  priority?: TicketPriority;
  notification: {
    type: NotificationType;
    title: string;
  };
  /** Recipient coordinates for the email letter; omit to skip the email channel. */
  emailRecipient?: {
    email: string;
    firstName: string;
  };
  emailSubject?: string;
}

const CATEGORY_THREAD_SUBJECTS: Record<TicketCategory, string> = {
  KYC_VERIFICATION: 'Identity Verification — Compliance Desk',
  DEPOSIT_WITHDRAWAL: 'Deposits & Withdrawals — Treasury Desk',
  INVESTMENT_PLAN: 'Capital Allocations — Portfolio Desk',
  SECURITY_2FA: 'Account Protection — Security Desk',
  GENERAL: 'Client Services — General Inquiry',
};

export class AdminMessagingService {
  /**
   * Delivers a signed desk message across notification, support thread, and email channels.
   */
  public async deliverDeskMessage(input: IDeskMessageDelivery): Promise<void> {
    // ------------------------------------------------------------------
    // Channel 1 — Support Desk thread (system of record for the dialogue)
    // ------------------------------------------------------------------
    let thread: SupportTicket | null = null;
    try {
      const senderId = input.adminId ?? (await supportRepository.getDeskIdentityAgentId());
      if (!senderId) {
        logger.warn(`Desk message skipped for user ${input.userId} [${input.category}]: no admin sender identity available.`);
      } else {
        thread = await supportRepository.findOrCreateThread({
          userId: input.userId,
          category: input.category,
          subject: CATEGORY_THREAD_SUBJECTS[input.category],
          priority: input.priority ?? TicketPriority.MEDIUM,
          assignedAgentId: senderId,
        });
        await supportRepository.appendMessage({
          ticketId: thread.id,
          senderId,
          message: input.body,
          isAdmin: true,
          reactivatePriority: input.priority,
        });
        logger.info(`Desk message appended to thread ${thread.ticketNumber} for user ${input.userId} [${input.category}]`);
      }
    } catch (err: any) {
      logger.error(`Support thread channel failed for desk message to user ${input.userId}: ${err.message}`, { stack: err.stack });
    }

    // ------------------------------------------------------------------
    // Channel 2 — Real-time in-app notification
    // ------------------------------------------------------------------
    try {
      await notificationService.dispatchNotification({
        userId: input.userId,
        type: input.notification.type,
        title: input.notification.title,
        message: input.body.length > 220 ? `${input.body.slice(0, 217)}...` : input.body,
        metadata: {
          category: input.category,
          desk: input.deskLabel,
          ...(thread ? { ticketId: thread.id, ticketNumber: thread.ticketNumber } : {}),
        },
      });
    } catch (err: any) {
      logger.error(`Notification channel failed for desk message to user ${input.userId}: ${err.message}`, { stack: err.stack });
    }

    // ------------------------------------------------------------------
    // Channel 3 — Transactional email letter
    // ------------------------------------------------------------------
    if (input.emailRecipient) {
      try {
        await emailService.sendDeskMessageEmail(
          input.emailRecipient.email,
          input.emailRecipient.firstName,
          input.deskLabel,
          input.emailSubject ?? input.subject,
          input.body
        );
      } catch (err: any) {
        logger.error(`Email channel failed for desk message to user ${input.userId}: ${err.message}`, { stack: err.stack });
      }
    }
  }
}

export const adminMessagingService = new AdminMessagingService();
