/**
 * TeslaPrimeCapital — Real-Time Notification Domain Service (`notification.service.ts`)
 * Manages Redis atomic unread badge counters (`unread_count:user_{ID}`) and Server-Sent Events (`SSE`).
 */

import { notificationRepository } from '../repositories/notification.repository';
import { redis } from '@/lib/redis';
import { NotificationType } from '@prisma/client';
import { logger } from '@/utils/logger.util';
import { NotificationQueryInput, NotificationMarkReadInput } from '../validators/notification.validator';

// Active Server-Sent Events (SSE) subscribers registry in Node memory
const sseClients = new Map<string, Set<ReadableStreamDefaultController>>();

export class NotificationService {
  /**
   * Dispatches a real-time notification: persists to PostgreSQL, increments Redis unread badge (< 5ms),
   * and pushes live JSON event across SSE connections.
   */
  public async dispatchNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
  }) {
    // 1. Persist inside PostgreSQL
    const notification = await notificationRepository.create(data);

    // 2. Increment atomic unread counter in Redis
    const unreadKey = `unread_count:user_${data.userId}`;
    const newCount = await redis.incr(unreadKey);

    // 3. Broadcast across active SSE stream listeners
    const clients = sseClients.get(data.userId);
    if (clients && clients.size > 0) {
      const payload = `data: ${JSON.stringify({ type: 'NEW_NOTIFICATION', notification, unreadCount: newCount })}\n\n`;
      clients.forEach((controller) => {
        try {
          controller.enqueue(new TextEncoder().encode(payload));
        } catch {
          clients.delete(controller);
        }
      });
    }

    logger.info(`Notification dispatched to user ${data.userId} [${data.type}]: ${data.title}`);
    return notification;
  }

  /**
   * Fetches current unread badge count directly from Redis (`< 5ms execution`).
   */
  public async getUnreadCount(userId: string): Promise<number> {
    const unreadKey = `unread_count:user_${userId}`;
    const countStr = await redis.get(unreadKey);
    if (countStr !== null) {
      return Math.max(0, parseInt(countStr, 10));
    }
    // Fallback sync from DB if Redis key expired or uninitialized
    const dbCount = (await notificationRepository.findByUserId(userId, { page: 1, limit: 1, unreadOnly: true })).totalCount;
    await redis.set(unreadKey, dbCount.toString());
    return dbCount;
  }

  /**
   * Fetches paginated notification history for user.
   */
  public async getUserNotifications(userId: string, input: NotificationQueryInput) {
    return await notificationRepository.findByUserId(userId, {
      page: input.page,
      limit: input.limit,
      type: input.type as any,
      unreadOnly: input.unreadOnly,
    });
  }

  /**
   * Marks specific notifications as read and decrements Redis counter.
   */
  public async markAsRead(userId: string, input: NotificationMarkReadInput) {
    const updatedCount = await notificationRepository.markAsRead(userId, input.notificationIds);
    if (updatedCount > 0) {
      const unreadKey = `unread_count:user_${userId}`;
      const current = await redis.decrby(unreadKey, updatedCount);
      if (current < 0) await redis.set(unreadKey, '0');
    }
    return { updatedCount, unreadCount: await this.getUnreadCount(userId) };
  }

  /**
   * Marks ALL unread notifications as read and sets Redis counter to 0 (`Optimistic zeroing`).
   */
  public async markAllAsRead(userId: string) {
    const updatedCount = await notificationRepository.markAllAsRead(userId);
    const unreadKey = `unread_count:user_${userId}`;
    await redis.set(unreadKey, '0');
    return { updatedCount, unreadCount: 0 };
  }

  /**
   * Registers an active SSE client stream controller for real-time pushing.
   */
  public registerSseClient(userId: string, controller: ReadableStreamDefaultController) {
    if (!sseClients.has(userId)) {
      sseClients.set(userId, new Set());
    }
    sseClients.get(userId)!.add(controller);
    logger.debug(`Registered SSE listener for user ${userId}. Total listeners: ${sseClients.get(userId)!.size}`);
  }

  /**
   * Unregisters an SSE client stream controller when connection closes.
   */
  public unregisterSseClient(userId: string, controller: ReadableStreamDefaultController) {
    const clients = sseClients.get(userId);
    if (clients) {
      clients.delete(controller);
      if (clients.size === 0) sseClients.delete(userId);
    }
  }
}

export const notificationService = new NotificationService();
