/**
 * Transactional Email Service
 * Send templated emails for various business events
 */

export type EmailProvider = 'sendgrid' | 'mailgun' | 'ses' | 'smtp' | 'resend';

export type EmailType =
  | 'welcome'
  | 'verification'
  | 'password_reset'
  | 'order_confirmation'
  | 'payment_received'
  | 'payment_reminder'
  | 'invoice'
  | 'quote'
  | 'reservation_confirmed'
  | 'reservation_expiring'
  | 'vehicle_alert'
  | 'test_drive_reminder'
  | 'shipment_update'
  | 'delivery_confirmation'
  | 'feedback_request'
  | 'newsletter';

export interface EmailProviderConfig {
  provider: EmailProvider;
  apiKey: string;
  domain?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: EmailAttachment[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider: EmailProvider;
  timestamp: Date;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailType;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables: string[];
}

// Email templates
export const EMAIL_TEMPLATES: Record<EmailType, EmailTemplate> = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    type: 'welcome',
    subject: 'Welcome to {{dealerName}}!',
    variables: ['customerName', 'dealerName', 'loginUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to {{dealerName}}!</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Thank you for joining {{dealerName}}! We're excited to help you find your perfect vehicle.</p>
    <p>With your account, you can:</p>
    <ul>
      <li>Browse our extensive inventory</li>
      <li>Save your favorite vehicles</li>
      <li>Track your orders and shipments</li>
      <li>Receive exclusive deals and alerts</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{loginUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse Vehicles</a>
    </div>
    <p>If you have any questions, feel free to reach out to our team.</p>
    <p>Best regards,<br>The {{dealerName}} Team</p>
  </div>
</body>
</html>`,
  },

  verification: {
    id: 'verification',
    name: 'Email Verification',
    type: 'verification',
    subject: 'Verify your email address',
    variables: ['customerName', 'verificationCode', 'verificationUrl', 'expiryMinutes'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; text-align: center;">
    <h1 style="color: #333;">Verify Your Email</h1>
    <p>Hi {{customerName}},</p>
    <p>Please use the following code to verify your email address:</p>
    <div style="background: #333; color: white; font-size: 32px; letter-spacing: 8px; padding: 20px; margin: 20px 0; border-radius: 5px;">
      {{verificationCode}}
    </div>
    <p style="color: #666; font-size: 14px;">This code expires in {{expiryMinutes}} minutes.</p>
    <p>Or click the button below:</p>
    <a href="{{verificationUrl}}" style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Verify Email</a>
  </div>
</body>
</html>`,
  },

  password_reset: {
    id: 'password_reset',
    name: 'Password Reset',
    type: 'password_reset',
    subject: 'Reset your password',
    variables: ['customerName', 'resetUrl', 'expiryMinutes'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
    <h1 style="color: #333;">Reset Your Password</h1>
    <p>Hi {{customerName}},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #666; font-size: 14px;">This link expires in {{expiryMinutes}} minutes.</p>
    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>`,
  },

  order_confirmation: {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    type: 'order_confirmation',
    subject: 'Order Confirmed - {{orderNumber}}',
    variables: ['customerName', 'orderNumber', 'vehicleName', 'vehicleImage', 'price', 'currency', 'orderUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #22c55e; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">✓ Order Confirmed!</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Great news! Your order has been confirmed.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #666;">Order Number</p>
      <p style="margin: 5px 0 15px; font-size: 20px; font-weight: bold;">{{orderNumber}}</p>
      {{#if vehicleImage}}
      <img src="{{vehicleImage}}" alt="{{vehicleName}}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">
      {{/if}}
      <p style="font-size: 18px; font-weight: bold; margin: 0;">{{vehicleName}}</p>
      <p style="font-size: 24px; color: #22c55e; margin: 10px 0;">{{currency}} {{price}}</p>
    </div>
    <div style="text-align: center;">
      <a href="{{orderUrl}}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
    </div>
  </div>
</body>
</html>`,
  },

  payment_received: {
    id: 'payment_received',
    name: 'Payment Received',
    type: 'payment_received',
    subject: 'Payment Received - {{currency}} {{amount}}',
    variables: ['customerName', 'amount', 'currency', 'paymentMethod', 'reference', 'orderNumber', 'receiptUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #22c55e; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💰 Payment Received</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>We've received your payment. Thank you!</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666;">Amount</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 18px;">{{currency}} {{amount}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Payment Method</td>
          <td style="padding: 10px 0; text-align: right;">{{paymentMethod}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Reference</td>
          <td style="padding: 10px 0; text-align: right; font-family: monospace;">{{reference}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Order</td>
          <td style="padding: 10px 0; text-align: right;">{{orderNumber}}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center;">
      <a href="{{receiptUrl}}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Receipt</a>
    </div>
  </div>
</body>
</html>`,
  },

  payment_reminder: {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    type: 'payment_reminder',
    subject: 'Payment Reminder - {{currency}} {{amount}} due {{dueDate}}',
    variables: ['customerName', 'amount', 'currency', 'dueDate', 'orderNumber', 'paymentUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f59e0b; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">⏰ Payment Reminder</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>This is a friendly reminder that your payment is due soon.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="color: #666; margin: 0;">Amount Due</p>
      <p style="font-size: 32px; font-weight: bold; color: #f59e0b; margin: 10px 0;">{{currency}} {{amount}}</p>
      <p style="color: #666; margin: 0;">Due Date: <strong>{{dueDate}}</strong></p>
    </div>
    <div style="text-align: center;">
      <a href="{{paymentUrl}}" style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Now</a>
    </div>
    <p style="color: #666; font-size: 14px; margin-top: 20px;">If you've already made this payment, please disregard this email.</p>
  </div>
</body>
</html>`,
  },

  invoice: {
    id: 'invoice',
    name: 'Invoice',
    type: 'invoice',
    subject: 'Invoice {{invoiceNumber}} from {{dealerName}}',
    variables: ['customerName', 'invoiceNumber', 'amount', 'currency', 'dueDate', 'dealerName', 'invoiceUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #3b82f6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">📄 Invoice</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Please find attached your invoice from {{dealerName}}.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666;">Invoice Number</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold;">{{invoiceNumber}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Amount</td>
          <td style="padding: 10px 0; text-align: right; font-size: 20px; color: #3b82f6;">{{currency}} {{amount}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Due Date</td>
          <td style="padding: 10px 0; text-align: right;">{{dueDate}}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center;">
      <a href="{{invoiceUrl}}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Invoice</a>
    </div>
  </div>
</body>
</html>`,
  },

  quote: {
    id: 'quote',
    name: 'Price Quote',
    type: 'quote',
    subject: 'Your Quote for {{vehicleName}}',
    variables: ['customerName', 'vehicleName', 'vehicleImage', 'price', 'currency', 'validUntil', 'quoteUrl', 'dealerName'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Price Quote</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Your Price Quote</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Thank you for your interest! Here's your personalized quote:</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      {{#if vehicleImage}}
      <img src="{{vehicleImage}}" alt="{{vehicleName}}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">
      {{/if}}
      <h2 style="margin: 0 0 10px;">{{vehicleName}}</h2>
      <p style="font-size: 28px; color: #667eea; font-weight: bold; margin: 0;">{{currency}} {{price}}</p>
      <p style="color: #666; font-size: 14px; margin-top: 10px;">Valid until: {{validUntil}}</p>
    </div>
    <div style="text-align: center;">
      <a href="{{quoteUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">View Quote</a>
      <a href="{{quoteUrl}}#reserve" style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reserve Now</a>
    </div>
  </div>
</body>
</html>`,
  },

  reservation_confirmed: {
    id: 'reservation_confirmed',
    name: 'Reservation Confirmed',
    type: 'reservation_confirmed',
    subject: 'Reservation Confirmed - {{vehicleName}}',
    variables: ['customerName', 'vehicleName', 'reservationRef', 'depositAmount', 'currency', 'expiryDate', 'reservationUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reservation Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #22c55e; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🎉 Reservation Confirmed!</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Great news! Your vehicle reservation has been confirmed.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666;">Vehicle</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold;">{{vehicleName}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Reference</td>
          <td style="padding: 10px 0; text-align: right; font-family: monospace;">{{reservationRef}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Deposit Paid</td>
          <td style="padding: 10px 0; text-align: right; color: #22c55e;">{{currency}} {{depositAmount}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Reserved Until</td>
          <td style="padding: 10px 0; text-align: right;">{{expiryDate}}</td>
        </tr>
      </table>
    </div>
    <p>We'll be in touch shortly to complete your purchase.</p>
    <div style="text-align: center;">
      <a href="{{reservationUrl}}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Reservation</a>
    </div>
  </div>
</body>
</html>`,
  },

  reservation_expiring: {
    id: 'reservation_expiring',
    name: 'Reservation Expiring',
    type: 'reservation_expiring',
    subject: '⏰ Your reservation expires soon - {{vehicleName}}',
    variables: ['customerName', 'vehicleName', 'reservationRef', 'expiryDate', 'hoursRemaining', 'reservationUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reservation Expiring</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f59e0b; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">⏰ Reservation Expiring Soon</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Your reservation for <strong>{{vehicleName}}</strong> is expiring soon!</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="font-size: 48px; font-weight: bold; color: #f59e0b; margin: 0;">{{hoursRemaining}}</p>
      <p style="color: #666; margin: 0;">hours remaining</p>
      <p style="margin-top: 15px; color: #666;">Expires: {{expiryDate}}</p>
    </div>
    <p>Complete your purchase to secure this vehicle before it's available to other buyers.</p>
    <div style="text-align: center;">
      <a href="{{reservationUrl}}" style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Purchase</a>
    </div>
  </div>
</body>
</html>`,
  },

  vehicle_alert: {
    id: 'vehicle_alert',
    name: 'Vehicle Alert',
    type: 'vehicle_alert',
    subject: '🚗 New {{make}} {{model}} matching your search!',
    variables: ['customerName', 'make', 'model', 'year', 'price', 'currency', 'vehicleImage', 'vehicleUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vehicle Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🚗 New Vehicle Alert!</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>A vehicle matching your saved search has just arrived!</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      {{#if vehicleImage}}
      <img src="{{vehicleImage}}" alt="{{make}} {{model}}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">
      {{/if}}
      <h2 style="margin: 0;">{{year}} {{make}} {{model}}</h2>
      <p style="font-size: 24px; color: #667eea; font-weight: bold; margin: 10px 0;">{{currency}} {{price}}</p>
    </div>
    <div style="text-align: center;">
      <a href="{{vehicleUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Vehicle</a>
    </div>
  </div>
</body>
</html>`,
  },

  test_drive_reminder: {
    id: 'test_drive_reminder',
    name: 'Test Drive Reminder',
    type: 'test_drive_reminder',
    subject: 'Reminder: Test drive tomorrow - {{vehicleName}}',
    variables: ['customerName', 'vehicleName', 'date', 'time', 'location', 'dealerName', 'dealerPhone'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Drive Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #3b82f6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🚗 Test Drive Reminder</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>This is a friendly reminder about your upcoming test drive.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666;">Vehicle</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold;">{{vehicleName}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Date</td>
          <td style="padding: 10px 0; text-align: right;">{{date}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Time</td>
          <td style="padding: 10px 0; text-align: right;">{{time}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Location</td>
          <td style="padding: 10px 0; text-align: right;">{{location}}</td>
        </tr>
      </table>
    </div>
    <p>Please bring a valid driver's license. If you need to reschedule, call us at <strong>{{dealerPhone}}</strong>.</p>
    <p>See you soon!</p>
    <p>— {{dealerName}}</p>
  </div>
</body>
</html>`,
  },

  shipment_update: {
    id: 'shipment_update',
    name: 'Shipment Update',
    type: 'shipment_update',
    subject: '📦 Shipment Update - {{status}}',
    variables: ['customerName', 'vehicleName', 'status', 'location', 'estimatedDelivery', 'trackingUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shipment Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #06b6d4; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">📦 Shipment Update</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Here's an update on your shipment:</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-size: 20px; color: #06b6d4; font-weight: bold; margin: 0 0 15px;">{{status}}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666;">Vehicle</td>
          <td style="padding: 10px 0; text-align: right;">{{vehicleName}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Current Location</td>
          <td style="padding: 10px 0; text-align: right;">{{location}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Est. Delivery</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold;">{{estimatedDelivery}}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center;">
      <a href="{{trackingUrl}}" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Shipment</a>
    </div>
  </div>
</body>
</html>`,
  },

  delivery_confirmation: {
    id: 'delivery_confirmation',
    name: 'Delivery Confirmation',
    type: 'delivery_confirmation',
    subject: '🎉 Your vehicle has been delivered!',
    variables: ['customerName', 'vehicleName', 'deliveryDate', 'feedbackUrl', 'dealerName'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Delivery Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #22c55e; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Your <strong>{{vehicleName}}</strong> has been delivered! We hope you love your new vehicle.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="font-size: 48px; margin: 0;">🚗</p>
      <p style="font-size: 20px; font-weight: bold; margin: 10px 0;">{{vehicleName}}</p>
      <p style="color: #666;">Delivered on {{deliveryDate}}</p>
    </div>
    <p>We'd love to hear about your experience. Your feedback helps us serve you better!</p>
    <div style="text-align: center;">
      <a href="{{feedbackUrl}}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Leave a Review</a>
    </div>
    <p style="margin-top: 20px;">Thank you for choosing {{dealerName}}!</p>
  </div>
</body>
</html>`,
  },

  feedback_request: {
    id: 'feedback_request',
    name: 'Feedback Request',
    type: 'feedback_request',
    subject: 'How was your experience with {{dealerName}}?',
    variables: ['customerName', 'dealerName', 'feedbackUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Feedback Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f59e0b; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">⭐ We Value Your Feedback</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{customerName}},</p>
    <p>Thank you for choosing {{dealerName}}! We hope you're enjoying your vehicle.</p>
    <p>Your feedback is incredibly important to us. Would you take a moment to share your experience?</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{feedbackUrl}}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Share Your Feedback</a>
    </div>
    <p>Thank you for your time!</p>
  </div>
</body>
</html>`,
  },

  newsletter: {
    id: 'newsletter',
    name: 'Newsletter',
    type: 'newsletter',
    subject: '{{subject}}',
    variables: ['customerName', 'subject', 'content', 'unsubscribeUrl'],
    htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Newsletter</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
    <p>Hi {{customerName}},</p>
    {{{content}}}
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`,
  },
};

/**
 * Render template with variables
 */
export function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  // Handle {{#if variable}}...{{/if}} blocks
  rendered = rendered.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variable, content) => {
    return data[variable] ? content : '';
  });
  
  // Handle {{{variable}}} (unescaped)
  rendered = rendered.replace(/\{\{\{(\w+)\}\}\}/g, (match, variable) => {
    return data[variable] !== undefined ? String(data[variable]) : '';
  });
  
  // Handle {{variable}} (escaped)
  rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    const value = data[variable];
    if (value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  });
  
  return rendered;
}

/**
 * Email Service Class
 */
export class EmailService {
  private config: EmailProviderConfig;

  constructor(config: EmailProviderConfig) {
    this.config = config;
  }

  /**
   * Send an email
   */
  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return this.sendViaSendGrid(message);
        case 'resend':
          return this.sendViaResend(message);
        case 'mailgun':
          return this.sendViaMailgun(message);
        default:
          return this.sendGeneric(message);
      }
    } catch (error) {
      return {
        success: false,
        provider: this.config.provider,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send templated email
   */
  async sendTemplate(
    type: EmailType,
    to: string | string[],
    data: Record<string, any>
  ): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES[type];
    if (!template) {
      return {
        success: false,
        provider: this.config.provider,
        timestamp: new Date(),
        error: `Template '${type}' not found`,
      };
    }

    const subject = renderTemplate(template.subject, data);
    const html = renderTemplate(template.htmlTemplate, data);
    const text = template.textTemplate 
      ? renderTemplate(template.textTemplate, data)
      : html.replace(/<[^>]*>/g, '').trim();

    return this.send({
      to,
      subject,
      html,
      text,
      tags: [type],
      metadata: { templateType: type },
    });
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(message: EmailMessage): Promise<EmailResult> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    
    const payload = {
      personalizations: [{
        to: recipients.map(email => ({ email })),
        ...(message.cc && { cc: message.cc.map(email => ({ email })) }),
        ...(message.bcc && { bcc: message.bcc.map(email => ({ email })) }),
      }],
      from: { email: this.config.fromEmail, name: this.config.fromName },
      reply_to: message.replyTo ? { email: message.replyTo } : undefined,
      subject: message.subject,
      content: [
        ...(message.text ? [{ type: 'text/plain', value: message.text }] : []),
        ...(message.html ? [{ type: 'text/html', value: message.html }] : []),
      ],
      ...(message.attachments && {
        attachments: message.attachments.map(att => ({
          content: typeof att.content === 'string' 
            ? att.content 
            : att.content.toString('base64'),
          filename: att.filename,
          type: att.contentType,
        })),
      }),
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined,
        provider: 'sendgrid',
        timestamp: new Date(),
      };
    }

    const error = await response.text();
    return {
      success: false,
      provider: 'sendgrid',
      timestamp: new Date(),
      error,
    };
  }

  /**
   * Send via Resend
   */
  private async sendViaResend(message: EmailMessage): Promise<EmailResult> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: recipients,
        cc: message.cc,
        bcc: message.bcc,
        reply_to: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.id,
        provider: 'resend',
        timestamp: new Date(),
      };
    }

    return {
      success: false,
      provider: 'resend',
      timestamp: new Date(),
      error: data.message || 'Failed to send',
    };
  }

  /**
   * Send via Mailgun
   */
  private async sendViaMailgun(message: EmailMessage): Promise<EmailResult> {
    const recipients = Array.isArray(message.to) ? message.to.join(',') : message.to;
    const domain = this.config.domain;

    const formData = new URLSearchParams();
    formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
    formData.append('to', recipients);
    formData.append('subject', message.subject);
    if (message.html) formData.append('html', message.html);
    if (message.text) formData.append('text', message.text);
    if (message.replyTo) formData.append('h:Reply-To', message.replyTo);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${this.config.apiKey}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.id,
        provider: 'mailgun',
        timestamp: new Date(),
      };
    }

    return {
      success: false,
      provider: 'mailgun',
      timestamp: new Date(),
      error: data.message || 'Failed to send',
    };
  }

  /**
   * Generic send (placeholder)
   */
  private async sendGeneric(message: EmailMessage): Promise<EmailResult> {
    console.log('Email would be sent:', {
      to: message.to,
      subject: message.subject,
    });

    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      provider: this.config.provider,
      timestamp: new Date(),
    };
  }
}

export default EmailService;
