/**
 * Customer Portal Service
 * Self-service portal for customers to track orders, payments, and vehicles
 */

export type CustomerPortalSection =
  | 'dashboard'
  | 'orders'
  | 'payments'
  | 'vehicles'
  | 'reservations'
  | 'favorites'
  | 'documents'
  | 'support'
  | 'profile'
  | 'settings';

export interface CustomerProfile {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  address?: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  preferences: {
    currency: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  verification: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    image?: string;
  };
  pricing: {
    vehiclePrice: number;
    fees: number;
    taxes: number;
    discount: number;
    total: number;
    currency: string;
  };
  payment: {
    method: string;
    status: 'pending' | 'partial' | 'paid' | 'refunded';
    amountPaid: number;
    amountDue: number;
    nextPaymentDate?: Date;
  };
  shipping?: {
    method: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    address: string;
  };
  timeline: {
    date: Date;
    status: string;
    description: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerPayment {
  id: string;
  orderId?: string;
  orderNumber?: string;
  type: 'deposit' | 'installment' | 'full_payment' | 'fee' | 'refund';
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string;
  date: Date;
  receipt?: string;
}

export interface CustomerVehicle {
  id: string;
  orderId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate?: string;
  color: string;
  image?: string;
  purchaseDate: Date;
  warranty?: {
    type: string;
    expiresAt: Date;
    coverage: string[];
  };
  service?: {
    lastServiceDate?: Date;
    nextServiceDue?: Date;
    mileage?: number;
  };
  documents: {
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
}

export interface CustomerReservation {
  id: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;
    image?: string;
  };
  deposit: {
    amount: number;
    currency: string;
    paid: boolean;
    paidAt?: Date;
  };
  status: 'active' | 'expired' | 'converted' | 'cancelled';
  expiresAt: Date;
  createdAt: Date;
}

export interface CustomerFavorite {
  id: string;
  vehicleId: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;
    image?: string;
    status: 'available' | 'reserved' | 'sold';
  };
  addedAt: Date;
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
  };
}

export interface CustomerDocument {
  id: string;
  type: 'invoice' | 'receipt' | 'contract' | 'registration' | 'insurance' | 'warranty' | 'other';
  name: string;
  description?: string;
  orderId?: string;
  vehicleId?: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'sales' | 'payment' | 'delivery' | 'vehicle' | 'warranty' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  messages: {
    id: string;
    sender: 'customer' | 'support';
    senderName: string;
    message: string;
    attachments?: string[];
    createdAt: Date;
  }[];
  orderId?: string;
  vehicleId?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface PortalDashboard {
  customer: CustomerProfile;
  summary: {
    totalOrders: number;
    activeOrders: number;
    totalSpent: number;
    currency: string;
    vehiclesOwned: number;
    activeReservations: number;
    pendingPayments: number;
    openTickets: number;
  };
  recentActivity: {
    type: 'order' | 'payment' | 'reservation' | 'ticket' | 'favorite';
    title: string;
    description: string;
    date: Date;
    url?: string;
  }[];
  upcomingPayments: {
    orderId: string;
    orderNumber: string;
    amount: number;
    currency: string;
    dueDate: Date;
  }[];
  notifications: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }[];
}

/**
 * Customer Portal Service Class
 */
export class CustomerPortalService {
  private tenantId: string;
  private customerId: string;

  constructor(tenantId: string, customerId: string) {
    this.tenantId = tenantId;
    this.customerId = customerId;
  }

  /**
   * Get portal dashboard data
   */
  async getDashboard(): Promise<PortalDashboard> {
    // In production, this would fetch from database
    // Mock implementation for demonstration
    return {
      customer: await this.getProfile(),
      summary: {
        totalOrders: 2,
        activeOrders: 1,
        totalSpent: 45000,
        currency: 'USD',
        vehiclesOwned: 1,
        activeReservations: 0,
        pendingPayments: 1,
        openTickets: 0,
      },
      recentActivity: [
        {
          type: 'payment',
          title: 'Payment Received',
          description: 'Installment payment of $1,500 processed',
          date: new Date(),
        },
        {
          type: 'order',
          title: 'Order Shipped',
          description: 'Your 2024 Toyota Camry is on the way',
          date: new Date(Date.now() - 86400000),
        },
      ],
      upcomingPayments: [
        {
          orderId: 'order_1',
          orderNumber: 'ORD-2024-001',
          amount: 1500,
          currency: 'USD',
          dueDate: new Date(Date.now() + 86400000 * 15),
        },
      ],
      notifications: [],
    };
  }

  /**
   * Get customer profile
   */
  async getProfile(): Promise<CustomerProfile> {
    return {
      id: this.customerId,
      tenantId: this.tenantId,
      email: 'customer@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      preferences: {
        currency: 'USD',
        language: 'en',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          sms: true,
          push: false,
        },
      },
      verification: {
        email: true,
        phone: false,
        identity: false,
      },
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date(),
    };
  }

  /**
   * Update customer profile
   */
  async updateProfile(updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const current = await this.getProfile();
    return { ...current, ...updates };
  }

  /**
   * Get customer orders
   */
  async getOrders(options?: {
    status?: CustomerOrder['status'];
    limit?: number;
    offset?: number;
  }): Promise<CustomerOrder[]> {
    // Mock implementation
    return [];
  }

  /**
   * Get single order details
   */
  async getOrder(orderId: string): Promise<CustomerOrder | null> {
    return null;
  }

  /**
   * Get payment history
   */
  async getPayments(options?: {
    orderId?: string;
    type?: CustomerPayment['type'];
    limit?: number;
  }): Promise<CustomerPayment[]> {
    return [];
  }

  /**
   * Get customer vehicles
   */
  async getVehicles(): Promise<CustomerVehicle[]> {
    return [];
  }

  /**
   * Get vehicle details
   */
  async getVehicle(vehicleId: string): Promise<CustomerVehicle | null> {
    return null;
  }

  /**
   * Get active reservations
   */
  async getReservations(): Promise<CustomerReservation[]> {
    return [];
  }

  /**
   * Get favorites/wishlist
   */
  async getFavorites(): Promise<CustomerFavorite[]> {
    return [];
  }

  /**
   * Add vehicle to favorites
   */
  async addFavorite(vehicleId: string): Promise<CustomerFavorite> {
    return {
      id: `fav_${Date.now()}`,
      vehicleId,
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        price: 35000,
        currency: 'USD',
        status: 'available',
      },
      addedAt: new Date(),
    };
  }

  /**
   * Remove from favorites
   */
  async removeFavorite(favoriteId: string): Promise<boolean> {
    return true;
  }

  /**
   * Set price alert for favorite
   */
  async setPriceAlert(favoriteId: string, targetPrice: number): Promise<boolean> {
    return true;
  }

  /**
   * Get customer documents
   */
  async getDocuments(options?: {
    type?: CustomerDocument['type'];
    orderId?: string;
    vehicleId?: string;
  }): Promise<CustomerDocument[]> {
    return [];
  }

  /**
   * Download document
   */
  async downloadDocument(documentId: string): Promise<string | null> {
    // Returns download URL
    return null;
  }

  /**
   * Get support tickets
   */
  async getTickets(options?: {
    status?: SupportTicket['status'];
    limit?: number;
  }): Promise<SupportTicket[]> {
    return [];
  }

  /**
   * Get single ticket details
   */
  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    return null;
  }

  /**
   * Create support ticket
   */
  async createTicket(params: {
    subject: string;
    category: SupportTicket['category'];
    message: string;
    orderId?: string;
    vehicleId?: string;
    attachments?: string[];
  }): Promise<SupportTicket> {
    return {
      id: `ticket_${Date.now()}`,
      subject: params.subject,
      category: params.category,
      priority: 'medium',
      status: 'open',
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'customer',
          senderName: 'Customer',
          message: params.message,
          attachments: params.attachments,
          createdAt: new Date(),
        },
      ],
      orderId: params.orderId,
      vehicleId: params.vehicleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Reply to support ticket
   */
  async replyToTicket(ticketId: string, message: string, attachments?: string[]): Promise<boolean> {
    return true;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  }): Promise<boolean> {
    return true;
  }

  /**
   * Request identity verification
   */
  async requestVerification(type: 'email' | 'phone' | 'identity'): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: true,
      message: `Verification ${type === 'email' ? 'email' : 'code'} sent`,
    };
  }

  /**
   * Confirm verification
   */
  async confirmVerification(type: 'email' | 'phone' | 'identity', code: string): Promise<boolean> {
    return true;
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * Enable 2FA
   */
  async enable2FA(): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    return {
      secret: 'DEMO_SECRET',
      qrCode: 'data:image/png;base64,...',
      backupCodes: ['CODE1', 'CODE2', 'CODE3'],
    };
  }

  /**
   * Get order tracking info
   */
  async trackOrder(orderId: string): Promise<{
    status: string;
    location?: string;
    estimatedDelivery?: Date;
    timeline: {
      date: Date;
      status: string;
      location?: string;
      description: string;
    }[];
  } | null> {
    return null;
  }

  /**
   * Schedule test drive
   */
  async scheduleTestDrive(params: {
    vehicleId: string;
    date: Date;
    time: string;
    notes?: string;
  }): Promise<{
    id: string;
    confirmed: boolean;
    date: Date;
    time: string;
  }> {
    return {
      id: `td_${Date.now()}`,
      confirmed: false,
      date: params.date,
      time: params.time,
    };
  }

  /**
   * Get upcoming appointments
   */
  async getAppointments(): Promise<{
    id: string;
    type: 'test_drive' | 'delivery' | 'service';
    date: Date;
    time: string;
    vehicleName: string;
    location: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  }[]> {
    return [];
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    return true;
  }

  /**
   * Request financing quote
   */
  async requestFinancingQuote(params: {
    vehicleId: string;
    downPayment: number;
    term: number; // months
  }): Promise<{
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    apr: number;
  }> {
    // Simple calculation for demo
    const principal = 30000 - params.downPayment;
    const apr = 0.0599;
    const monthlyRate = apr / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, params.term)) /
      (Math.pow(1 + monthlyRate, params.term) - 1);
    
    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round((monthlyPayment * params.term - principal) * 100) / 100,
      totalCost: Math.round(monthlyPayment * params.term * 100) / 100,
      apr: apr * 100,
    };
  }
}

/**
 * Portal navigation configuration
 */
export const PORTAL_NAVIGATION: {
  section: CustomerPortalSection;
  label: string;
  icon: string;
  badge?: 'orders' | 'payments' | 'tickets';
}[] = [
  { section: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { section: 'orders', label: 'My Orders', icon: '📦', badge: 'orders' },
  { section: 'payments', label: 'Payments', icon: '💳', badge: 'payments' },
  { section: 'vehicles', label: 'My Vehicles', icon: '🚗' },
  { section: 'reservations', label: 'Reservations', icon: '🔒' },
  { section: 'favorites', label: 'Favorites', icon: '❤️' },
  { section: 'documents', label: 'Documents', icon: '📄' },
  { section: 'support', label: 'Support', icon: '💬', badge: 'tickets' },
  { section: 'profile', label: 'Profile', icon: '👤' },
  { section: 'settings', label: 'Settings', icon: '⚙️' },
];

export default CustomerPortalService;
