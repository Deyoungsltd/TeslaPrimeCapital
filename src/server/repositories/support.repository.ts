/**
 * TeslaPrimeCapital — Support Desk Persistence Layer (`support.repository.ts`)
 * Owns the persistent admin↔client conversation threads (`SupportTicket` / `SupportMessage`).
 * Every governance decision (KYC review, treasury disbursement, deposit intake) lands here
 * as a signed desk message the client can reply to directly.
 */

import { prisma } from '@/lib/prisma';
import { TicketCategory, TicketPriority, TicketStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

const ticketWithMessages = Prisma.validator<Prisma.SupportTicketDefaultArgs>()({
  include: {
    messages: { orderBy: { createdAt: 'asc' } },
    assignedAgent: { select: { id: true, firstName: true, lastName: true, role: true } },
  },
});

export type SupportThreadWithMessages = Prisma.SupportTicketGetPayload<typeof ticketWithMessages>;

export class SupportRepository {
  /**
   * Generates a schema-compliant unique ticket reference (`TKT-YYYYMMDD-XXXXXX`).
   */
  private generateTicketNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = randomBytes(3).toString('hex').toUpperCase();
    return `TKT-${dateStr}-${randomSuffix}`;
  }

  /**
   * Resolves the sender identity used when a desk message originates from the system
   * rather than a specific officer: the longest-serving SUPER_ADMIN account.
   * Returns null only when the platform has no admin identity at all (defensive).
   */
  public async getDeskIdentityAgentId(): Promise<string | null> {
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return admin?.id ?? null;
  }

  /**
   * Finds the open conversation thread for a (user, category) desk, or creates it.
   * Threads are continuous by design — recurring decisions stay in one conversation.
   */
  public async findOrCreateThread(input: {
    userId: string;
    category: TicketCategory;
    subject: string;
    priority?: TicketPriority;
    assignedAgentId?: string;
  }): Promise<SupportThreadWithMessages> {
    const existing = await prisma.supportTicket.findFirst({
      where: {
        userId: input.userId,
        category: input.category,
        status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_USER] },
      },
      orderBy: { createdAt: 'desc' },
      ...ticketWithMessages,
    });
    if (existing) return existing;

    // Unique `ticketNumber` — retry across the (astronomically unlikely) collision window.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await prisma.supportTicket.create({
          data: {
            ticketNumber: this.generateTicketNumber(),
            userId: input.userId,
            assignedAgentId: input.assignedAgentId,
            subject: input.subject,
            category: input.category,
            priority: input.priority ?? TicketPriority.MEDIUM,
            status: TicketStatus.OPEN,
          },
          ...ticketWithMessages,
        });
      } catch (err: any) {
        if (err?.code !== 'P2002' || attempt === 2) throw err;
      }
    }
    throw new Error('ERR_TICKET_NUMBER_COLLISION: Unable to allocate a unique support ticket reference.');
  }

  /**
   * Lists every conversation thread for a client, newest activity first.
   */
  public async listThreadsByUser(userId: string): Promise<SupportThreadWithMessages[]> {
    return await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      ...ticketWithMessages,
    });
  }

  /**
   * Fetches one thread strictly scoped to the requesting client (ownership enforced).
   */
  public async findThreadByUser(userId: string, threadId: string): Promise<SupportThreadWithMessages | null> {
    return await prisma.supportTicket.findFirst({
      where: { id: threadId, userId },
      ...ticketWithMessages,
    });
  }

  /**
   * Appends a signed message to a thread and re-opens the conversation so an
   * officer appears in the admin queue whenever the client replies.
   */
  public async appendMessage(input: {
    ticketId: string;
    senderId: string;
    message: string;
    isAdmin: boolean;
    assignedAgentId?: string;
    reactivatePriority?: TicketPriority;
  }) {
    return await prisma.$transaction(async (tx) => {
      const message = await tx.supportMessage.create({
        data: {
          ticketId: input.ticketId,
          senderId: input.senderId,
          message: input.message,
          isAdmin: input.isAdmin,
        },
      });

      await tx.supportTicket.update({
        where: { id: input.ticketId },
        data: {
          status: TicketStatus.OPEN,
          ...(input.assignedAgentId ? { assignedAgentId: input.assignedAgentId } : {}),
          ...(input.reactivatePriority ? { priority: input.reactivatePriority } : {}),
        },
      });

      return message;
    });
  }
}

export const supportRepository = new SupportRepository();
