// =====================================================
// DEALER VERIFICATION SERVICE
// Verified Badge system with KYC and compliance
// =====================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================================
// VERIFICATION WORKFLOW
// =====================================================

/**
 * Start dealer verification process
 */
export async function startVerification(tenantId: string) {
  try {
    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, businessName: true }
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Check for existing verification
    const existing = await prisma.dealerVerification.findUnique({
      where: { tenantId }
    });

    if (existing && existing.status === 'VERIFIED') {
      return { success: false, error: 'Tenant is already verified' };
    }

    // Create or update verification record
    const verification = await prisma.dealerVerification.upsert({
      where: { tenantId },
      create: {
        tenantId,
        status: 'PENDING',
        level: 'BASIC'
      },
      update: {
        status: 'PENDING',
        rejectionReason: null
      }
    });

    return { success: true, verification };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Submit verification document
 */
export async function submitVerificationDocument(data: {
  tenantId: string;
  documentType: 'BUSINESS_REGISTRATION' | 'TAX_CLEARANCE' | 'TPIN_CERTIFICATE' | 'BANK_STATEMENT' | 'UTILITY_BILL' | 'OWNER_ID' | 'TRADE_LICENSE' | 'OTHER';
  documentUrl: string;
  documentNumber?: string;
  expiresAt?: Date;
  notes?: string;
}) {
  try {
    // Get verification record
    const verification = await prisma.dealerVerification.findUnique({
      where: { tenantId: data.tenantId }
    });

    if (!verification) {
      return { success: false, error: 'Please start verification process first' };
    }

    // Create document record
    const document = await prisma.verificationDocument.create({
      data: {
        verificationId: verification.id,
        documentType: data.documentType,
        documentUrl: data.documentUrl,
        documentNumber: data.documentNumber,
        expiresAt: data.expiresAt,
        notes: data.notes,
        status: 'PENDING'
      }
    });

    // Update verification to under review
    await prisma.dealerVerification.update({
      where: { id: verification.id },
      data: { status: 'UNDER_REVIEW' }
    });

    return { success: true, document };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Review verification document (Admin)
 */
export async function reviewDocument(
  documentId: string,
  status: 'APPROVED' | 'REJECTED',
  reviewNotes?: string,
  rejectionReason?: string
) {
  try {
    const document = await prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewNotes,
        rejectionReason
      },
      include: {
        verification: {
          select: { id: true, tenantId: true }
        }
      }
    });

    // Check if all documents are reviewed
    await checkVerificationComplete(document.verification.id);

    return { success: true, document };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if all required documents are approved
 */
async function checkVerificationComplete(verificationId: string) {
  const verification = await prisma.dealerVerification.findUnique({
    where: { id: verificationId },
    include: {
      documents: true
    }
  });

  if (!verification) return;

  // Required documents for BASIC level
  const requiredTypes = ['BUSINESS_REGISTRATION', 'TAX_CLEARANCE'];
  
  // For PREMIUM level
  const premiumTypes = [...requiredTypes, 'BANK_STATEMENT', 'TRADE_LICENSE'];

  const approvedDocs = verification.documents
    .filter(d => d.status === 'APPROVED')
    .map(d => d.documentType);

  // Check basic requirements
  const hasBasic = requiredTypes.every(t => approvedDocs.includes(t));
  const hasPremium = premiumTypes.every(t => approvedDocs.includes(t));

  // Check for rejections
  const hasRejections = verification.documents.some(d => d.status === 'REJECTED');

  if (hasRejections) {
    await prisma.dealerVerification.update({
      where: { id: verificationId },
      data: {
        status: 'REJECTED',
        rejectionReason: 'One or more documents were rejected. Please re-submit.'
      }
    });
  } else if (hasPremium) {
    await prisma.dealerVerification.update({
      where: { id: verificationId },
      data: {
        status: 'VERIFIED',
        level: 'PREMIUM',
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });
  } else if (hasBasic) {
    await prisma.dealerVerification.update({
      where: { id: verificationId },
      data: {
        status: 'VERIFIED',
        level: 'BASIC',
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });
  }
}

/**
 * Complete verification (Super Admin manual approval)
 */
export async function completeVerification(
  tenantId: string,
  level: 'BASIC' | 'PREMIUM' | 'ENTERPRISE',
  adminNotes?: string
) {
  try {
    const verification = await prisma.dealerVerification.update({
      where: { tenantId },
      data: {
        status: 'VERIFIED',
        level,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    return { success: true, verification };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Reject verification
 */
export async function rejectVerification(tenantId: string, reason: string) {
  try {
    const verification = await prisma.dealerVerification.update({
      where: { tenantId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason
      }
    });

    return { success: true, verification };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Suspend verification (compliance issue)
 */
export async function suspendVerification(tenantId: string, reason: string) {
  try {
    const verification = await prisma.dealerVerification.update({
      where: { tenantId },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        rejectionReason: reason
      }
    });

    return { success: true, verification };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// VERIFICATION STATUS
// =====================================================

/**
 * Get verification status for a tenant
 */
export async function getVerificationStatus(tenantId: string) {
  try {
    const verification = await prisma.dealerVerification.findUnique({
      where: { tenantId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!verification) {
      return {
        success: true,
        status: 'NOT_STARTED',
        verification: null
      };
    }

    // Check if verification is expired
    if (verification.expiresAt && verification.expiresAt < new Date()) {
      return {
        success: true,
        status: 'EXPIRED',
        verification
      };
    }

    return {
      success: true,
      status: verification.status,
      verification
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if tenant has valid verification badge
 */
export async function isVerified(tenantId: string): Promise<{ verified: boolean; level?: string }> {
  try {
    const verification = await prisma.dealerVerification.findUnique({
      where: { tenantId }
    });

    if (!verification) {
      return { verified: false };
    }

    if (verification.status !== 'VERIFIED') {
      return { verified: false };
    }

    if (verification.expiresAt && verification.expiresAt < new Date()) {
      return { verified: false };
    }

    return {
      verified: true,
      level: verification.level
    };
  } catch (error) {
    return { verified: false };
  }
}

/**
 * Get required documents for verification level
 */
export function getRequiredDocuments(level: 'BASIC' | 'PREMIUM' | 'ENTERPRISE') {
  const basic = [
    { type: 'BUSINESS_REGISTRATION', description: 'Certificate of Incorporation or Business Registration', required: true },
    { type: 'TAX_CLEARANCE', description: 'Valid Tax Clearance Certificate', required: true },
    { type: 'OWNER_ID', description: 'Owner/Director National ID (NRC)', required: true }
  ];

  const premium = [
    ...basic,
    { type: 'TPIN_CERTIFICATE', description: 'TPIN Certificate', required: true },
    { type: 'BANK_STATEMENT', description: 'Bank Statement (last 3 months)', required: true },
    { type: 'TRADE_LICENSE', description: 'Motor Trade License', required: true }
  ];

  const enterprise = [
    ...premium,
    { type: 'UTILITY_BILL', description: 'Utility Bill (proof of physical location)', required: true },
    { type: 'OTHER', description: 'Additional documents as requested', required: false }
  ];

  switch (level) {
    case 'BASIC': return basic;
    case 'PREMIUM': return premium;
    case 'ENTERPRISE': return enterprise;
  }
}

// =====================================================
// ADMIN FUNCTIONS
// =====================================================

/**
 * Get all pending verifications for review
 */
export async function getPendingVerifications() {
  try {
    const verifications = await prisma.dealerVerification.findMany({
      where: {
        status: { in: ['PENDING', 'UNDER_REVIEW'] }
      },
      include: {
        tenant: {
          select: { id: true, name: true, businessName: true, city: true }
        },
        documents: {
          where: { status: 'PENDING' }
        }
      },
      orderBy: { updatedAt: 'asc' } // Oldest first
    });

    return { success: true, verifications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all verified dealers
 */
export async function getVerifiedDealers() {
  try {
    const verified = await prisma.dealerVerification.findMany({
      where: {
        status: 'VERIFIED',
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      include: {
        tenant: {
          select: { id: true, name: true, businessName: true, city: true, slug: true }
        }
      },
      orderBy: { level: 'desc' }
    });

    return { success: true, dealers: verified };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get expiring verifications (within 30 days)
 */
export async function getExpiringVerifications() {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiring = await prisma.dealerVerification.findMany({
      where: {
        status: 'VERIFIED',
        expiresAt: {
          gte: new Date(),
          lte: thirtyDaysFromNow
        }
      },
      include: {
        tenant: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { expiresAt: 'asc' }
    });

    return { success: true, expiring };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get verification statistics
 */
export async function getVerificationStatistics() {
  try {
    const [total, byStatus, byLevel] = await Promise.all([
      prisma.dealerVerification.count(),
      prisma.dealerVerification.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.dealerVerification.groupBy({
        by: ['level'],
        where: { status: 'VERIFIED' },
        _count: true
      })
    ]);

    return {
      success: true,
      statistics: {
        total,
        byStatus: byStatus.reduce((acc, s) => {
          acc[s.status] = s._count;
          return acc;
        }, {} as Record<string, number>),
        byLevel: byLevel.reduce((acc, l) => {
          acc[l.level] = l._count;
          return acc;
        }, {} as Record<string, number>)
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const dealerVerificationService = {
  startVerification,
  submitVerificationDocument,
  reviewDocument,
  completeVerification,
  rejectVerification,
  suspendVerification,
  getVerificationStatus,
  isVerified,
  getRequiredDocuments,
  getPendingVerifications,
  getVerifiedDealers,
  getExpiringVerifications,
  getVerificationStatistics
};
