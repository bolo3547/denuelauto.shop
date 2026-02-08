/**
 * Shared notification utilities for Next.js API routes (pages/).
 * Mirrors src/utils/notifications.ts but is importable from the pages directory.
 */
import nodemailer from 'nodemailer';
import prisma from './prismaClient';

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
 * Create in-app notification record
 */
export async function createNotification(
  tenantId: string,
  type: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.hqnotification.create({
      data: {
        tenantId,
        message: `${title}: ${message}`,
      },
    });
  } catch (err) {
    console.error('[NOTIFICATION CREATE ERROR]', err);
  }
}

/**
 * Send notification to a user (in-app + email if configured)
 */
export async function notifyAgent(
  tenantId: string,
  agentId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // Create in-app notification
  await createNotification(tenantId, 'agent_notification', title, message, metadata);

  // Look up agent email to send email notification
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { email: true, name: true },
    });

    if (agent?.email) {
      await sendEmail(
        agent.email,
        title,
        `<h2>${title}</h2><p>${message}</p>`,
      );
    }
  } catch (err) {
    console.error('[NOTIFY AGENT ERROR]', err);
  }
}

/**
 * Send notification to a customer via email
 */
export async function notifyCustomer(
  email: string,
  title: string,
  message: string
): Promise<void> {
  await sendEmail(email, title, `<h2>${title}</h2><p>${message}</p>`);
}

// Notification event templates
export const NotificationTemplates = {
  leadAssigned: (leadName: string, agentName: string) => ({
    title: 'New Lead Assigned',
    message: `Lead "${leadName}" has been assigned to you.`,
  }),

  leadReassigned: (leadName: string, fromAgent: string, toAgent: string) => ({
    title: 'Lead Reassigned',
    message: `Lead "${leadName}" has been reassigned from ${fromAgent} to ${toAgent}.`,
  }),

  leadStatusChanged: (leadName: string, oldStatus: string, newStatus: string) => ({
    title: 'Lead Status Updated',
    message: `Lead "${leadName}" status changed from ${oldStatus} to ${newStatus}.`,
  }),

  agentWelcome: (agentName: string, tenantName: string) => ({
    title: `Welcome to ${tenantName}!`,
    message: `Hello ${agentName}, your agent account has been created. Log in to your portal to get started.`,
  }),

  appointmentConfirmation: (type: string, customerName: string, date: string, location: string) => ({
    title: 'Appointment Confirmed',
    message: `${type} appointment with ${customerName} scheduled for ${date} at ${location}.`,
  }),

  appointmentReminder: (type: string, customerName: string, date: string, location: string) => ({
    title: 'Appointment Reminder',
    message: `Reminder: You have a ${type.toLowerCase()} appointment with ${customerName} on ${date} at ${location}.`,
  }),

  appointmentCancelled: (type: string, customerName: string, date: string) => ({
    title: 'Appointment Cancelled',
    message: `The ${type.toLowerCase()} appointment with ${customerName} on ${date} has been cancelled.`,
  }),

  appointmentRescheduled: (type: string, customerName: string, oldDate: string, newDate: string) => ({
    title: 'Appointment Rescheduled',
    message: `The ${type.toLowerCase()} appointment with ${customerName} has been rescheduled from ${oldDate} to ${newDate}.`,
  }),
};

export default {
  sendEmail,
  sendSMS,
  createNotification,
  notifyAgent,
  notifyCustomer,
  NotificationTemplates,
};
