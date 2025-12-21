/**
 * Mobile Money Payment Integration
 * Supports MTN MoMo, Airtel Money, Zamtel Kwacha, and other African mobile money providers
 */

export type MobileMoneyProvider = 
  | 'mtn_momo'
  | 'airtel_money'
  | 'zamtel_kwacha'
  | 'orange_money'
  | 'mpesa'
  | 'tigo_pesa';

export interface MobileMoneyConfig {
  provider: MobileMoneyProvider;
  apiKey: string;
  apiSecret: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
  currency: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  provider: MobileMoneyProvider;
  reference: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  message: string;
  provider: MobileMoneyProvider;
  amount: number;
  currency: string;
  phoneNumber: string;
  timestamp: string;
}

export interface PaymentCallback {
  transactionId: string;
  externalId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
  currency: string;
  phoneNumber: string;
  timestamp: string;
  failureReason?: string;
}

// Provider-specific configurations
const PROVIDER_CONFIGS: Record<MobileMoneyProvider, {
  name: string;
  countries: string[];
  currencies: string[];
  apiBaseUrl: {
    sandbox: string;
    production: string;
  };
  phonePrefix: string[];
}> = {
  mtn_momo: {
    name: 'MTN Mobile Money',
    countries: ['ZM', 'GH', 'UG', 'CM', 'CI', 'RW'],
    currencies: ['ZMW', 'GHS', 'UGX', 'XAF', 'XOF', 'RWF'],
    apiBaseUrl: {
      sandbox: 'https://sandbox.momodeveloper.mtn.com',
      production: 'https://proxy.momoapi.mtn.com',
    },
    phonePrefix: ['+260', '+233', '+256', '+237', '+225', '+250'],
  },
  airtel_money: {
    name: 'Airtel Money',
    countries: ['ZM', 'KE', 'UG', 'TZ', 'MW', 'RW'],
    currencies: ['ZMW', 'KES', 'UGX', 'TZS', 'MWK', 'RWF'],
    apiBaseUrl: {
      sandbox: 'https://openapiuat.airtel.africa',
      production: 'https://openapi.airtel.africa',
    },
    phonePrefix: ['+260', '+254', '+256', '+255', '+265', '+250'],
  },
  zamtel_kwacha: {
    name: 'Zamtel Kwacha',
    countries: ['ZM'],
    currencies: ['ZMW'],
    apiBaseUrl: {
      sandbox: 'https://sandbox.zamtel.co.zm/api',
      production: 'https://api.zamtel.co.zm',
    },
    phonePrefix: ['+260'],
  },
  orange_money: {
    name: 'Orange Money',
    countries: ['SN', 'ML', 'CI', 'CM', 'BF'],
    currencies: ['XOF', 'XAF'],
    apiBaseUrl: {
      sandbox: 'https://api.sandbox.orange.com',
      production: 'https://api.orange.com',
    },
    phonePrefix: ['+221', '+223', '+225', '+237', '+226'],
  },
  mpesa: {
    name: 'M-Pesa',
    countries: ['KE', 'TZ', 'MZ', 'GH'],
    currencies: ['KES', 'TZS', 'MZN', 'GHS'],
    apiBaseUrl: {
      sandbox: 'https://sandbox.safaricom.co.ke',
      production: 'https://api.safaricom.co.ke',
    },
    phonePrefix: ['+254', '+255', '+258', '+233'],
  },
  tigo_pesa: {
    name: 'Tigo Pesa',
    countries: ['TZ', 'GH', 'SN', 'RW'],
    currencies: ['TZS', 'GHS', 'XOF', 'RWF'],
    apiBaseUrl: {
      sandbox: 'https://sandbox.tigo.com/api',
      production: 'https://api.tigo.com',
    },
    phonePrefix: ['+255', '+233', '+221', '+250'],
  },
};

/**
 * Mobile Money Payment Service
 */
export class MobileMoneyService {
  private config: MobileMoneyConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: MobileMoneyConfig) {
    this.config = config;
  }

  /**
   * Get provider configuration
   */
  getProviderInfo() {
    return PROVIDER_CONFIGS[this.config.provider];
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const providerConfig = PROVIDER_CONFIGS[this.config.provider];
    const normalized = phoneNumber.replace(/\s/g, '');
    return providerConfig.phonePrefix.some(prefix => normalized.startsWith(prefix));
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phoneNumber: string, countryCode: string): string {
    let normalized = phoneNumber.replace(/\s/g, '').replace(/-/g, '');
    
    if (normalized.startsWith('0')) {
      const countryPrefixes: Record<string, string> = {
        ZM: '+260',
        KE: '+254',
        GH: '+233',
        TZ: '+255',
        UG: '+256',
      };
      normalized = (countryPrefixes[countryCode] || '+260') + normalized.slice(1);
    }
    
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }
    
    return normalized;
  }

  /**
   * Get OAuth access token (for providers that require it)
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const providerConfig = PROVIDER_CONFIGS[this.config.provider];
    const baseUrl = providerConfig.apiBaseUrl[this.config.environment];

    try {
      const response = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      const tokenValue: string = data.access_token;
      this.accessToken = tokenValue;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);
      
      return tokenValue;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Initiate a payment request
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.validatePhoneNumber(request.phoneNumber)) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: 'Invalid phone number format for selected provider',
        provider: request.provider,
        amount: request.amount,
        currency: request.currency,
        phoneNumber: request.phoneNumber,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const token = await this.getAccessToken();
      const providerConfig = PROVIDER_CONFIGS[this.config.provider];
      const baseUrl = providerConfig.apiBaseUrl[this.config.environment];

      // Provider-specific payment request
      const paymentPayload = this.buildPaymentPayload(request);
      
      const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': request.reference,
          'X-Callback-Url': this.config.callbackUrl,
          'X-Target-Environment': this.config.environment,
        },
        body: JSON.stringify(paymentPayload),
      });

      if (response.status === 202) {
        return {
          success: true,
          transactionId: request.reference,
          status: 'pending',
          message: 'Payment request sent. Awaiting user confirmation.',
          provider: request.provider,
          amount: request.amount,
          currency: request.currency,
          phoneNumber: request.phoneNumber,
          timestamp: new Date().toISOString(),
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        transactionId: request.reference,
        status: 'failed',
        message: errorData.message || 'Payment request failed',
        provider: request.provider,
        amount: request.amount,
        currency: request.currency,
        phoneNumber: request.phoneNumber,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        transactionId: request.reference,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payment request failed',
        provider: request.provider,
        amount: request.amount,
        currency: request.currency,
        phoneNumber: request.phoneNumber,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken();
      const providerConfig = PROVIDER_CONFIGS[this.config.provider];
      const baseUrl = providerConfig.apiBaseUrl[this.config.environment];

      const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': this.config.environment,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      
      const statusMap: Record<string, PaymentResponse['status']> = {
        SUCCESSFUL: 'completed',
        PENDING: 'pending',
        FAILED: 'failed',
      };

      return {
        success: data.status === 'SUCCESSFUL',
        transactionId,
        status: statusMap[data.status] || 'pending',
        message: data.reason || 'Status retrieved',
        provider: this.config.provider,
        amount: parseFloat(data.amount),
        currency: data.currency,
        phoneNumber: data.payer?.partyId || '',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  /**
   * Build provider-specific payment payload
   */
  private buildPaymentPayload(request: PaymentRequest): Record<string, unknown> {
    return {
      amount: request.amount.toString(),
      currency: request.currency,
      externalId: request.reference,
      payer: {
        partyIdType: 'MSISDN',
        partyId: request.phoneNumber.replace('+', ''),
      },
      payerMessage: request.description,
      payeeNote: `Payment for ${request.reference}`,
    };
  }

  /**
   * Process callback from payment provider
   */
  static processCallback(payload: unknown): PaymentCallback {
    const data = payload as Record<string, unknown>;
    
    return {
      transactionId: String(data.referenceId || data.transactionId || ''),
      externalId: String(data.externalId || data.reference || ''),
      status: String(data.status || 'PENDING') as PaymentCallback['status'],
      amount: parseFloat(String(data.amount || 0)),
      currency: String(data.currency || 'ZMW'),
      phoneNumber: String((data.payer as Record<string, unknown>)?.partyId || data.phoneNumber || ''),
      timestamp: new Date().toISOString(),
      failureReason: data.reason ? String(data.reason) : undefined,
    };
  }
}

/**
 * Get available providers for a country
 */
export function getProvidersForCountry(countryCode: string): MobileMoneyProvider[] {
  return (Object.entries(PROVIDER_CONFIGS) as [MobileMoneyProvider, typeof PROVIDER_CONFIGS[MobileMoneyProvider]][])
    .filter(([, config]) => config.countries.includes(countryCode))
    .map(([provider]) => provider);
}

/**
 * Get provider display name
 */
export function getProviderName(provider: MobileMoneyProvider): string {
  return PROVIDER_CONFIGS[provider]?.name || provider;
}

/**
 * Get supported currencies for provider
 */
export function getProviderCurrencies(provider: MobileMoneyProvider): string[] {
  return PROVIDER_CONFIGS[provider]?.currencies || [];
}

export default MobileMoneyService;
