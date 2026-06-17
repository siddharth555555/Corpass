import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  private async runCleanup() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      await this.prisma.notification.deleteMany({
        where: {
          isRead: true,
          readAt: { lt: sevenDaysAgo },
        },
      });
    } catch (e) {
      console.error('Failed to run notification cleanup:', e);
    }
  }

  async create(userId: number, type: NotificationType, title: string, message: string, entityType?: string, entityId?: string) {
    const result = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        entityType,
        entityId,
      },
    });
    this.runCleanup();
    return result;
  }

  async notifyUsers(userIds: number[], type: NotificationType, title: string, message: string, entityType?: string, entityId?: string) {
    const data = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      entityType,
      entityId,
    }));
    
    const result = await this.prisma.notification.createMany({
      data,
    });
    this.runCleanup();
    return result;
  }

  async notifyRole(role: string, type: NotificationType, title: string, message: string, entityType?: string, entityId?: string) {
    const users = await this.prisma.user.findMany({
      where: { role: role as any },
      select: { id: true },
    });
    
    if (users.length === 0) return;
    
    const userIds = users.map(u => u.id);
    return this.notifyUsers(userIds, type, title, message, entityType, entityId);
  }

  async getNotifications(userId: number, cursor?: string, limit: number = 20) {
    const args: any = {
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    };

    if (cursor) {
      args.skip = 1; // Skip the cursor
      args.cursor = { id: cursor };
    }

    const notifications = await this.prisma.notification.findMany(args);
    return notifications;
  }

  async getUnreadCount(userId: number, type?: string) {
    const where: any = { userId, isRead: false };
    if (type) where.type = type as NotificationType;
    const count = await this.prisma.notification.count({ where });
    return { count };
  }

  async markAsRead(userId: number, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
