import { describe, it, expect, beforeEach } from "vitest";
import { NotificationService } from "./notificationService";

describe("NotificationService", () => {
  let service: NotificationService;
  const userId = 1;

  beforeEach(() => {
    service = new NotificationService();
  });

  describe("Send Notifications", () => {
    it("should send a notification", () => {
      const notification = service.sendNotification(userId, "alert", "Test Alert", "This is a test alert");

      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe("alert");
      expect(notification.title).toBe("Test Alert");
      expect(notification.message).toBe("This is a test alert");
      expect(notification.read).toBe(false);
    });

    it("should send trade executed notification", () => {
      const notification = service.notifyTradeExecuted(userId, "BTC", "buy", 10, 45000);

      expect(notification.type).toBe("trade_executed");
      expect(notification.title).toContain("BUY");
      expect(notification.data?.ticker).toBe("BTC");
      expect(notification.data?.quantity).toBe(10);
    });

    it("should send trade closed notification with profit", () => {
      const notification = service.notifyTradeClosed(userId, "BTC", 500, 5);

      expect(notification.type).toBe("profit_target");
      expect(notification.title).toBe("Position Closed");
      expect(notification.message).toContain("profit");
      expect(notification.data?.pnl).toBe(500);
    });

    it("should send trade closed notification with loss", () => {
      const notification = service.notifyTradeClosed(userId, "ETH", -300, -3);

      expect(notification.type).toBe("stop_loss");
      expect(notification.title).toBe("Position Closed");
      expect(notification.message).toContain("loss");
      expect(notification.data?.pnl).toBe(-300);
    });

    it("should send signal detected notification", () => {
      const notification = service.notifySignalDetected(userId, "BTC", "buy", 85);

      expect(notification.type).toBe("signal_detected");
      expect(notification.title).toContain("BUY");
      expect(notification.data?.signal).toBe("buy");
      expect(notification.data?.confidence).toBe(85);
    });
  });

  describe("Get Notifications", () => {
    it("should get all notifications for user", () => {
      service.sendNotification(userId, "alert", "Alert 1", "Message 1");
      service.sendNotification(userId, "alert", "Alert 2", "Message 2");

      const notifications = service.getNotifications(userId);
      expect(notifications).toHaveLength(2);
    });

    it("should get only unread notifications", () => {
      const notif1 = service.sendNotification(userId, "alert", "Alert 1", "Message 1");
      const notif2 = service.sendNotification(userId, "alert", "Alert 2", "Message 2");

      service.markAsRead(userId, notif1.id);

      const unreadNotifications = service.getNotifications(userId, true);
      expect(unreadNotifications).toHaveLength(1);
      expect(unreadNotifications[0]?.id).toBe(notif2.id);
    });

    it("should return empty array for user with no notifications", () => {
      const notifications = service.getNotifications(999);
      expect(notifications).toHaveLength(0);
    });
  });

  describe("Mark as Read", () => {
    it("should mark notification as read", () => {
      const notification = service.sendNotification(userId, "alert", "Test", "Message");
      expect(notification.read).toBe(false);

      service.markAsRead(userId, notification.id);

      const notifications = service.getNotifications(userId);
      expect(notifications[0]?.read).toBe(true);
    });

    it("should not throw error when marking non-existent notification", () => {
      expect(() => {
        service.markAsRead(userId, "non-existent-id");
      }).not.toThrow();
    });
  });

  describe("Clear Notifications", () => {
    it("should clear all notifications for user", () => {
      service.sendNotification(userId, "alert", "Alert 1", "Message 1");
      service.sendNotification(userId, "alert", "Alert 2", "Message 2");

      let notifications = service.getNotifications(userId);
      expect(notifications).toHaveLength(2);

      service.clearNotifications(userId);

      notifications = service.getNotifications(userId);
      expect(notifications).toHaveLength(0);
    });

    it("should not affect other users' notifications", () => {
      const userId2 = 2;

      service.sendNotification(userId, "alert", "Alert 1", "Message 1");
      service.sendNotification(userId2, "alert", "Alert 2", "Message 2");

      service.clearNotifications(userId);

      const user1Notifications = service.getNotifications(userId);
      const user2Notifications = service.getNotifications(userId2);

      expect(user1Notifications).toHaveLength(0);
      expect(user2Notifications).toHaveLength(1);
    });
  });
});
