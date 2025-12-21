/**
 * Vehicle Reservation & Hold System
 * Allows customers to reserve vehicles with deposits
 */

export type ReservationStatus = 
  | 'pending'
  | 'confirmed'
  | 'deposit_paid'
  | 'expired'
  | 'cancelled'
  | 'converted';

export type HoldType = 
  | 'customer_interest'
  | 'viewing_scheduled'
  | 'deposit_pending'
  | 'fully_reserved';

export interface VehicleHold {
  id: string;
  vehicleId: string;
  tenantId: string;
  
  // Customer info
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Hold details
  holdType: HoldType;
  status: ReservationStatus;
  priority: number; // 1-10, higher is more priority
  
  // Timing
  createdAt: Date;
  expiresAt: Date;
  confirmedAt?: Date;
  
  // Deposit
  depositAmount?: number;
  depositPaidAt?: Date;
  depositPaymentRef?: string;
  depositRefunded?: boolean;
  
  // Viewing
  viewingScheduledAt?: Date;
  viewingCompletedAt?: Date;
  viewingNotes?: string;
  
  // Conversion
  convertedToSaleAt?: Date;
  saleId?: string;
  
  // Agent
  agentId?: string;
  agentNotes?: string;
  
  // Metadata
  source: 'website' | 'phone' | 'walk_in' | 'agent' | 'referral';
  metadata?: Record<string, any>;
}

export interface ReservationConfig {
  // Hold durations (in hours)
  interestHoldDuration: number;
  viewingHoldDuration: number;
  depositPendingDuration: number;
  reservedDuration: number;
  
  // Deposit settings
  minDepositPercent: number;
  maxDepositPercent: number;
  defaultDepositPercent: number;
  
  // Limits
  maxHoldsPerCustomer: number;
  maxHoldsPerVehicle: number;
  
  // Auto-expiry
  autoExpireEnabled: boolean;
  reminderBeforeExpiryHours: number;
}

export const DEFAULT_RESERVATION_CONFIG: ReservationConfig = {
  interestHoldDuration: 24,
  viewingHoldDuration: 48,
  depositPendingDuration: 72,
  reservedDuration: 168, // 7 days
  
  minDepositPercent: 5,
  maxDepositPercent: 50,
  defaultDepositPercent: 10,
  
  maxHoldsPerCustomer: 3,
  maxHoldsPerVehicle: 5,
  
  autoExpireEnabled: true,
  reminderBeforeExpiryHours: 6,
};

/**
 * Calculate deposit amount based on vehicle price
 */
export function calculateDeposit(
  vehiclePrice: number,
  config: ReservationConfig = DEFAULT_RESERVATION_CONFIG,
  customPercent?: number
): {
  amount: number;
  percent: number;
  minAmount: number;
  maxAmount: number;
} {
  const percent = customPercent 
    ? Math.max(config.minDepositPercent, Math.min(config.maxDepositPercent, customPercent))
    : config.defaultDepositPercent;
  
  return {
    amount: Math.round(vehiclePrice * percent / 100),
    percent,
    minAmount: Math.round(vehiclePrice * config.minDepositPercent / 100),
    maxAmount: Math.round(vehiclePrice * config.maxDepositPercent / 100),
  };
}

/**
 * Calculate hold expiry time
 */
export function calculateHoldExpiry(
  holdType: HoldType,
  config: ReservationConfig = DEFAULT_RESERVATION_CONFIG,
  fromDate: Date = new Date()
): Date {
  const durations: Record<HoldType, number> = {
    customer_interest: config.interestHoldDuration,
    viewing_scheduled: config.viewingHoldDuration,
    deposit_pending: config.depositPendingDuration,
    fully_reserved: config.reservedDuration,
  };
  
  const hours = durations[holdType];
  return new Date(fromDate.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Check if a hold is expired
 */
export function isHoldExpired(hold: VehicleHold): boolean {
  return new Date() > hold.expiresAt && hold.status !== 'converted';
}

/**
 * Check if a hold needs reminder
 */
export function needsExpiryReminder(
  hold: VehicleHold,
  config: ReservationConfig = DEFAULT_RESERVATION_CONFIG
): boolean {
  if (hold.status === 'expired' || hold.status === 'cancelled' || hold.status === 'converted') {
    return false;
  }
  
  const reminderTime = new Date(
    hold.expiresAt.getTime() - config.reminderBeforeExpiryHours * 60 * 60 * 1000
  );
  
  return new Date() >= reminderTime && new Date() < hold.expiresAt;
}

/**
 * Check if customer can place a hold
 */
export function canCustomerPlaceHold(
  customerId: string,
  existingHolds: VehicleHold[],
  config: ReservationConfig = DEFAULT_RESERVATION_CONFIG
): { allowed: boolean; reason?: string; currentHolds: number } {
  const customerHolds = existingHolds.filter(
    h => h.customerId === customerId && 
    h.status !== 'expired' && 
    h.status !== 'cancelled' && 
    h.status !== 'converted'
  );
  
  if (customerHolds.length >= config.maxHoldsPerCustomer) {
    return {
      allowed: false,
      reason: `Maximum ${config.maxHoldsPerCustomer} active holds per customer`,
      currentHolds: customerHolds.length,
    };
  }
  
  return {
    allowed: true,
    currentHolds: customerHolds.length,
  };
}

/**
 * Check if vehicle can accept a hold
 */
export function canVehicleAcceptHold(
  vehicleId: string,
  existingHolds: VehicleHold[],
  config: ReservationConfig = DEFAULT_RESERVATION_CONFIG
): { 
  allowed: boolean; 
  reason?: string; 
  currentHolds: number;
  hasFullReservation: boolean;
} {
  const vehicleHolds = existingHolds.filter(
    h => h.vehicleId === vehicleId && 
    h.status !== 'expired' && 
    h.status !== 'cancelled' && 
    h.status !== 'converted'
  );
  
  const hasFullReservation = vehicleHolds.some(h => h.holdType === 'fully_reserved');
  
  if (hasFullReservation) {
    return {
      allowed: false,
      reason: 'Vehicle is already fully reserved',
      currentHolds: vehicleHolds.length,
      hasFullReservation: true,
    };
  }
  
  if (vehicleHolds.length >= config.maxHoldsPerVehicle) {
    return {
      allowed: false,
      reason: `Vehicle has maximum ${config.maxHoldsPerVehicle} active holds`,
      currentHolds: vehicleHolds.length,
      hasFullReservation: false,
    };
  }
  
  return {
    allowed: true,
    currentHolds: vehicleHolds.length,
    hasFullReservation: false,
  };
}

/**
 * Get priority position in queue
 */
export function getQueuePosition(
  holdId: string,
  vehicleHolds: VehicleHold[]
): number {
  const activeHolds = vehicleHolds
    .filter(h => h.status !== 'expired' && h.status !== 'cancelled' && h.status !== 'converted')
    .sort((a, b) => {
      // Sort by priority (higher first), then by creation date (earlier first)
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  
  const index = activeHolds.findIndex(h => h.id === holdId);
  return index + 1; // 1-based position
}

/**
 * Create a new vehicle hold
 */
export function createVehicleHold(
  data: Omit<VehicleHold, 'id' | 'createdAt' | 'expiresAt' | 'status'>,
  config: ReservationConfig = DEFAULT_RESERVATION_CONFIG
): Omit<VehicleHold, 'id'> {
  const now = new Date();
  const expiresAt = calculateHoldExpiry(data.holdType, config, now);
  
  return {
    ...data,
    createdAt: now,
    expiresAt,
    status: 'pending',
  };
}

/**
 * Upgrade hold type
 */
export function upgradeHoldType(
  hold: VehicleHold,
  newType: HoldType,
  config: ReservationConfig = DEFAULT_RESERVATION_CONFIG
): VehicleHold {
  const typeOrder: HoldType[] = [
    'customer_interest',
    'viewing_scheduled',
    'deposit_pending',
    'fully_reserved',
  ];
  
  const currentIndex = typeOrder.indexOf(hold.holdType);
  const newIndex = typeOrder.indexOf(newType);
  
  if (newIndex <= currentIndex) {
    return hold; // Can't downgrade
  }
  
  return {
    ...hold,
    holdType: newType,
    expiresAt: calculateHoldExpiry(newType, config),
    status: newType === 'fully_reserved' ? 'deposit_paid' : hold.status,
    confirmedAt: newType === 'fully_reserved' ? new Date() : hold.confirmedAt,
  };
}

/**
 * Generate reservation reference number
 */
export function generateReservationRef(prefix: string = 'RES'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate refund amount based on cancellation policy
 */
export interface CancellationPolicy {
  fullRefundHours: number;       // Full refund if cancelled within this time
  partialRefundPercent: number;  // Partial refund percentage after full refund period
  noRefundHours: number;         // No refund after this time
}

export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  fullRefundHours: 24,
  partialRefundPercent: 50,
  noRefundHours: 72,
};

export function calculateRefund(
  hold: VehicleHold,
  policy: CancellationPolicy = DEFAULT_CANCELLATION_POLICY
): {
  refundAmount: number;
  refundPercent: number;
  reason: string;
} {
  if (!hold.depositAmount || !hold.depositPaidAt) {
    return {
      refundAmount: 0,
      refundPercent: 0,
      reason: 'No deposit paid',
    };
  }
  
  const hoursSinceDeposit = 
    (Date.now() - new Date(hold.depositPaidAt).getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceDeposit <= policy.fullRefundHours) {
    return {
      refundAmount: hold.depositAmount,
      refundPercent: 100,
      reason: 'Full refund - cancelled within grace period',
    };
  }
  
  if (hoursSinceDeposit <= policy.noRefundHours) {
    return {
      refundAmount: Math.round(hold.depositAmount * policy.partialRefundPercent / 100),
      refundPercent: policy.partialRefundPercent,
      reason: 'Partial refund - cancelled after grace period',
    };
  }
  
  return {
    refundAmount: 0,
    refundPercent: 0,
    reason: 'No refund - cancelled after refund period',
  };
}

/**
 * Format hold status for display
 */
export function formatHoldStatus(status: ReservationStatus): {
  label: string;
  color: string;
  icon: string;
} {
  const statusMap: Record<ReservationStatus, { label: string; color: string; icon: string }> = {
    pending: { label: 'Pending', color: '#f59e0b', icon: '⏳' },
    confirmed: { label: 'Confirmed', color: '#3b82f6', icon: '✓' },
    deposit_paid: { label: 'Deposit Paid', color: '#10b981', icon: '💰' },
    expired: { label: 'Expired', color: '#ef4444', icon: '⏰' },
    cancelled: { label: 'Cancelled', color: '#6b7280', icon: '✕' },
    converted: { label: 'Converted to Sale', color: '#8b5cf6', icon: '🎉' },
  };
  
  return statusMap[status];
}

/**
 * Format hold type for display
 */
export function formatHoldType(type: HoldType): {
  label: string;
  description: string;
} {
  const typeMap: Record<HoldType, { label: string; description: string }> = {
    customer_interest: {
      label: 'Interest Hold',
      description: 'Customer has expressed interest in the vehicle',
    },
    viewing_scheduled: {
      label: 'Viewing Scheduled',
      description: 'Customer has scheduled a viewing appointment',
    },
    deposit_pending: {
      label: 'Deposit Pending',
      description: 'Awaiting deposit payment from customer',
    },
    fully_reserved: {
      label: 'Fully Reserved',
      description: 'Vehicle is reserved with paid deposit',
    },
  };
  
  return typeMap[type];
}

/**
 * Get holds summary for a vehicle
 */
export function getVehicleHoldsSummary(holds: VehicleHold[]): {
  total: number;
  active: number;
  withDeposit: number;
  fullyReserved: boolean;
  nextToExpire?: VehicleHold;
} {
  const activeHolds = holds.filter(
    h => h.status !== 'expired' && h.status !== 'cancelled' && h.status !== 'converted'
  );
  
  const withDeposit = activeHolds.filter(h => h.depositPaidAt);
  const fullyReserved = activeHolds.some(h => h.holdType === 'fully_reserved');
  
  const nextToExpire = activeHolds
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())[0];
  
  return {
    total: holds.length,
    active: activeHolds.length,
    withDeposit: withDeposit.length,
    fullyReserved,
    nextToExpire,
  };
}

export default {
  calculateDeposit,
  calculateHoldExpiry,
  isHoldExpired,
  needsExpiryReminder,
  canCustomerPlaceHold,
  canVehicleAcceptHold,
  getQueuePosition,
  createVehicleHold,
  upgradeHoldType,
  generateReservationRef,
  calculateRefund,
  formatHoldStatus,
  formatHoldType,
  getVehicleHoldsSummary,
  DEFAULT_RESERVATION_CONFIG,
  DEFAULT_CANCELLATION_POLICY,
};
