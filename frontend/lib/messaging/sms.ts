/**
 * SMS Notifications Service
 * Multi-provider SMS integration for OTPs, alerts, and marketing
 */

export type SMSProvider = 
  | 'twilio'
  | 'africas_talking'
  | 'nexmo'
  | 'infobip'
  | 'hubtel'
  | 'termii'
  | 'mnotify';

export type SMSType = 
  | 'otp'
  | 'transactional'
  | 'marketing'
  | 'alert';

export interface SMSProviderConfig {
  provider: SMSProvider;
  apiKey: string;
  apiSecret?: string;
  senderId: string;
  baseUrl: string;
  accountSid?: string;  // For Twilio
  username?: string;    // For Africa's Talking
}

export interface SMSMessage {
  to: string;
  message: string;
  type: SMSType;
  senderId?: string;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  provider: SMSProvider;
  status: 'sent' | 'queued' | 'failed';
  cost?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface SMSDeliveryStatus {
  messageId: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'rejected';
  deliveredAt?: Date;
  errorCode?: string;
}

// Provider configurations
export const SMS_PROVIDER_CONFIGS: Record<SMSProvider, Partial<SMSProviderConfig>> = {
  twilio: {
    provider: 'twilio',
    baseUrl: 'https://api.twilio.com/2010-04-01',
  },
  africas_talking: {
    provider: 'africas_talking',
    baseUrl: 'https://api.africastalking.com/version1',
  },
  nexmo: {
    provider: 'nexmo',
    baseUrl: 'https://rest.nexmo.com',
  },
  infobip: {
    provider: 'infobip',
    baseUrl: 'https://api.infobip.com',
  },
  hubtel: {
    provider: 'hubtel',
    baseUrl: 'https://smsc.hubtel.com/v1/messages',
  },
  termii: {
    provider: 'termii',
    baseUrl: 'https://api.ng.termii.com/api',
  },
  mnotify: {
    provider: 'mnotify',
    baseUrl: 'https://apps.mnotify.net/smsapi',
  },
};

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string, defaultCountryCode: string = '260'): string {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.substring(2);
  }
  
  if (cleaned.startsWith('0')) {
    return '+' + defaultCountryCode + cleaned.substring(1);
  }
  
  // Assume it needs country code
  if (!cleaned.startsWith(defaultCountryCode)) {
    return '+' + defaultCountryCode + cleaned;
  }
  
  return '+' + cleaned;
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): {
  valid: boolean;
  formatted?: string;
  error?: string;
} {
  const formatted = formatPhoneNumber(phone);
  
  // Basic E.164 validation
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  
  if (!e164Regex.test(formatted)) {
    return {
      valid: false,
      error: 'Invalid phone number format',
    };
  }
  
  return {
    valid: true,
    formatted,
  };
}

/**
 * Calculate SMS segments
 */
export function calculateSMSSegments(message: string): {
  segments: number;
  encoding: 'GSM-7' | 'UCS-2';
  charactersUsed: number;
  charactersPerSegment: number;
} {
  // GSM-7 character set (basic)
  const gsm7Chars = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
  
  // Check if message can be encoded in GSM-7
  const isGSM7 = [...message].every(char => gsm7Chars.includes(char));
  
  if (isGSM7) {
    const charsPerSegment = message.length <= 160 ? 160 : 153;
    return {
      segments: Math.ceil(message.length / charsPerSegment),
      encoding: 'GSM-7',
      charactersUsed: message.length,
      charactersPerSegment: charsPerSegment,
    };
  }
  
  // UCS-2 encoding for unicode
  const charsPerSegment = message.length <= 70 ? 70 : 67;
  return {
    segments: Math.ceil(message.length / charsPerSegment),
    encoding: 'UCS-2',
    charactersUsed: message.length,
    charactersPerSegment: charsPerSegment,
  };
}

/**
 * SMS Templates
 */
export const SMS_TEMPLATES = {
  // OTP Templates
  otp: {
    login: (code: string, expiry: number) => 
      `Your login code is ${code}. Valid for ${expiry} minutes. Do not share this code.`,
    
    verification: (code: string, expiry: number) =>
      `Your verification code is ${code}. It expires in ${expiry} minutes.`,
    
    passwordReset: (code: string, expiry: number) =>
      `Your password reset code is ${code}. Valid for ${expiry} minutes. If you didn't request this, ignore this message.`,
    
    twoFactor: (code: string) =>
      `Your 2FA code is ${code}. Do not share this code with anyone.`,
  },
  
  // Transaction Templates
  transaction: {
    paymentReceived: (amount: string, currency: string, ref: string) =>
      `Payment received: ${currency} ${amount}. Reference: ${ref}. Thank you for your purchase!`,
    
    paymentReminder: (amount: string, currency: string, dueDate: string) =>
      `Payment reminder: ${currency} ${amount} due on ${dueDate}. Please make payment to avoid late fees.`,
    
    reservationConfirmed: (vehicle: string, ref: string) =>
      `Your reservation for ${vehicle} is confirmed. Ref: ${ref}. We'll be in touch shortly.`,
    
    holdExpiring: (vehicle: string, hours: number) =>
      `Your hold on ${vehicle} expires in ${hours} hours. Complete your deposit to secure it.`,
  },
  
  // Alert Templates
  alert: {
    newCarAlert: (make: string, model: string, price: string) =>
      `New arrival! ${make} ${model} - ${price}. View it now at our showroom.`,
    
    priceDropAlert: (vehicle: string, oldPrice: string, newPrice: string) =>
      `Price drop! ${vehicle} now ${newPrice} (was ${oldPrice}). Don't miss out!`,
    
    testDriveReminder: (vehicle: string, date: string, time: string) =>
      `Reminder: Test drive for ${vehicle} on ${date} at ${time}. Reply CONFIRM or CANCEL.`,
    
    serviceReminder: (vehicle: string, serviceType: string, date: string) =>
      `Reminder: ${serviceType} for your ${vehicle} is due on ${date}. Book now!`,
  },
  
  // Marketing Templates
  marketing: {
    welcome: (name: string, dealerName: string) =>
      `Welcome to ${dealerName}, ${name}! Browse our collection at your convenience. Reply STOP to opt out.`,
    
    promotion: (discount: string, expiry: string) =>
      `Special offer! Get ${discount} off any vehicle until ${expiry}. Visit us today! Reply STOP to opt out.`,
    
    feedback: (dealerName: string, link: string) =>
      `Thank you for visiting ${dealerName}! We'd love your feedback: ${link}. Reply STOP to opt out.`,
  },
};

/**
 * SMS Service class
 */
export class SMSService {
  private config: SMSProviderConfig;
  private defaultCountryCode: string;

  constructor(config: SMSProviderConfig, defaultCountryCode: string = '260') {
    this.config = config;
    this.defaultCountryCode = defaultCountryCode;
  }

  /**
   * Send SMS via configured provider
   */
  async send(message: SMSMessage): Promise<SMSResponse> {
    const validation = validatePhoneNumber(message.to);
    if (!validation.valid) {
      return {
        success: false,
        provider: this.config.provider,
        status: 'failed',
        errorMessage: validation.error,
      };
    }

    const formattedMessage = {
      ...message,
      to: validation.formatted!,
      senderId: message.senderId || this.config.senderId,
    };

    switch (this.config.provider) {
      case 'twilio':
        return this.sendViaTwilio(formattedMessage);
      case 'africas_talking':
        return this.sendViaAfricasTalking(formattedMessage);
      case 'termii':
        return this.sendViaTermii(formattedMessage);
      case 'hubtel':
        return this.sendViaHubtel(formattedMessage);
      default:
        return this.sendGeneric(formattedMessage);
    }
  }

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(message: SMSMessage): Promise<SMSResponse> {
    try {
      const url = `${this.config.baseUrl}/Accounts/${this.config.accountSid}/Messages.json`;
      
      const params = new URLSearchParams();
      params.append('To', message.to);
      params.append('From', message.senderId || this.config.senderId);
      params.append('Body', message.message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${this.config.accountSid}:${this.config.apiSecret}`
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.sid,
          provider: 'twilio',
          status: 'queued',
          cost: parseFloat(data.price || '0'),
        };
      }

      return {
        success: false,
        provider: 'twilio',
        status: 'failed',
        errorCode: data.code?.toString(),
        errorMessage: data.message,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'twilio',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send via Africa's Talking
   */
  private async sendViaAfricasTalking(message: SMSMessage): Promise<SMSResponse> {
    try {
      const url = `${this.config.baseUrl}/messaging`;
      
      const params = new URLSearchParams();
      params.append('username', this.config.username || '');
      params.append('to', message.to);
      params.append('message', message.message);
      if (message.senderId) {
        params.append('from', message.senderId);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apiKey': this.config.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params,
      });

      const data = await response.json();

      if (data.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return {
          success: true,
          messageId: data.SMSMessageData.Recipients[0].messageId,
          provider: 'africas_talking',
          status: 'sent',
          cost: parseFloat(data.SMSMessageData.Recipients[0].cost || '0'),
        };
      }

      return {
        success: false,
        provider: 'africas_talking',
        status: 'failed',
        errorMessage: data.SMSMessageData?.Recipients?.[0]?.status || 'Failed to send',
      };
    } catch (error) {
      return {
        success: false,
        provider: 'africas_talking',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send via Termii (Nigeria)
   */
  private async sendViaTermii(message: SMSMessage): Promise<SMSResponse> {
    try {
      const url = `${this.config.baseUrl}/sms/send`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.config.apiKey,
          to: message.to,
          from: message.senderId || this.config.senderId,
          sms: message.message,
          type: 'plain',
          channel: message.type === 'otp' ? 'dnd' : 'generic',
        }),
      });

      const data = await response.json();

      if (data.code === 'ok') {
        return {
          success: true,
          messageId: data.message_id,
          provider: 'termii',
          status: 'sent',
          cost: data.balance,
        };
      }

      return {
        success: false,
        provider: 'termii',
        status: 'failed',
        errorMessage: data.message || 'Failed to send',
      };
    } catch (error) {
      return {
        success: false,
        provider: 'termii',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send via Hubtel (Ghana)
   */
  private async sendViaHubtel(message: SMSMessage): Promise<SMSResponse> {
    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${this.config.apiKey}:${this.config.apiSecret}`
          ).toString('base64'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          From: message.senderId || this.config.senderId,
          To: message.to,
          Content: message.message,
          RegisteredDelivery: true,
        }),
      });

      const data = await response.json();

      if (data.Status === 0) {
        return {
          success: true,
          messageId: data.MessageId,
          provider: 'hubtel',
          status: 'sent',
          cost: data.Rate,
        };
      }

      return {
        success: false,
        provider: 'hubtel',
        status: 'failed',
        errorMessage: data.Message || 'Failed to send',
      };
    } catch (error) {
      return {
        success: false,
        provider: 'hubtel',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generic send method for other providers
   */
  private async sendGeneric(message: SMSMessage): Promise<SMSResponse> {
    // Placeholder for other providers
    return {
      success: false,
      provider: this.config.provider,
      status: 'failed',
      errorMessage: `Provider ${this.config.provider} not fully implemented`,
    };
  }

  /**
   * Send bulk SMS
   */
  async sendBulk(messages: SMSMessage[]): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: SMSResponse[];
  }> {
    const results: SMSResponse[] = [];
    let successful = 0;
    let failed = 0;

    for (const message of messages) {
      const result = await this.send(message);
      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
      
      // Rate limiting - wait between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      total: messages.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Check delivery status
   */
  async checkStatus(messageId: string): Promise<SMSDeliveryStatus> {
    // Implementation depends on provider
    return {
      messageId,
      status: 'pending',
    };
  }
}

/**
 * OTP Service using SMS
 */
export class OTPService {
  private smsService: SMSService;
  private otpStore: Map<string, { code: string; expiresAt: Date; attempts: number }>;
  private maxAttempts: number;
  private expiryMinutes: number;

  constructor(smsService: SMSService, maxAttempts: number = 3, expiryMinutes: number = 5) {
    this.smsService = smsService;
    this.otpStore = new Map();
    this.maxAttempts = maxAttempts;
    this.expiryMinutes = expiryMinutes;
  }

  /**
   * Generate and send OTP
   */
  async sendOTP(
    phone: string,
    purpose: 'login' | 'verification' | 'passwordReset' | 'twoFactor'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + this.expiryMinutes * 60 * 1000);

    // Store OTP
    const key = `${phone}:${purpose}`;
    this.otpStore.set(key, { code, expiresAt, attempts: 0 });

    // Get message template
    const message = SMS_TEMPLATES.otp[purpose](code, this.expiryMinutes);

    // Send SMS
    const result = await this.smsService.send({
      to: phone,
      message,
      type: 'otp',
    });

    if (result.success) {
      return { success: true, messageId: result.messageId };
    }

    // Clean up on failure
    this.otpStore.delete(key);
    return { success: false, error: result.errorMessage };
  }

  /**
   * Verify OTP
   */
  verifyOTP(
    phone: string,
    code: string,
    purpose: 'login' | 'verification' | 'passwordReset' | 'twoFactor'
  ): { valid: boolean; error?: string } {
    const key = `${phone}:${purpose}`;
    const stored = this.otpStore.get(key);

    if (!stored) {
      return { valid: false, error: 'No OTP found. Please request a new one.' };
    }

    // Check expiry
    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(key);
      return { valid: false, error: 'OTP has expired. Please request a new one.' };
    }

    // Check attempts
    if (stored.attempts >= this.maxAttempts) {
      this.otpStore.delete(key);
      return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
    }

    // Verify code
    if (stored.code !== code) {
      stored.attempts++;
      return { 
        valid: false, 
        error: `Invalid OTP. ${this.maxAttempts - stored.attempts} attempts remaining.` 
      };
    }

    // Success - clean up
    this.otpStore.delete(key);
    return { valid: true };
  }
}

export default {
  SMSService,
  OTPService,
  formatPhoneNumber,
  validatePhoneNumber,
  calculateSMSSegments,
  SMS_TEMPLATES,
  SMS_PROVIDER_CONFIGS,
};
