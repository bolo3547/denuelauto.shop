/**
 * WhatsApp Business API Integration
 * Supports WhatsApp Cloud API for automated messaging, templates, and customer engagement
 */

export type MessageType = 
  | 'text'
  | 'template'
  | 'image'
  | 'document'
  | 'video'
  | 'audio'
  | 'location'
  | 'contacts'
  | 'interactive';

export type MessageStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  apiVersion: string;
}

export interface Contact {
  wa_id: string;
  profile: {
    name: string;
  };
}

export interface TextMessage {
  type: 'text';
  text: {
    body: string;
    preview_url?: boolean;
  };
}

export interface TemplateMessage {
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: TemplateComponent[];
  };
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: TemplateParameter[];
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: {
    link: string;
  };
  document?: {
    link: string;
    filename?: string;
  };
}

export interface MediaMessage {
  type: 'image' | 'document' | 'video' | 'audio';
  image?: { link: string; caption?: string };
  document?: { link: string; filename?: string; caption?: string };
  video?: { link: string; caption?: string };
  audio?: { link: string };
}

export interface InteractiveMessage {
  type: 'interactive';
  interactive: {
    type: 'button' | 'list' | 'product' | 'product_list';
    header?: {
      type: 'text' | 'image' | 'video' | 'document';
      text?: string;
      image?: { link: string };
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: InteractiveAction;
  };
}

export interface InteractiveAction {
  buttons?: Array<{
    type: 'reply';
    reply: {
      id: string;
      title: string;
    };
  }>;
  button?: string;
  sections?: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
}

export interface SendMessageRequest {
  to: string;
  message: TextMessage | TemplateMessage | MediaMessage | InteractiveMessage;
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  status: MessageStatus;
  error?: string;
  timestamp: string;
}

export interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: MessageType;
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string };
  document?: { id: string; mime_type: string; sha256: string; filename: string };
  button?: { text: string; payload: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description: string };
  };
  context?: {
    from: string;
    id: string;
  };
}

export interface WebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
    message: string;
  }>;
}

// Pre-defined message templates for car dealership
export const MESSAGE_TEMPLATES = {
  // Order confirmation
  ORDER_CONFIRMATION: {
    name: 'order_confirmation',
    language: 'en',
    variables: ['customer_name', 'order_id', 'car_details', 'total_amount'],
  },
  
  // Payment reminder
  PAYMENT_REMINDER: {
    name: 'payment_reminder',
    language: 'en',
    variables: ['customer_name', 'amount', 'due_date', 'installment_number'],
  },
  
  // Payment received
  PAYMENT_RECEIVED: {
    name: 'payment_received',
    language: 'en',
    variables: ['customer_name', 'amount', 'balance', 'transaction_id'],
  },
  
  // Shipment update
  SHIPMENT_UPDATE: {
    name: 'shipment_update',
    language: 'en',
    variables: ['customer_name', 'car_details', 'status', 'eta'],
  },
  
  // New car alert
  NEW_CAR_ALERT: {
    name: 'new_car_alert',
    language: 'en',
    variables: ['customer_name', 'car_make', 'car_model', 'price', 'link'],
  },
  
  // Price drop alert
  PRICE_DROP_ALERT: {
    name: 'price_drop_alert',
    language: 'en',
    variables: ['customer_name', 'car_details', 'old_price', 'new_price', 'link'],
  },
  
  // Inquiry response
  INQUIRY_RESPONSE: {
    name: 'inquiry_response',
    language: 'en',
    variables: ['customer_name', 'car_details', 'availability', 'agent_name'],
  },
  
  // Test drive confirmation
  TEST_DRIVE_CONFIRMATION: {
    name: 'test_drive_confirmation',
    language: 'en',
    variables: ['customer_name', 'car_details', 'date', 'time', 'location'],
  },
  
  // Document request
  DOCUMENT_REQUEST: {
    name: 'document_request',
    language: 'en',
    variables: ['customer_name', 'document_type', 'deadline'],
  },
  
  // Welcome message
  WELCOME_MESSAGE: {
    name: 'welcome_message',
    language: 'en',
    variables: ['customer_name', 'dealer_name'],
  },
};

/**
 * WhatsApp Business API Service
 */
export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.baseUrl = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}`;
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, text: string, previewUrl = false): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      message: {
        type: 'text',
        text: {
          body: text,
          preview_url: previewUrl,
        },
      },
    });
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components?: TemplateComponent[]
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      message: {
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components,
        },
      },
    });
  }

  /**
   * Send an image message
   */
  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      message: {
        type: 'image',
        image: {
          link: imageUrl,
          caption,
        },
      },
    });
  }

  /**
   * Send a document message
   */
  async sendDocumentMessage(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      message: {
        type: 'document',
        document: {
          link: documentUrl,
          filename,
          caption,
        },
      },
    });
  }

  /**
   * Send an interactive button message
   */
  async sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
    footerText?: string
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      message: {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: headerText ? { type: 'text', text: headerText } : undefined,
          body: { text: bodyText },
          footer: footerText ? { text: footerText } : undefined,
          action: {
            buttons: buttons.slice(0, 3).map(btn => ({
              type: 'reply' as const,
              reply: {
                id: btn.id,
                title: btn.title.slice(0, 20),
              },
            })),
          },
        },
      },
    });
  }

  /**
   * Send an interactive list message
   */
  async sendListMessage(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    headerText?: string,
    footerText?: string
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      message: {
        type: 'interactive',
        interactive: {
          type: 'list',
          header: headerText ? { type: 'text', text: headerText } : undefined,
          body: { text: bodyText },
          footer: footerText ? { text: footerText } : undefined,
          action: {
            button: buttonText,
            sections: sections.map(section => ({
              title: section.title,
              rows: section.rows.map(row => ({
                id: row.id,
                title: row.title.slice(0, 24),
                description: row.description?.slice(0, 72),
              })),
            })),
          },
        },
      },
    });
  }

  /**
   * Core send message method
   */
  private async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: request.to,
        ...request.message,
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: 'failed',
          error: data.error?.message || 'Failed to send message',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Format phone number for WhatsApp API
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except leading +
    let formatted = phone.replace(/[^\d+]/g, '');
    
    // Remove leading + if present
    if (formatted.startsWith('+')) {
      formatted = formatted.slice(1);
    }
    
    // Remove leading 0 if present (local format)
    if (formatted.startsWith('0')) {
      formatted = '260' + formatted.slice(1); // Default to Zambia
    }
    
    return formatted;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Parse incoming webhook payload
   */
  static parseWebhook(body: unknown): {
    messages: WebhookMessage[];
    statuses: WebhookStatus[];
    contacts: Contact[];
  } {
    const data = body as Record<string, unknown>;
    const entry = (data.entry as unknown[])?.[0] as Record<string, unknown>;
    const changes = (entry?.changes as unknown[])?.[0] as Record<string, unknown>;
    const value = changes?.value as Record<string, unknown>;

    return {
      messages: (value?.messages as WebhookMessage[]) || [],
      statuses: (value?.statuses as WebhookStatus[]) || [],
      contacts: (value?.contacts as Contact[]) || [],
    };
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get media URL from media ID
   */
  async getMediaUrl(mediaId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.config.apiVersion}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.url || null;
    } catch {
      return null;
    }
  }
}

// ============================================================================
// DEALERSHIP-SPECIFIC HELPER FUNCTIONS
// ============================================================================

/**
 * Send order confirmation via WhatsApp
 */
export async function sendOrderConfirmation(
  service: WhatsAppService,
  to: string,
  orderDetails: {
    customerName: string;
    orderId: string;
    carMake: string;
    carModel: string;
    year: number;
    totalAmount: number;
    currency: string;
  }
): Promise<SendMessageResponse> {
  const template = MESSAGE_TEMPLATES.ORDER_CONFIRMATION;
  
  return service.sendTemplateMessage(to, template.name, template.language, [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: orderDetails.customerName },
        { type: 'text', text: orderDetails.orderId },
        { type: 'text', text: `${orderDetails.year} ${orderDetails.carMake} ${orderDetails.carModel}` },
        {
          type: 'currency',
          currency: {
            fallback_value: `${orderDetails.currency} ${orderDetails.totalAmount.toLocaleString()}`,
            code: orderDetails.currency,
            amount_1000: orderDetails.totalAmount * 1000,
          },
        },
      ],
    },
  ]);
}

/**
 * Send payment reminder via WhatsApp
 */
export async function sendPaymentReminder(
  service: WhatsAppService,
  to: string,
  reminderDetails: {
    customerName: string;
    amount: number;
    currency: string;
    dueDate: string;
    installmentNumber: number;
  }
): Promise<SendMessageResponse> {
  const template = MESSAGE_TEMPLATES.PAYMENT_REMINDER;
  
  return service.sendTemplateMessage(to, template.name, template.language, [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: reminderDetails.customerName },
        {
          type: 'currency',
          currency: {
            fallback_value: `${reminderDetails.currency} ${reminderDetails.amount.toLocaleString()}`,
            code: reminderDetails.currency,
            amount_1000: reminderDetails.amount * 1000,
          },
        },
        { type: 'date_time', date_time: { fallback_value: reminderDetails.dueDate } },
        { type: 'text', text: `#${reminderDetails.installmentNumber}` },
      ],
    },
  ]);
}

/**
 * Send car listing via WhatsApp with interactive buttons
 */
export async function sendCarListing(
  service: WhatsAppService,
  to: string,
  car: {
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;
    mileage: number;
    imageUrl: string;
    stockNo: string;
  }
): Promise<SendMessageResponse> {
  // First send the car image
  await service.sendImageMessage(
    to,
    car.imageUrl,
    `🚗 ${car.year} ${car.make} ${car.model}\n💰 ${car.currency} ${car.price.toLocaleString()}\n📍 ${car.mileage.toLocaleString()} km`
  );

  // Then send interactive buttons
  return service.sendButtonMessage(
    to,
    `Stock #${car.stockNo}\n\nInterested in this ${car.year} ${car.make} ${car.model}?`,
    [
      { id: `inquiry_${car.stockNo}`, title: '📩 Inquire Now' },
      { id: `test_drive_${car.stockNo}`, title: '🚗 Book Test Drive' },
      { id: `call_${car.stockNo}`, title: '📞 Call Us' },
    ],
    `${car.make} ${car.model}`,
    'Reply to take action'
  );
}

export default WhatsAppService;
