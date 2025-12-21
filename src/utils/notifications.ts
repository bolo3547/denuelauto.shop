// @ts-nocheck
import nodemailer from 'nodemailer';
import { prisma } from '../config/db';

// Email transporter (configure via ENV)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email notification
 */
export async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  // Skip if no SMTP configured
  if (!process.env.SMTP_USER) {
    console.log('[EMAIL STUB]', to, subject);
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@dealership.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    console.log('[EMAIL SENT]', to, subject);
    return true;
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
    return false;
  }
}

/**
 * Send WhatsApp notification via Twilio or similar
 */
export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  // Skip if no WhatsApp provider configured
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.log('[WHATSAPP STUB]', to, message);
    return true;
  }

  try {
    // Twilio integration example
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log('[WHATSAPP SENT]', to);
    return true;
  } catch (err) {
    console.error('[WHATSAPP ERROR]', err);
    return false;
  }
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.log('[SMS STUB]', to, message);
    return true;
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      from: process.env.TWILIO_SMS_FROM,
      to,
      body: message,
    });
    console.log('[SMS SENT]', to);
    return true;
  } catch (err) {
    console.error('[SMS ERROR]', err);
    return false;
  }
}

/**
 * Create in-app notification for a user
 */
export async function createUserNotification(
  tenantId: string,
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  metadata?: any
): Promise<void> {
  try {
    await prisma.tenantNotification.create({
      data: {
        tenantId,
        type,
        title,
        message,
        data: { userId, link, ...metadata },
      },
    });
  } catch (err) {
    console.error('[NOTIFICATION CREATE ERROR]', err);
  }
}

/**
 * Create in-app notification for a buyer
 */
export async function createBuyerNotification(
  tenantId: string,
  buyerId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  metadata?: any
): Promise<void> {
  try {
    await prisma.tenantNotification.create({
      data: {
        tenantId,
        type,
        title,
        message,
        data: { buyerId, link, ...metadata },
      },
    });
  } catch (err) {
    console.error('[BUYER NOTIFICATION ERROR]', err);
  }
}

/**
 * Send notification to multiple channels based on user preferences
 */
export async function notifyUser(
  tenantId: string,
  userId: string,
  event: NotificationEvent
): Promise<void> {
  // Always create in-app notification
  await createUserNotification(tenantId, userId, event.type, event.title, event.message, event.link, event.metadata);

  // Look up user to get email/phone
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (user?.email && event.sendEmail !== false) {
    await sendEmail(user.email, event.title, event.message);
  }
}

/**
 * Send notification to a buyer based on their notification preferences
 */
export async function notifyBuyer(
  tenantId: string,
  buyerId: string,
  event: NotificationEvent
): Promise<void> {
  // Always create in-app notification
  await createBuyerNotification(tenantId, buyerId, event.type, event.title, event.message, event.link, event.metadata);

  // Look up buyer and their notification settings
  const buyer = await prisma.buyers.findUnique({
    where: { id: buyerId },
    select: { email: true, phone: true },
  });

  const settings = await prisma.buyer_notification_settings.findUnique({
    where: { buyerId },
  }).catch(() => null);

  // Default to all channels if no settings. Settings schema may vary; treat as any.
  const prefs = (settings as any) || { email: true, sms: true, whatsapp: true, push: true };

  if (buyer?.email && prefs.email && event.sendEmail !== false) {
    await sendEmail(buyer.email, event.title, event.message);
  }

  if (buyer?.phone && prefs.sms && event.sendSMS !== false) {
    await sendSMS(buyer.phone, event.message);
  }

  if (buyer?.phone && prefs.whatsapp && event.sendWhatsApp !== false) {
    await sendWhatsApp(buyer.phone, event.message);
  }
}

// Notification event types
export interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
  sendEmail?: boolean;
  sendSMS?: boolean;
  sendWhatsApp?: boolean;
}

// Pre-built notification templates
export const NotificationTemplates = {
  newLead: (leadName: string, carInfo: string) => ({
    type: 'new_lead',
    title: 'New Lead Received',
    message: `${leadName} expressed interest in ${carInfo}`,
  }),

  paymentReceived: (amount: number, currency: string, buyerName: string) => ({
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of ${currency} ${amount.toLocaleString()} received from ${buyerName}`,
  }),

  carSold: (stockNo: string, buyerName: string) => ({
    type: 'car_sold',
    title: 'Car Sold',
    message: `${stockNo} has been sold to ${buyerName}`,
  }),

  holdExpiring: (stockNo: string, hoursLeft: number) => ({
    type: 'hold_expiring',
    title: 'Hold Expiring Soon',
    message: `Hold on ${stockNo} expires in ${hoursLeft} hours`,
  }),

  orderStatusUpdate: (orderId: string, status: string) => ({
    type: 'order_status',
    title: 'Order Status Updated',
    message: `Order ${orderId} status changed to ${status}`,
  }),

  testDriveScheduled: (carInfo: string, date: string) => ({
    type: 'test_drive',
    title: 'Test Drive Scheduled',
    message: `Test drive for ${carInfo} scheduled for ${date}`,
  }),
};

export default {
  sendEmail,
  sendWhatsApp,
  sendSMS,
  createUserNotification,
  createBuyerNotification,
  notifyUser,
  notifyBuyer,
  NotificationTemplates,
};
