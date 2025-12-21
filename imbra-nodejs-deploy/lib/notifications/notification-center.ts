/**
 * Notification Center Service
 * In-app notifications with real-time updates, preferences, and batching
 */

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push' | 'whatsapp';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export type NotificationType =
  // Vehicle & Inventory
  | 'new_vehicle_match'
  | 'price_drop'
  | 'vehicle_sold'
  | 'low_inventory_alert'
  // Orders & Payments
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'payment_received'
  | 'payment_failed'
  | 'payment_reminder'
  | 'installment_due'
  // Reservations
  | 'reservation_confirmed'
  | 'reservation_expiring'
  | 'reservation_cancelled'
  // Test Drives & Appointments
  | 'test_drive_scheduled'
  | 'test_drive_reminder'
  | 'appointment_reminder'
  // Leads & CRM
  | 'new_lead'
  | 'lead_followup_due'
  | 'lead_converted'
  // Reviews & Feedback
  | 'new_review'
  | 'review_response'
  // System
  | 'system_alert'
  | 'security_alert'
  | 'welcome'
  | 'general';

export interface NotificationAction {
  label: string;
  url: string;
  primary?: boolean;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  channels: NotificationChannel[];
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  groupId?: string;
  relatedId?: string;
  relatedType?: string;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  tenantId: string;
  channels: {
    in_app: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  types: Partial<Record<NotificationType, {
    enabled: boolean;
    channels: NotificationChannel[];
  }>>;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
    timezone: string;
  };
  digestFrequency: 'instant' | 'hourly' | 'daily' | 'weekly';
}

export interface NotificationGroup {
  id: string;
  type: NotificationType;
  count: number;
  latestNotification: Notification;
  notifications: Notification[];
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Notification icons and colors
export const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string;
  color: string;
  defaultChannels: NotificationChannel[];
}> = {
  // Vehicle & Inventory
  new_vehicle_match: { icon: '🚗', color: '#3b82f6', defaultChannels: ['in_app', 'email'] },
  price_drop: { icon: '💰', color: '#22c55e', defaultChannels: ['in_app', 'email', 'push'] },
  vehicle_sold: { icon: '🏷️', color: '#f59e0b', defaultChannels: ['in_app'] },
  low_inventory_alert: { icon: '📦', color: '#ef4444', defaultChannels: ['in_app', 'email'] },
  
  // Orders & Payments
  order_placed: { icon: '📝', color: '#3b82f6', defaultChannels: ['in_app', 'email'] },
  order_confirmed: { icon: '✅', color: '#22c55e', defaultChannels: ['in_app', 'email', 'sms'] },
  order_shipped: { icon: '🚚', color: '#06b6d4', defaultChannels: ['in_app', 'email', 'sms'] },
  order_delivered: { icon: '🎉', color: '#22c55e', defaultChannels: ['in_app', 'email', 'sms'] },
  payment_received: { icon: '💳', color: '#22c55e', defaultChannels: ['in_app', 'email'] },
  payment_failed: { icon: '❌', color: '#ef4444', defaultChannels: ['in_app', 'email', 'sms'] },
  payment_reminder: { icon: '⏰', color: '#f59e0b', defaultChannels: ['in_app', 'email', 'sms'] },
  installment_due: { icon: '📅', color: '#f59e0b', defaultChannels: ['in_app', 'email', 'sms'] },
  
  // Reservations
  reservation_confirmed: { icon: '🔒', color: '#22c55e', defaultChannels: ['in_app', 'email', 'sms'] },
  reservation_expiring: { icon: '⏳', color: '#f59e0b', defaultChannels: ['in_app', 'email', 'sms', 'push'] },
  reservation_cancelled: { icon: '🚫', color: '#ef4444', defaultChannels: ['in_app', 'email'] },
  
  // Test Drives & Appointments
  test_drive_scheduled: { icon: '🗓️', color: '#3b82f6', defaultChannels: ['in_app', 'email'] },
  test_drive_reminder: { icon: '🚗', color: '#f59e0b', defaultChannels: ['in_app', 'sms', 'push'] },
  appointment_reminder: { icon: '📅', color: '#f59e0b', defaultChannels: ['in_app', 'sms'] },
  
  // Leads & CRM
  new_lead: { icon: '👤', color: '#8b5cf6', defaultChannels: ['in_app', 'push'] },
  lead_followup_due: { icon: '📞', color: '#f59e0b', defaultChannels: ['in_app', 'push'] },
  lead_converted: { icon: '🎯', color: '#22c55e', defaultChannels: ['in_app'] },
  
  // Reviews & Feedback
  new_review: { icon: '⭐', color: '#f59e0b', defaultChannels: ['in_app', 'email'] },
  review_response: { icon: '💬', color: '#3b82f6', defaultChannels: ['in_app', 'email'] },
  
  // System
  system_alert: { icon: '⚠️', color: '#f59e0b', defaultChannels: ['in_app'] },
  security_alert: { icon: '🔐', color: '#ef4444', defaultChannels: ['in_app', 'email', 'sms'] },
  welcome: { icon: '👋', color: '#8b5cf6', defaultChannels: ['in_app', 'email'] },
  general: { icon: '📢', color: '#6b7280', defaultChannels: ['in_app'] },
};

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if current time is within quiet hours
 */
function isQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
  if (!quietHours?.enabled) return false;
  
  const now = new Date();
  const [startHour, startMin] = quietHours.start.split(':').map(Number);
  const [endHour, endMin] = quietHours.end.split(':').map(Number);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Quiet hours span midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

/**
 * Notification Center Class
 */
export class NotificationCenter {
  private tenantId: string;
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private subscribers: Map<string, Set<(notification: Notification) => void>> = new Map();

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Create and send a notification
   */
  async notify(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    actions?: NotificationAction[];
    metadata?: Record<string, any>;
    relatedId?: string;
    relatedType?: string;
    groupId?: string;
    expiresAt?: Date;
  }): Promise<Notification> {
    const config = NOTIFICATION_CONFIG[params.type];
    const userPrefs = this.preferences.get(params.userId);
    
    // Determine channels based on preferences
    let channels = params.channels || config.defaultChannels;
    
    if (userPrefs) {
      const typePrefs = userPrefs.types[params.type];
      if (typePrefs && !typePrefs.enabled) {
        channels = []; // User disabled this notification type
      } else if (typePrefs?.channels) {
        channels = typePrefs.channels.filter(ch => userPrefs.channels[ch]);
      } else {
        channels = channels.filter(ch => userPrefs.channels[ch]);
      }
      
      // Check quiet hours (except for urgent notifications)
      if (params.priority !== 'urgent' && isQuietHours(userPrefs.quietHours)) {
        channels = channels.filter(ch => ch === 'in_app'); // Only in-app during quiet hours
      }
    }

    const notification: Notification = {
      id: generateNotificationId(),
      tenantId: this.tenantId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      icon: config.icon,
      priority: params.priority || 'normal',
      status: 'unread',
      channels,
      actions: params.actions,
      metadata: params.metadata,
      relatedId: params.relatedId,
      relatedType: params.relatedType,
      groupId: params.groupId,
      expiresAt: params.expiresAt,
      createdAt: new Date(),
    };

    // Store notification
    this.notifications.set(notification.id, notification);

    // Notify subscribers (for real-time updates)
    const userSubscribers = this.subscribers.get(params.userId);
    if (userSubscribers) {
      userSubscribers.forEach(callback => callback(notification));
    }

    // Send through channels
    await this.sendToChannels(notification, channels);

    return notification;
  }

  /**
   * Send notification through specified channels
   */
  private async sendToChannels(
    notification: Notification,
    channels: NotificationChannel[]
  ): Promise<void> {
    const promises = channels.map(async (channel) => {
      switch (channel) {
        case 'in_app':
          // Already stored in notifications map
          return;
        case 'email':
          // Call email service
          console.log(`Would send email for: ${notification.title}`);
          return;
        case 'sms':
          // Call SMS service
          console.log(`Would send SMS for: ${notification.title}`);
          return;
        case 'push':
          // Call push notification service
          console.log(`Would send push for: ${notification.title}`);
          return;
        case 'whatsapp':
          // Call WhatsApp service
          console.log(`Would send WhatsApp for: ${notification.title}`);
          return;
      }
    });

    await Promise.all(promises);
  }

  /**
   * Get notifications for a user
   */
  getNotifications(userId: string, options?: {
    status?: NotificationStatus;
    type?: NotificationType;
    priority?: NotificationPriority;
    limit?: number;
    offset?: number;
    grouped?: boolean;
  }): Notification[] | NotificationGroup[] {
    let notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.tenantId === this.tenantId);

    // Apply filters
    if (options?.status) {
      notifications = notifications.filter(n => n.status === options.status);
    }
    if (options?.type) {
      notifications = notifications.filter(n => n.type === options.type);
    }
    if (options?.priority) {
      notifications = notifications.filter(n => n.priority === options.priority);
    }

    // Filter out expired
    notifications = notifications.filter(n => !n.expiresAt || n.expiresAt > new Date());

    // Sort by date (newest first) and priority
    notifications.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Group notifications if requested
    if (options?.grouped) {
      const groups = new Map<string, NotificationGroup>();
      
      notifications.forEach(notification => {
        const groupKey = notification.groupId || `${notification.type}_${notification.relatedId || 'general'}`;
        
        if (groups.has(groupKey)) {
          const group = groups.get(groupKey)!;
          group.count++;
          group.notifications.push(notification);
          if (notification.createdAt > group.latestNotification.createdAt) {
            group.latestNotification = notification;
          }
        } else {
          groups.set(groupKey, {
            id: groupKey,
            type: notification.type,
            count: 1,
            latestNotification: notification,
            notifications: [notification],
          });
        }
      });

      return Array.from(groups.values());
    }

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    
    return notifications.slice(offset, offset + limit);
  }

  /**
   * Get notification statistics
   */
  getStats(userId: string): NotificationStats {
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.tenantId === this.tenantId)
      .filter(n => !n.expiresAt || n.expiresAt > new Date());

    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      byType: {} as Record<NotificationType, number>,
      byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
    };

    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byPriority[n.priority]++;
    });

    return stats;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string, userId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) return false;

    notification.status = 'read';
    notification.readAt = new Date();
    return true;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: string): number {
    let count = 0;
    this.notifications.forEach((notification) => {
      if (notification.userId === userId && notification.status === 'unread') {
        notification.status = 'read';
        notification.readAt = new Date();
        count++;
      }
    });
    return count;
  }

  /**
   * Archive notification
   */
  archive(notificationId: string, userId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) return false;

    notification.status = 'archived';
    return true;
  }

  /**
   * Delete notification
   */
  delete(notificationId: string, userId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) return false;

    return this.notifications.delete(notificationId);
  }

  /**
   * Update user preferences
   */
  setPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const existing = this.preferences.get(userId) || this.getDefaultPreferences(userId);
    this.preferences.set(userId, { ...existing, ...preferences });
  }

  /**
   * Get user preferences
   */
  getPreferences(userId: string): NotificationPreferences {
    return this.preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      tenantId: this.tenantId,
      channels: {
        in_app: true,
        email: true,
        sms: true,
        push: true,
        whatsapp: false,
      },
      types: {},
      digestFrequency: 'instant',
    };
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(userId)?.delete(callback);
    };
  }

  /**
   * Send bulk notification to multiple users
   */
  async notifyBulk(params: {
    userIds: string[];
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
  }): Promise<Notification[]> {
    const notifications = await Promise.all(
      params.userIds.map(userId => this.notify({
        userId,
        type: params.type,
        title: params.title,
        message: params.message,
        priority: params.priority,
        channels: params.channels,
      }))
    );
    return notifications;
  }

  /**
   * Clean up expired notifications
   */
  cleanupExpired(): number {
    let count = 0;
    const now = new Date();
    
    this.notifications.forEach((notification, id) => {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.notifications.delete(id);
        count++;
      }
    });

    return count;
  }
}

// Pre-built notification helpers
export const NotificationHelpers = {
  /**
   * New vehicle matching user's saved search
   */
  newVehicleMatch: (center: NotificationCenter, userId: string, vehicle: {
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;
    url: string;
  }) => center.notify({
    userId,
    type: 'new_vehicle_match',
    title: `New ${vehicle.year} ${vehicle.make} ${vehicle.model}!`,
    message: `A vehicle matching your search is now available for ${vehicle.currency} ${vehicle.price.toLocaleString()}`,
    priority: 'normal',
    actions: [
      { label: 'View Vehicle', url: vehicle.url, primary: true },
    ],
    metadata: vehicle,
  }),

  /**
   * Price drop notification
   */
  priceDrop: (center: NotificationCenter, userId: string, vehicle: {
    name: string;
    oldPrice: number;
    newPrice: number;
    currency: string;
    url: string;
  }) => center.notify({
    userId,
    type: 'price_drop',
    title: `Price Drop: ${vehicle.name}`,
    message: `Price reduced from ${vehicle.currency} ${vehicle.oldPrice.toLocaleString()} to ${vehicle.currency} ${vehicle.newPrice.toLocaleString()}!`,
    priority: 'high',
    actions: [
      { label: 'View Deal', url: vehicle.url, primary: true },
    ],
    metadata: vehicle,
  }),

  /**
   * Payment reminder
   */
  paymentReminder: (center: NotificationCenter, userId: string, payment: {
    amount: number;
    currency: string;
    dueDate: Date;
    orderNumber: string;
    paymentUrl: string;
  }) => center.notify({
    userId,
    type: 'payment_reminder',
    title: 'Payment Reminder',
    message: `${payment.currency} ${payment.amount.toLocaleString()} due on ${payment.dueDate.toLocaleDateString()} for order ${payment.orderNumber}`,
    priority: 'high',
    actions: [
      { label: 'Pay Now', url: payment.paymentUrl, primary: true },
    ],
    relatedId: payment.orderNumber,
    relatedType: 'order',
    metadata: payment,
  }),

  /**
   * Reservation expiring
   */
  reservationExpiring: (center: NotificationCenter, userId: string, reservation: {
    vehicleName: string;
    expiresAt: Date;
    hoursRemaining: number;
    reservationUrl: string;
  }) => center.notify({
    userId,
    type: 'reservation_expiring',
    title: 'Reservation Expiring Soon!',
    message: `Your reservation for ${reservation.vehicleName} expires in ${reservation.hoursRemaining} hours`,
    priority: 'urgent',
    actions: [
      { label: 'Complete Purchase', url: reservation.reservationUrl, primary: true },
    ],
    metadata: reservation,
  }),

  /**
   * New lead for sales team
   */
  newLead: (center: NotificationCenter, userId: string, lead: {
    customerName: string;
    source: string;
    vehicleInterest?: string;
    leadUrl: string;
  }) => center.notify({
    userId,
    type: 'new_lead',
    title: 'New Lead',
    message: `${lead.customerName} from ${lead.source}${lead.vehicleInterest ? ` interested in ${lead.vehicleInterest}` : ''}`,
    priority: 'high',
    actions: [
      { label: 'View Lead', url: lead.leadUrl, primary: true },
    ],
    metadata: lead,
  }),

  /**
   * Security alert
   */
  securityAlert: (center: NotificationCenter, userId: string, alert: {
    action: string;
    device: string;
    location: string;
    timestamp: Date;
    actionUrl: string;
  }) => center.notify({
    userId,
    type: 'security_alert',
    title: 'Security Alert',
    message: `${alert.action} detected from ${alert.device} in ${alert.location}`,
    priority: 'urgent',
    actions: [
      { label: 'Review Activity', url: alert.actionUrl, primary: true },
      { label: 'Secure Account', url: `${alert.actionUrl}?action=secure` },
    ],
    metadata: alert,
  }),
};

export default NotificationCenter;
