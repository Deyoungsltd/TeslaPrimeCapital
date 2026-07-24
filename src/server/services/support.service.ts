/**
 * TeslaPrimeCapital — Client Support Desk Domain Service (`support.service.ts`)
 * Powers the client-facing conversation surface: direct reply-capable threads
 * with the Compliance Desk and Treasury Desk officers.
 */

import { supportRepository } from '../repositories/support.repository';
import { userRepository } from '../repositories/user.repository';
import { notificationService } from './notification.service';
import { logger } from '@/utils/logger.util';
import { SupportReplyInput, SupportCreateThreadInput } from '../validators/support.validator';

export class SupportService {
  /**
   * Lists all conversation threads of the client with full message history,
   * desk assignment, and unread-style activity ordering.
   */
  public async getUserThreads(userId: string) {
    const threads = await supportRepository.listThreadsByUser(userId);
    return {
      threads: threads.map((t) => ({
        threadId: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        assignedAgent: t.assignedAgent
          ? {
              name: `${t.assignedAgent.firstName} ${t.assignedAgent.lastName.charAt(0)}.`,
              role: t.assignedAgent.role,
            }
          : null,
        messages: t.messages.map((m) => ({
          messageId: m.id,
          sender: m.isAdmin ? ('DESK' as const) : ('CLIENT' as const),
          body: m.message,
          sentAt: m.createdAt.toISOString(),
        })),
        lastActivityAt: t.updatedAt.toISOString(),
        openedAt: t.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Appends the client's reply to a thread they own, then alerts the assigned
   * desk officer via the real-time notification bus.
   */
  public async replyAsUser(userId: string, input: SupportReplyInput) {
    const thread = await supportRepository.findThreadByUser(userId, input.threadId);
    if (!thread) {
      throw new Error('ERR_THREAD_NOT_FOUND: Conversation thread not found on your account.');
    }

    const message = await supportRepository.appendMessage({
      ticketId: thread.id,
      senderId: userId,
      message: input.message,
      isAdmin: false,
    });

    // Alert the desk officer who owns the conversation (real-time badge + SSE).
    if (thread.assignedAgentId) {
      try {
        await notificationService.dispatchNotification({
          userId: thread.assignedAgentId,
          type: 'SYSTEM',
          title: `Client Reply — ${thread.ticketNumber}`,
          message: input.message.length > 220 ? `${input.message.slice(0, 217)}...` : input.message,
          metadata: { ticketId: thread.id, ticketNumber: thread.ticketNumber, category: thread.category },
        });
      } catch (err: any) {
        logger.error(`Desk officer alert failed for thread ${thread.ticketNumber}: ${err.message}`);
      }
    }

    logger.info(`Client ${userId} replied on support thread ${thread.ticketNumber}`);
    return {
      messageId: message.id,
      sentAt: message.createdAt.toISOString(),
      threadId: thread.id,
      status: 'OPEN',
    };
  }

  /**
   * Opens a brand-new client-initiated conversation with the Client Services desk.
   */
  public async openThreadAsUser(userId: string, input: SupportCreateThreadInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('ERR_USER_NOT_FOUND: User identity not found.');

    const deskAgentId = await supportRepository.getDeskIdentityAgentId();
    const thread = await supportRepository.findOrCreateThread({
      userId,
      category: input.category,
      subject: input.subject,
      assignedAgentId: deskAgentId ?? undefined,
    });

    const message = await supportRepository.appendMessage({
      ticketId: thread.id,
      senderId: userId,
      message: input.message,
      isAdmin: false,
    });

    if (thread.assignedAgentId) {
      try {
        await notificationService.dispatchNotification({
          userId: thread.assignedAgentId,
          type: 'SYSTEM',
          title: `New Client Thread — ${thread.ticketNumber}`,
          message: input.message.length > 220 ? `${input.message.slice(0, 217)}...` : input.message,
          metadata: { ticketId: thread.id, ticketNumber: thread.ticketNumber, category: thread.category },
        });
      } catch (err: any) {
        logger.error(`Desk officer alert failed for new thread ${thread.ticketNumber}: ${err.message}`);
      }
    }

    logger.info(`Client ${userId} opened support thread ${thread.ticketNumber} [${input.category}]`);
    return {
      threadId: thread.id,
      ticketNumber: thread.ticketNumber,
      subject: thread.subject,
      category: thread.category,
      status: 'OPEN',
      firstMessageId: message.id,
    };
  }
}

export const supportService = new SupportService();
