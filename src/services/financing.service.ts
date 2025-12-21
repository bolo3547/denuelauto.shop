// =====================================================
// FINANCING PARTNER SERVICE
// White-label financing integration for partner banks/lenders
// =====================================================

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// =====================================================
// PARTNER MANAGEMENT
// =====================================================

/**
 * Register a new financing partner
 */
export async function registerFinancingPartner(data: {
  name: string;
  type: 'BANK' | 'MICROFINANCE' | 'LEASE_COMPANY' | 'OTHER';
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  apiWebhookUrl?: string;
  logoUrl?: string;
  description?: string;
  minLoanAmountZmw?: number;
  maxLoanAmountZmw?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  minTermMonths?: number;
  maxTermMonths?: number;
}) {
  try {
    // Generate API credentials
    const apiKey = `fp_${crypto.randomBytes(24).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');

    const partner = await prisma.financingPartner.create({
      data: {
        ...data,
        apiKey,
        apiSecret,
        status: 'PENDING'
      }
    });

    return {
      success: true,
      partner: {
        ...partner,
        // Only return API key on creation
        apiKey,
        apiSecret
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Approve a financing partner
 */
export async function approveFinancingPartner(partnerId: string) {
  try {
    const partner = await prisma.financingPartner.update({
      where: { id: partnerId },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date()
      }
    });

    return { success: true, partner };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Suspend a financing partner
 */
export async function suspendFinancingPartner(partnerId: string, reason: string) {
  try {
    const partner = await prisma.financingPartner.update({
      where: { id: partnerId },
      data: { status: 'SUSPENDED' }
    });

    return { success: true, partner };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all financing partners
 */
export async function getFinancingPartners(status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') {
  try {
    const partners = await prisma.financingPartner.findMany({
      where: status ? { status } : undefined,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        logoUrl: true,
        description: true,
        minLoanAmountZmw: true,
        maxLoanAmountZmw: true,
        minInterestRate: true,
        maxInterestRate: true,
        minTermMonths: true,
        maxTermMonths: true,
        createdAt: true,
        approvedAt: true,
        // Don't expose API credentials
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, partners };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Validate partner API credentials
 */
export async function validatePartnerApiKey(apiKey: string, apiSecret: string) {
  try {
    const partner = await prisma.financingPartner.findFirst({
      where: {
        apiKey,
        apiSecret,
        status: 'ACTIVE'
      }
    });

    if (!partner) {
      return { success: false, valid: false };
    }

    return { success: true, valid: true, partnerId: partner.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// FINANCING APPLICATIONS
// =====================================================

/**
 * Submit a financing application
 */
export async function submitFinancingApplication(data: {
  carId: string;
  partnerId: string;
  tenantId: string;
  globalBuyerId?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantNrc: string;
  monthlyIncome: number;
  employerName?: string;
  employmentStatus: string;
  requestedAmount: number;
  requestedTermMonths: number;
  downPayment?: number;
}) {
  try {
    // Verify partner is active
    const partner = await prisma.financingPartner.findUnique({
      where: { id: data.partnerId }
    });

    if (!partner || partner.status !== 'ACTIVE') {
      return { success: false, error: 'Financing partner is not available' };
    }

    // Verify car exists
    const car = await prisma.car.findUnique({
      where: { id: data.carId },
      select: { id: true, make: true, model: true, year: true, priceLocalZmw: true }
    });

    if (!car) {
      return { success: false, error: 'Car not found' };
    }

    // Create application
    const application = await prisma.financingApplication.create({
      data: {
        carId: data.carId,
        partnerId: data.partnerId,
        tenantId: data.tenantId,
        globalBuyerId: data.globalBuyerId,
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        applicantPhone: data.applicantPhone,
        applicantNrc: data.applicantNrc,
        monthlyIncome: data.monthlyIncome,
        employerName: data.employerName,
        employmentStatus: data.employmentStatus,
        requestedAmount: data.requestedAmount,
        requestedTermMonths: data.requestedTermMonths,
        downPayment: data.downPayment || 0,
        status: 'SUBMITTED'
      },
      include: {
        partner: {
          select: { name: true, type: true }
        },
        car: {
          select: { make: true, model: true, year: true }
        }
      }
    });

    // Notify partner via webhook if configured
    if (partner.apiWebhookUrl) {
      notifyPartnerWebhook(partner.apiWebhookUrl, {
        event: 'APPLICATION_SUBMITTED',
        applicationId: application.id,
        carDetails: car,
        requestedAmount: data.requestedAmount,
        requestedTermMonths: data.requestedTermMonths
      }).catch(err => console.error('Webhook notification failed:', err));
    }

    return { success: true, application };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update application status (used by partners)
 */
export async function updateApplicationStatus(
  applicationId: string,
  partnerId: string,
  status: 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CANCELLED',
  details?: {
    approvedAmount?: number;
    approvedRate?: number;
    approvedTermMonths?: number;
    monthlyPayment?: number;
    rejectionReason?: string;
    notes?: string;
  }
) {
  try {
    // Verify application belongs to partner
    const existing = await prisma.financingApplication.findFirst({
      where: { id: applicationId, partnerId }
    });

    if (!existing) {
      return { success: false, error: 'Application not found' };
    }

    const updateData: any = { status };

    if (details) {
      if (details.approvedAmount) updateData.approvedAmount = details.approvedAmount;
      if (details.approvedRate) updateData.approvedRate = details.approvedRate;
      if (details.approvedTermMonths) updateData.approvedTermMonths = details.approvedTermMonths;
      if (details.monthlyPayment) updateData.monthlyPayment = details.monthlyPayment;
      if (details.rejectionReason) updateData.rejectionReason = details.rejectionReason;
      if (details.notes) updateData.partnerNotes = details.notes;
    }

    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
    } else if (status === 'DISBURSED') {
      updateData.disbursedAt = new Date();
    }

    const application = await prisma.financingApplication.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        partner: { select: { name: true } },
        car: { select: { make: true, model: true, year: true } }
      }
    });

    // TODO: Send notification to applicant

    return { success: true, application };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get applications for a partner
 */
export async function getPartnerApplications(partnerId: string, status?: string) {
  try {
    const applications = await prisma.financingApplication.findMany({
      where: {
        partnerId,
        ...(status && { status: status as any })
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            priceLocalZmw: true,
            imagesJson: true
          }
        },
        tenant: {
          select: { name: true, city: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, applications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get applications for a tenant (dealership)
 */
export async function getTenantApplications(tenantId: string) {
  try {
    const applications = await prisma.financingApplication.findMany({
      where: { tenantId },
      include: {
        partner: {
          select: { name: true, type: true }
        },
        car: {
          select: { make: true, model: true, year: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, applications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get applications for a buyer
 */
export async function getBuyerApplications(buyerId: string) {
  try {
    // Could be global buyer ID or application by email
    const applications = await prisma.financingApplication.findMany({
      where: {
        OR: [
          { globalBuyerId: buyerId },
          // Could also match by email for non-registered users
        ]
      },
      include: {
        partner: {
          select: { name: true, type: true }
        },
        car: {
          select: { make: true, model: true, year: true, priceLocalZmw: true }
        },
        tenant: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, applications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// FINANCING CALCULATOR
// =====================================================

/**
 * Calculate monthly payment
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  
  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.round(payment * 100) / 100;
}

/**
 * Get financing options for a car
 */
export async function getFinancingOptions(carId: string) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: { priceLocalZmw: true, priceUsd: true }
    });

    if (!car || !car.priceLocalZmw) {
      return { success: false, error: 'Car price not available' };
    }

    const price = Number(car.priceLocalZmw);

    // Get all active financing partners
    const partners = await prisma.financingPartner.findMany({
      where: {
        status: 'ACTIVE',
        minLoanAmountZmw: { lte: price },
        maxLoanAmountZmw: { gte: price * 0.5 } // At least 50% financing
      },
      select: {
        id: true,
        name: true,
        type: true,
        logoUrl: true,
        minInterestRate: true,
        maxInterestRate: true,
        minTermMonths: true,
        maxTermMonths: true
      }
    });

    // Calculate sample payments for each partner
    const options = partners.map(partner => {
      const loanAmount = price * 0.8; // 80% financing (20% down)
      const rate = partner.minInterestRate || 15;
      const term = partner.maxTermMonths || 48;

      const monthlyPayment = calculateMonthlyPayment(loanAmount, rate, term);
      const totalPayment = monthlyPayment * term;
      const totalInterest = totalPayment - loanAmount;

      return {
        partnerId: partner.id,
        partnerName: partner.name,
        partnerType: partner.type,
        partnerLogo: partner.logoUrl,
        sampleCalculation: {
          downPayment: price * 0.2,
          loanAmount,
          interestRate: rate,
          termMonths: term,
          monthlyPayment,
          totalPayment,
          totalInterest
        },
        rateRange: {
          min: partner.minInterestRate,
          max: partner.maxInterestRate
        },
        termRange: {
          min: partner.minTermMonths,
          max: partner.maxTermMonths
        }
      };
    });

    return {
      success: true,
      carPrice: price,
      options,
      disclaimer: 'These are sample calculations. Actual rates and terms depend on your credit profile and may vary.'
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// PARTNER WEBHOOK INTEGRATION
// =====================================================

async function notifyPartnerWebhook(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Webhook response not OK:', response.status);
    }
  } catch (error) {
    console.error('Webhook notification error:', error);
    throw error;
  }
}

/**
 * Handle incoming webhook from partner
 */
export async function handlePartnerWebhook(
  apiKey: string,
  apiSecret: string,
  event: string,
  payload: any
) {
  try {
    // Validate partner credentials
    const validation = await validatePartnerApiKey(apiKey, apiSecret);
    if (!validation.success || !validation.valid) {
      return { success: false, error: 'Invalid API credentials' };
    }

    const partnerId = validation.partnerId!;

    switch (event) {
      case 'APPLICATION_STATUS_UPDATE':
        return updateApplicationStatus(
          payload.applicationId,
          partnerId,
          payload.status,
          payload.details
        );

      case 'APPLICATION_DISBURSED':
        return updateApplicationStatus(
          payload.applicationId,
          partnerId,
          'DISBURSED',
          { notes: payload.disbursementReference }
        );

      default:
        return { success: false, error: `Unknown event type: ${event}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// STATISTICS
// =====================================================

/**
 * Get financing statistics for Super Admin
 */
export async function getFinancingStatistics() {
  try {
    const [
      totalApplications,
      statusBreakdown,
      partnerBreakdown,
      recentApplications,
      monthlyTotals
    ] = await Promise.all([
      prisma.financingApplication.count(),
      prisma.financingApplication.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.financingApplication.groupBy({
        by: ['partnerId'],
        _count: true,
        _sum: { requestedAmount: true }
      }),
      prisma.financingApplication.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          partner: { select: { name: true } },
          car: { select: { make: true, model: true } }
        }
      }),
      prisma.financingApplication.aggregate({
        _sum: { approvedAmount: true, requestedAmount: true }
      })
    ]);

    return {
      success: true,
      statistics: {
        totalApplications,
        statusBreakdown: statusBreakdown.reduce((acc, s) => {
          acc[s.status] = s._count;
          return acc;
        }, {} as Record<string, number>),
        partnerBreakdown,
        recentApplications,
        totals: {
          requestedAmount: monthlyTotals._sum.requestedAmount,
          approvedAmount: monthlyTotals._sum.approvedAmount
        }
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const financingService = {
  registerFinancingPartner,
  approveFinancingPartner,
  suspendFinancingPartner,
  getFinancingPartners,
  validatePartnerApiKey,
  submitFinancingApplication,
  updateApplicationStatus,
  getPartnerApplications,
  getTenantApplications,
  getBuyerApplications,
  calculateMonthlyPayment,
  getFinancingOptions,
  handlePartnerWebhook,
  getFinancingStatistics
};
