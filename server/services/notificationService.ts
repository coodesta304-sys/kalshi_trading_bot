/**
 * Notification Service
 * Sends notifications to users for trading events
 */

export interface Notification {
  id: string;
  userId: number;
  type: "trade_executed" | "trade_closed" | "signal_detected" | "alert" | "profit_target" | "stop_loss";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private notifications: Map<number, Notification[]> = new Map();

  /**
   * Send notification to user
   */
  sendNotification(
    userId: number,
    type: Notification["type"],
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date(),
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    this.notifications.get(userId)!.push(notification);

    // Log notification
    console.log(`[Notification] ${type} for user ${userId}: ${title}`);

    return notification;
  }

  /**
   * Get notifications for user
   */
  getNotifications(userId: number, unreadOnly: boolean = false): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];

    if (unreadOnly) {
      return userNotifications.filter((n) => !n.read);
    }

    return userNotifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: number, notificationId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return;

    const notification = userNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Clear all notifications for user
   */
  clearNotifications(userId: number): void {
    this.notifications.delete(userId);
  }

  /**
   * Send trade executed notification
   */
  notifyTradeExecuted(
    userId: number,
    ticker: string,
    action: "buy" | "sell",
    quantity: number,
    price: number
  ): Notification {
    return this.sendNotification(
      userId,
      "trade_executed",
      `${action.toUpperCase()} Order Executed`,
      `Successfully executed ${action} order: ${quantity} ${ticker} @ $${price.toFixed(2)}`,
      { ticker, action, quantity, price }
    );
  }

  /**
   * Send trade closed notification
   */
  notifyTradeClosed(
    userId: number,
    ticker: string,
    pnl: number,
    pnlPercent: number
  ): Notification {
    const type = pnl >= 0 ? "profit_target" : "stop_loss";
    const message = pnl >= 0
      ? `Position closed with profit: +$${pnl.toFixed(2)} (+${pnlPercent.toFixed(2)}%)`
      : `Position closed with loss: -$${Math.abs(pnl).toFixed(2)} (-${Math.abs(pnlPercent).toFixed(2)}%)`;

    return this.sendNotification(userId, type, "Position Closed", message, {
      ticker,
      pnl,
      pnlPercent,
    });
  }

  /**
   * Send signal detected notification
   */
  notifySignalDetected(userId: number, ticker: string, signal: "buy" | "sell", confidence: number): Notification {
    return this.sendNotification(
      userId,
      "signal_detected",
      `${signal.toUpperCase()} Signal Detected`,
      `Strong ${signal} signal detected for ${ticker} (Confidence: ${confidence.toFixed(0)}%)`,
      { ticker, signal, confidence }
    );
  }

  /**
   * Send alert notification
   */
  notifyAlert(userId: number, title: string, message: string, severity: "low" | "medium" | "high" = "medium"): Notification {
    return this.sendNotification(userId, "alert", title, message, { severity });
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
}
