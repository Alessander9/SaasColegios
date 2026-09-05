import { NotificationService } from './notification.service';
import { db } from '@cole/database';
import { NotificationChannel } from './dto/notification.dto';

jest.mock('@cole/database', () => ({
  db: {
    user: {
      findFirst: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  NotificationStatus: {
    PENDING: 'PENDING',
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    FAILED: 'FAILED',
    READ: 'READ',
  },
  NotificationChannel: {
    EMAIL: 'EMAIL',
    SMS: 'SMS',
    PUSH: 'PUSH',
    IN_APP: 'IN_APP',
  },
}));

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
  });

  describe('sendNotification', () => {
    it('should create notification and mark as SENT on successful dispatch', async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      (db.notification.create as jest.Mock).mockResolvedValue({
        id: 'notif-1',
        tenantId: 'tenant-1',
        channel: 'EMAIL' as any,
        status: 'PENDING',
      });
      (db.notification.update as jest.Mock).mockResolvedValue({});

      const result = await service.sendNotification('tenant-1', {
        recipientId: 'user-1',
        channel: NotificationChannel.EMAIL,
        subject: 'Test Subject',
        body: 'Test body',
      });

      expect(result.status).toBe('SENT');
      expect(db.notification.create).toHaveBeenCalled();
      expect(db.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'SENT' }),
        }),
      );
    });

    it('should mark as FAILED when dispatch throws', async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: null,
        firstName: 'Test',
        lastName: 'User',
      });
      (db.notification.create as jest.Mock).mockResolvedValue({
        id: 'notif-2',
        tenantId: 'tenant-1',
        channel: 'SMS' as any,
        status: 'PENDING',
      });
      (db.notification.update as jest.Mock).mockResolvedValue({});

      await service.sendNotification('tenant-1', {
        recipientId: 'user-1',
        channel: NotificationChannel.SMS,
        subject: 'SMS Test',
        body: 'Hello',
      });

      expect(db.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
    });

    it('should throw NotFoundException when recipient not found', async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.sendNotification('tenant-1', {
          recipientId: 'nonexistent',
          channel: NotificationChannel.EMAIL,
          subject: 'Test',
          body: 'Test',
        }),
      ).rejects.toThrow('Recipient user not found');
    });

    it('should handle IN_APP notifications without external dispatch', async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      (db.notification.create as jest.Mock).mockResolvedValue({
        id: 'notif-3',
        tenantId: 'tenant-1',
        channel: 'IN_APP' as any,
        status: 'PENDING',
      });
      (db.notification.update as jest.Mock).mockResolvedValue({});

      await service.sendNotification('tenant-1', {
        recipientId: 'user-1',
        channel: NotificationChannel.IN_APP,
        subject: 'In-App',
        body: 'You have a new message',
      });

      // IN_APP should succeed without external dispatch
      expect(db.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'SENT' }),
        }),
      );
    });
  });

  describe('sendBulkNotification', () => {
    it('should send to all recipients and return results', async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      (db.notification.create as jest.Mock).mockResolvedValue({
        id: 'notif-bulk',
        status: 'PENDING',
      });
      (db.notification.update as jest.Mock).mockResolvedValue({});

      const result = await service.sendBulkNotification('tenant-1', {
        recipientIds: ['user-1', 'user-2'],
        channel: NotificationChannel.EMAIL,
        subject: 'Bulk Notice',
        body: 'Important announcement',
      });

      expect(result.totalSent).toBe(2);
      expect(result.results).toHaveLength(2);
    });
  });

  describe('getNotifications', () => {
    it('should return notifications with filters', async () => {
      (db.notification.findMany as jest.Mock).mockResolvedValue([
        { id: 'n1', channel: 'EMAIL' as any, status: 'SENT' },
      ]);

      const result = await service.getNotifications('tenant-1', 'user-1', {
        channel: 'EMAIL' as any,
      });

      expect(result).toHaveLength(1);
      expect(db.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ channel: 'EMAIL' }),
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      (db.notification.findFirst as jest.Mock).mockResolvedValue({ id: 'n1', status: 'SENT' });
      (db.notification.update as jest.Mock).mockResolvedValue({ id: 'n1', status: 'READ' });

      const result = await service.markAsRead('tenant-1', 'n1');

      expect(result.status).toBe('READ');
    });

    it('should throw when notification not found', async () => {
      (db.notification.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.markAsRead('tenant-1', 'nonexistent')).rejects.toThrow('Notification not found');
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      (db.notification.count as jest.Mock).mockResolvedValue(5);

      const result = await service.getUnreadCount('tenant-1', 'user-1');

      expect(result).toBe(5);
    });
  });

  describe('getNotificationStats', () => {
    it('should return delivery statistics', async () => {
      (db.notification.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { channel: 'EMAIL' as any, _count: 100 },
          { channel: 'SMS' as any, _count: 30 },
        ])
        .mockResolvedValueOnce([
          { status: 'SENT', _count: 120 },
          { status: 'FAILED', _count: 10 },
        ]);
      (db.notification.count as jest.Mock)
        .mockResolvedValueOnce(120) // sent
        .mockResolvedValueOnce(10); // failed

      const result = await service.getNotificationStats('tenant-1');

      expect(result.total).toBe(130);
      expect(result.totalSent).toBe(120);
      expect(result.totalFailed).toBe(10);
      expect(result.deliveryRate).toBe(92.3);
      expect(result.byChannel).toHaveLength(2);
      expect(result.byStatus).toHaveLength(2);
    });
  });
});
