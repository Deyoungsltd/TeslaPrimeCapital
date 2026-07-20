/**
 * TeslaPrimeCapital — Notification Database Repository (`notification.repository.ts`)
 */

import { prisma } from '@/lib/prisma';
import { Notification, NotificationType } from '@prisma/client';

export class NotificationRepository {
  public async findByUserId(userId: string, options: {
    page: number;
    limit: number;
    type?: NotificationType;
    unreadOnly?: boolean;
  }): Promise<{ notifications: Notification[]; totalCount: number }> {
    const where: any = {
      userId,
      ...(options.type && { type: options.type }),
      ...(options.unreadOnly && { read: false }),
    };

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, totalCount };
  }

  public async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
  }): Promise<Notification> {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata ?? undefined,
      },
    });
  }

  public async markAsRead(userId: string, notificationIds: string[]): Promise<number> {
    const res = await prisma.notification.updateMany({
      where: { id: { in: notificationIds }, userId, read: false },
      data: { read: true },
    });
    return res.count;
  }

  public async markAllAsRead(userId: string): Promise<number> {
    const res = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return res.count;
  }
}

export const notificationRepository = new NotificationRepository();
