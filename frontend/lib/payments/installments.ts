/**
 * Installment Payment Tracking System
 * Manages payment schedules, reminders, and tracking for car purchases
 */

export type InstallmentStatus = 
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'partial'
  | 'cancelled'
  | 'defaulted';

export type PaymentFrequency = 
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly';

export interface InstallmentPlan {
  id: string;
  orderId: string;
  customerId: string;
  tenantId: string;
  
  // Financial details
  totalAmount: number;
  downPayment: number;
  financedAmount: number;
  interestRate: number; // Annual percentage
  totalWithInterest: number;
  
  // Schedule
  numberOfInstallments: number;
  frequency: PaymentFrequency;
  installmentAmount: number;
  startDate: string;
  endDate: string;
  
  // Status
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  paidInstallments: number;
  remainingBalance: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  notes?: string;
}

export interface Installment {
  id: string;
  planId: string;
  installmentNumber: number;
  
  // Amount details
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  
  // Dates
  dueDate: string;
  paidDate?: string;
  
  // Status
  status: InstallmentStatus;
  daysOverdue: number;
  
  // Late fees
  lateFee: number;
  lateFeeApplied: boolean;
  
  // Payment details
  paymentMethod?: string;
  paymentReference?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  installmentId: string;
  planId: string;
  
  amount: number;
  paymentDate: string;
  paymentMethod: 'mobile_money' | 'bank_transfer' | 'cash' | 'card' | 'cheque';
  reference: string;
  
  // Provider details
  provider?: string;
  transactionId?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'failed' | 'reversed';
  confirmedBy?: string;
  confirmedAt?: string;
  
  // Metadata
  createdAt: string;
  notes?: string;
}

export interface InstallmentSummary {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  defaultedPlans: number;
  
  totalFinanced: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  
  overdueInstallments: number;
  upcomingInstallments: number;
  
  collectionRate: number;
  defaultRate: number;
}

/**
 * Calculate installment schedule
 */
export function calculateInstallmentPlan(
  totalAmount: number,
  downPayment: number,
  interestRate: number,
  numberOfInstallments: number,
  frequency: PaymentFrequency,
  startDate: Date
): {
  plan: Omit<InstallmentPlan, 'id' | 'orderId' | 'customerId' | 'tenantId' | 'createdAt' | 'updatedAt'>;
  schedule: Omit<Installment, 'id' | 'planId' | 'createdAt' | 'updatedAt'>[];
} {
  const financedAmount = totalAmount - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate monthly payment using amortization formula
  let installmentAmount: number;
  let totalWithInterest: number;
  
  if (interestRate > 0) {
    // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, numberOfInstallments);
    installmentAmount = financedAmount * (monthlyRate * factor) / (factor - 1);
    totalWithInterest = installmentAmount * numberOfInstallments;
  } else {
    installmentAmount = financedAmount / numberOfInstallments;
    totalWithInterest = financedAmount;
  }
  
  // Round to 2 decimal places
  installmentAmount = Math.round(installmentAmount * 100) / 100;
  totalWithInterest = Math.round(totalWithInterest * 100) / 100;
  
  // Calculate schedule
  const schedule: Omit<Installment, 'id' | 'planId' | 'createdAt' | 'updatedAt'>[] = [];
  let remainingPrincipal = financedAmount;
  let currentDate = new Date(startDate);
  
  for (let i = 1; i <= numberOfInstallments; i++) {
    // Calculate interest and principal portions
    const interestAmount = Math.round(remainingPrincipal * monthlyRate * 100) / 100;
    const principalAmount = Math.round((installmentAmount - interestAmount) * 100) / 100;
    remainingPrincipal -= principalAmount;
    
    // Get due date based on frequency
    const dueDate = getNextDueDate(currentDate, frequency);
    
    schedule.push({
      installmentNumber: i,
      principalAmount,
      interestAmount,
      totalAmount: installmentAmount,
      paidAmount: 0,
      remainingAmount: installmentAmount,
      dueDate: dueDate.toISOString(),
      status: 'pending',
      daysOverdue: 0,
      lateFee: 0,
      lateFeeApplied: false,
    });
    
    currentDate = dueDate;
  }
  
  // Calculate end date
  const endDate = schedule[schedule.length - 1].dueDate;
  
  return {
    plan: {
      totalAmount,
      downPayment,
      financedAmount,
      interestRate,
      totalWithInterest,
      numberOfInstallments,
      frequency,
      installmentAmount,
      startDate: startDate.toISOString(),
      endDate,
      status: 'active',
      paidInstallments: 0,
      remainingBalance: totalWithInterest,
    },
    schedule,
  };
}

/**
 * Get next due date based on frequency
 */
function getNextDueDate(currentDate: Date, frequency: PaymentFrequency): Date {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
  }
  
  return date;
}

/**
 * Calculate late fee
 */
export function calculateLateFee(
  installmentAmount: number,
  daysOverdue: number,
  lateFeeConfig: {
    type: 'fixed' | 'percentage' | 'daily';
    value: number;
    maxFee?: number;
    gracePeriod?: number;
  }
): number {
  const gracePeriod = lateFeeConfig.gracePeriod || 0;
  
  if (daysOverdue <= gracePeriod) {
    return 0;
  }
  
  const effectiveDays = daysOverdue - gracePeriod;
  let fee = 0;
  
  switch (lateFeeConfig.type) {
    case 'fixed':
      fee = lateFeeConfig.value;
      break;
    case 'percentage':
      fee = installmentAmount * (lateFeeConfig.value / 100);
      break;
    case 'daily':
      fee = lateFeeConfig.value * effectiveDays;
      break;
  }
  
  if (lateFeeConfig.maxFee) {
    fee = Math.min(fee, lateFeeConfig.maxFee);
  }
  
  return Math.round(fee * 100) / 100;
}

/**
 * Update installment status based on current date
 */
export function updateInstallmentStatus(
  installment: Installment,
  currentDate: Date = new Date()
): Installment {
  const dueDate = new Date(installment.dueDate);
  const diffTime = currentDate.getTime() - dueDate.getTime();
  const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let status: InstallmentStatus = installment.status;
  
  if (installment.paidAmount >= installment.totalAmount) {
    status = 'paid';
  } else if (installment.paidAmount > 0 && installment.paidAmount < installment.totalAmount) {
    status = 'partial';
  } else if (daysOverdue > 0) {
    status = daysOverdue > 90 ? 'defaulted' : 'overdue';
  } else {
    status = 'pending';
  }
  
  return {
    ...installment,
    status,
    daysOverdue: Math.max(0, daysOverdue),
    remainingAmount: installment.totalAmount - installment.paidAmount,
  };
}

/**
 * Get upcoming installments (due within X days)
 */
export function getUpcomingInstallments(
  installments: Installment[],
  daysAhead: number = 7
): Installment[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return installments.filter(inst => {
    if (inst.status === 'paid') return false;
    const dueDate = new Date(inst.dueDate);
    return dueDate >= now && dueDate <= futureDate;
  });
}

/**
 * Get overdue installments
 */
export function getOverdueInstallments(installments: Installment[]): Installment[] {
  return installments.filter(inst => 
    inst.status === 'overdue' || inst.status === 'defaulted'
  );
}

/**
 * Calculate collection summary
 */
export function calculateCollectionSummary(
  plans: InstallmentPlan[],
  installments: Installment[]
): InstallmentSummary {
  const activePlans = plans.filter(p => p.status === 'active').length;
  const completedPlans = plans.filter(p => p.status === 'completed').length;
  const defaultedPlans = plans.filter(p => p.status === 'defaulted').length;
  
  const totalFinanced = plans.reduce((sum, p) => sum + p.financedAmount, 0);
  const totalCollected = installments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = plans
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + p.remainingBalance, 0);
  const totalOverdue = installments
    .filter(i => i.status === 'overdue' || i.status === 'defaulted')
    .reduce((sum, i) => sum + i.remainingAmount, 0);
  
  const overdueInstallments = installments.filter(i => 
    i.status === 'overdue' || i.status === 'defaulted'
  ).length;
  
  const upcomingInstallments = getUpcomingInstallments(installments, 30).length;
  
  const collectionRate = totalFinanced > 0 
    ? (totalCollected / totalFinanced) * 100 
    : 0;
  
  const defaultRate = plans.length > 0 
    ? (defaultedPlans / plans.length) * 100 
    : 0;
  
  return {
    totalPlans: plans.length,
    activePlans,
    completedPlans,
    defaultedPlans,
    totalFinanced,
    totalCollected,
    totalOutstanding,
    totalOverdue,
    overdueInstallments,
    upcomingInstallments,
    collectionRate: Math.round(collectionRate * 100) / 100,
    defaultRate: Math.round(defaultRate * 100) / 100,
  };
}

/**
 * Generate payment reminder message
 */
export function generateReminderMessage(
  installment: Installment,
  customerName: string,
  currency: string
): {
  subject: string;
  message: string;
  urgency: 'info' | 'warning' | 'urgent';
} {
  const dueDate = new Date(installment.dueDate);
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(installment.remainingAmount);
  
  if (installment.status === 'overdue' || installment.status === 'defaulted') {
    return {
      subject: `⚠️ Overdue Payment - Installment #${installment.installmentNumber}`,
      message: `Dear ${customerName},\n\nYour installment payment of ${formattedAmount} was due on ${formattedDate} and is now ${installment.daysOverdue} days overdue.\n\nPlease make payment immediately to avoid additional late fees and potential default.\n\nThank you.`,
      urgency: 'urgent',
    };
  }
  
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDue <= 3) {
    return {
      subject: `🔔 Payment Due Soon - Installment #${installment.installmentNumber}`,
      message: `Dear ${customerName},\n\nThis is a reminder that your installment payment of ${formattedAmount} is due on ${formattedDate} (in ${daysUntilDue} days).\n\nPlease ensure funds are available to avoid late fees.\n\nThank you.`,
      urgency: 'warning',
    };
  }
  
  return {
    subject: `📅 Upcoming Payment - Installment #${installment.installmentNumber}`,
    message: `Dear ${customerName},\n\nThis is a friendly reminder that your next installment payment of ${formattedAmount} is due on ${formattedDate}.\n\nThank you for your continued payments.\n\nBest regards.`,
    urgency: 'info',
  };
}

export default {
  calculateInstallmentPlan,
  calculateLateFee,
  updateInstallmentStatus,
  getUpcomingInstallments,
  getOverdueInstallments,
  calculateCollectionSummary,
  generateReminderMessage,
};
