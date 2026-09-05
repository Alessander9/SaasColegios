import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '@cole/database';
import { v4 as uuidv4 } from 'uuid';
import {
  SendNotificationDto,
  SendBulkNotificationDto,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from './dto/notification.dto';
import { StructuredLogger } from '@cole/logger';

@Injectable()
export class NotificationService {
  private logger = new StructuredLogger('notification-service');

  // --------------------------------------------------
  // SINGLE NOTIFICATION
  // --------------------------------------------------

  async sendNotification(tenantId: string, dto: SendNotificationDto): Promise<any> {
    const notificationId = uuidv4();
    const recipient = await db.user.findFirst({
      where: { id: dto.recipientId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient user not found');
    }

    const notification = await db.notification.create({
      data: {
        id: notificationId,
        tenantId,
        recipientId: dto.recipientId,
        channel: dto.channel,
        subject: dto.subject,
        body: dto.body,
        templateKey: dto.templateKey,
        templateData: dto.templateData ? (dto.templateData as any) : undefined,
        priority: dto.priority || NotificationPriority.NORMAL,
        category: dto.category,
        status: NotificationStatus.PENDING,
      },
    });

    // Dispatch based on channel
    try {
      await this.dispatchNotification(notification, recipient);
      await db.notification.update({
        where: { id: notificationId },
        data: { status: NotificationStatus.SENT, sentAt: new Date() },
      });
      notification.status = NotificationStatus.SENT;
    } catch (err: any) {
      await db.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.FAILED,
          errorMessage: err.message || 'Dispatch failed',
        },
      });
      this.logger.error(`Notification dispatch failed`, err, {
        notificationId,
        channel: dto.channel,
        recipientId: dto.recipientId,
      });
    }

    return notification;
  }

  // --------------------------------------------------
  // BULK NOTIFICATIONS
  // --------------------------------------------------

  async sendBulkNotification(tenantId: string, dto: SendBulkNotificationDto): Promise<any> {
    const results: any[] = [];

    for (const recipientId of dto.recipientIds) {
      const result = await this.sendNotification(tenantId, {
        recipientId,
        channel: dto.channel,
        subject: dto.subject,
        body: dto.body,
        priority: dto.priority,
        category: dto.category,
      });
      results.push(result);
    }

    return {
      totalSent: dto.recipientIds.length,
      results,
    };
  }

  // --------------------------------------------------
  // QUERIES
  // --------------------------------------------------

  async getNotifications(
    tenantId: string,
    recipientId: string,
    options?: { channel?: NotificationChannel; status?: NotificationStatus; category?: string },
  ): Promise<any[]> {
    return db.notification.findMany({
      where: {
        tenantId,
        recipientId,
        ...(options?.channel ? { channel: options.channel } : {}),
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.category ? { category: options.category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getNotificationById(tenantId: string, id: string): Promise<any> {
    const notification = await db.notification.findFirst({
      where: { id, tenantId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAsRead(tenantId: string, id: string): Promise<any> {
    const notification = await db.notification.findFirst({
      where: { id, tenantId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    return db.notification.update({
      where: { id },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    });
  }

  async getUnreadCount(tenantId: string, recipientId: string): Promise<number> {
    return db.notification.count({
      where: {
        tenantId,
        recipientId,
        status: { not: NotificationStatus.READ },
      },
    });
  }

  async getNotificationStats(tenantId: string): Promise<any> {
    const byChannel = await db.notification.groupBy({
      by: ['channel'],
      where: { tenantId },
      _count: true,
    });

    const byStatus = await db.notification.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    const totalSent = await db.notification.count({
      where: { tenantId, status: NotificationStatus.SENT },
    });

    const totalFailed = await db.notification.count({
      where: { tenantId, status: NotificationStatus.FAILED },
    });

    return {
      total: byChannel.reduce((acc, c) => acc + c._count, 0),
      totalSent,
      totalFailed,
      deliveryRate: totalSent + totalFailed > 0
        ? Number(((totalSent / (totalSent + totalFailed)) * 100).toFixed(1))
        : 0,
      byChannel: byChannel.map((c) => ({ channel: c.channel, count: c._count })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    };
  }

  // --------------------------------------------------
  // CHANNEL DISPATCH (Pluggable)
  // --------------------------------------------------

  private async dispatchNotification(
    notification: any,
    recipient: { id: string; email: string | null; firstName: string; lastName: string },
  ): Promise<void> {
    switch (notification.channel) {
      case NotificationChannel.EMAIL:
        await this.sendEmail(recipient.email || '', notification.subject, notification.body);
        break;
      case NotificationChannel.SMS:
        await this.sendSms(recipient.email || '', notification.body);
        break;
      case NotificationChannel.PUSH:
        await this.sendPush(recipient.id, notification.subject, notification.body);
        break;
      case NotificationChannel.IN_APP:
        // In-app is stored in DB only, no external dispatch needed
        break;
      default:
        throw new BadRequestException(`Unsupported channel: ${notification.channel}`);
    }
  }

  // --------------------------------------------------
  // CHANNEL IMPLEMENTATIONS (Stub — plug in real providers)
  // --------------------------------------------------

  private async sendEmail(to: string, subject: string, _body: string): Promise<void> {
    // TODO: Integrate with SendGrid / AWS SES / Resend
    this.logger.info(`[EMAIL] To: ${to} | Subject: ${subject}`, { channel: 'email' });
  }

  private async sendSms(to: string, message: string): Promise<void> {
    // TODO: Integrate with Twilio / Vonage
    this.logger.info(`[SMS] To: ${to} | Message length: ${message.length}`, { channel: 'sms' });
  }

  private async sendPush(userId: string, title: string, _body: string): Promise<void> {
    // TODO: Integrate with Firebase Cloud Messaging
    this.logger.info(`[PUSH] User: ${userId} | Title: ${title}`, { channel: 'push' });
  }
}
