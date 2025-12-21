// =====================================================
// GLOBAL BUYER SERVICE
// One buyer account works across all opted-in dealers
// =====================================================

import { PrismaClient, BuyerAccountStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.BUYER_JWT_SECRET || process.env.JWT_SECRET || 'buyer-secret-key';
const SESSION_DURATION_DAYS = 30;

// =====================================================
// AUTHENTICATION
// =====================================================

export interface RegisterBuyerInput {
  email: string;
  phone?: string;
  fullName: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  buyer?: any;
  error?: string;
}

/**
 * Register a new global buyer account
 */
export async function registerBuyer(input: RegisterBuyerInput): Promise<LoginResult> {
  try {
    // Check if email already exists
    const existing = await prisma.globalBuyer.findUnique({
      where: { email: input.email.toLowerCase() }
    });

    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create buyer
    const buyer = await prisma.globalBuyer.create({
      data: {
        email: input.email.toLowerCase(),
        phone: input.phone,
        fullName: input.fullName,
        passwordHash,
        status: 'ACTIVE'
      }
    });

    // Create session
    const session = await createSession(buyer.id);

    return {
      success: true,
      token: session.token,
      buyer: sanitizeBuyer(buyer)
    };
  } catch (error: any) {
    console.error('Buyer registration error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Login a global buyer
 */
export async function loginBuyer(email: string, password: string): Promise<LoginResult> {
  try {
    const buyer = await prisma.globalBuyer.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!buyer || !buyer.passwordHash) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (buyer.status !== 'ACTIVE') {
      return { success: false, error: 'Account is not active' };
    }

    const validPassword = await bcrypt.compare(password, buyer.passwordHash);
    if (!validPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update login stats
    await prisma.globalBuyer.update({
      where: { id: buyer.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 }
      }
    });

    // Create session
    const session = await createSession(buyer.id);

    return {
      success: true,
      token: session.token,
      buyer: sanitizeBuyer(buyer)
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Verify buyer session token
 */
export async function verifyBuyerSession(token: string) {
  try {
    const session = await prisma.buyerSession.findUnique({
      where: { token },
      include: { buyer: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return { success: false, error: 'Invalid or expired session' };
    }

    if (session.buyer.status !== 'ACTIVE') {
      return { success: false, error: 'Account is not active' };
    }

    return {
      success: true,
      buyer: sanitizeBuyer(session.buyer)
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Logout buyer - invalidate session
 */
export async function logoutBuyer(token: string) {
  try {
    await prisma.buyerSession.delete({
      where: { token }
    });
    return { success: true };
  } catch (error) {
    return { success: true }; // Silent fail
  }
}

// =====================================================
// FAVORITES - ACROSS ALL DEALERS
// =====================================================

/**
 * Add a car to favorites
 */
export async function addToFavorites(buyerId: string, carId: string, notes?: string) {
  try {
    // Get car to verify it exists and get tenantId
    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: { id: true, tenantId: true }
    });

    if (!car) {
      return { success: false, error: 'Car not found' };
    }

    const favorite = await prisma.globalFavorite.upsert({
      where: {
        buyerId_carId: { buyerId, carId }
      },
      create: {
        buyerId,
        carId,
        tenantId: car.tenantId,
        notes
      },
      update: {
        notes
      }
    });

    return { success: true, favorite };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(buyerId: string, carId: string) {
  try {
    await prisma.globalFavorite.delete({
      where: {
        buyerId_carId: { buyerId, carId }
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all favorites for a buyer - across all dealers
 */
export async function getBuyerFavorites(buyerId: string, page: number = 1, limit: number = 20) {
  try {
    const [favorites, total] = await Promise.all([
      prisma.globalFavorite.findMany({
        where: { buyerId },
        include: {
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              title: true,
              priceLocalZmw: true,
              priceUsd: true,
              mileageKm: true,
              imagesJson: true,
              status: true,
              tenant: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.globalFavorite.count({ where: { buyerId } })
    ]);

    return {
      success: true,
      favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// CAR COMPARISON
// =====================================================

/**
 * Create or update a comparison list
 */
export async function saveComparison(buyerId: string, carIds: string[], name?: string) {
  try {
    // Get tenant IDs for tracking
    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      select: { id: true, tenantId: true }
    });

    const tenantIds = [...new Set(cars.map(c => c.tenantId))];

    const comparison = await prisma.carComparison.create({
      data: {
        buyerId,
        name: name || `Comparison ${new Date().toLocaleDateString()}`,
        carIds,
        tenantIds
      }
    });

    return { success: true, comparison };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get buyer's comparison lists
 */
export async function getBuyerComparisons(buyerId: string) {
  try {
    const comparisons = await prisma.carComparison.findMany({
      where: { buyerId },
      orderBy: { updatedAt: 'desc' }
    });

    // Fetch car details for each comparison
    const results = await Promise.all(
      comparisons.map(async (comp) => {
        const carIds = comp.carIds as string[];
        const cars = await prisma.car.findMany({
          where: { id: { in: carIds } },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            title: true,
            priceLocalZmw: true,
            priceUsd: true,
            mileageKm: true,
            transmission: true,
            fuelType: true,
            engineCc: true,
            imagesJson: true,
            tenant: {
              select: { name: true, slug: true }
            }
          }
        });
        return { ...comp, cars };
      })
    );

    return { success: true, comparisons: results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// NETWORK INQUIRIES
// =====================================================

export interface SendInquiryInput {
  buyerId: string;
  listingId: string;
  message: string;
  contactMethod?: 'email' | 'phone' | 'whatsapp';
}

/**
 * Send inquiry on a network listing
 */
export async function sendNetworkInquiry(input: SendInquiryInput) {
  try {
    // Get listing details
    const listing = await prisma.networkListing.findUnique({
      where: { id: input.listingId },
      include: {
        membership: {
          include: { tenant: true }
        }
      }
    });

    if (!listing || listing.status !== 'ACTIVE') {
      return { success: false, error: 'Listing not available' };
    }

    // Create inquiry
    const inquiry = await prisma.networkInquiry.create({
      data: {
        buyerId: input.buyerId,
        listingId: input.listingId,
        tenantId: listing.membership.tenantId,
        message: input.message,
        contactMethod: input.contactMethod,
        status: 'PENDING'
      }
    });

    // Update listing inquiry count
    await prisma.networkListing.update({
      where: { id: input.listingId },
      data: { inquiryCount: { increment: 1 } }
    });

    // Update membership lead count
    await prisma.networkMembership.update({
      where: { id: listing.membershipId },
      data: { monthlyLeadsReceived: { increment: 1 } }
    });

    return { success: true, inquiry };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get buyer's inquiry history
 */
export async function getBuyerInquiries(buyerId: string, page: number = 1, limit: number = 20) {
  try {
    const [inquiries, total] = await Promise.all([
      prisma.networkInquiry.findMany({
        where: { buyerId },
        include: {
          listing: {
            include: {
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  title: true,
                  imagesJson: true
                }
              },
              membership: {
                include: {
                  tenant: {
                    select: { name: true, slug: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.networkInquiry.count({ where: { buyerId } })
    ]);

    return {
      success: true,
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// PRICE ALERTS
// =====================================================

/**
 * Create a price alert
 */
export async function createPriceAlert(
  buyerId: string,
  params: {
    carId?: string;
    make?: string;
    model?: string;
    maxPrice: number;
    currency?: string;
  }
) {
  try {
    const alert = await prisma.priceAlert.create({
      data: {
        buyerId,
        carId: params.carId,
        make: params.make,
        model: params.model,
        maxPrice: params.maxPrice,
        currency: params.currency || 'ZMW',
        active: true
      }
    });

    return { success: true, alert };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get buyer's price alerts
 */
export async function getBuyerPriceAlerts(buyerId: string) {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, alerts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Toggle price alert active status
 */
export async function togglePriceAlert(buyerId: string, alertId: string) {
  try {
    const alert = await prisma.priceAlert.findFirst({
      where: { id: alertId, buyerId }
    });

    if (!alert) {
      return { success: false, error: 'Alert not found' };
    }

    const updated = await prisma.priceAlert.update({
      where: { id: alertId },
      data: { active: !alert.active }
    });

    return { success: true, alert: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// SEARCH HISTORY
// =====================================================

/**
 * Save a search to history
 */
export async function saveSearchHistory(buyerId: string, query: string, filters: any, resultsCount: number) {
  try {
    await prisma.buyerSearchHistory.create({
      data: {
        buyerId,
        searchQuery: query,
        filters,
        resultsCount
      }
    });
    return { success: true };
  } catch (error) {
    // Silent fail for history
    return { success: true };
  }
}

/**
 * Get buyer's recent searches
 */
export async function getRecentSearches(buyerId: string, limit: number = 10) {
  try {
    const searches = await prisma.buyerSearchHistory.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return { success: true, searches };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// HELPERS
// =====================================================

async function createSession(buyerId: string, ipAddress?: string, userAgent?: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  return prisma.buyerSession.create({
    data: {
      buyerId,
      token,
      ipAddress,
      userAgent,
      expiresAt
    }
  });
}

function sanitizeBuyer(buyer: any) {
  const { passwordHash, ...safe } = buyer;
  return safe;
}

export const globalBuyerService = {
  registerBuyer,
  loginBuyer,
  verifyBuyerSession,
  logoutBuyer,
  addToFavorites,
  removeFromFavorites,
  getBuyerFavorites,
  saveComparison,
  getBuyerComparisons,
  sendNetworkInquiry,
  getBuyerInquiries,
  createPriceAlert,
  getBuyerPriceAlerts,
  togglePriceAlert,
  saveSearchHistory,
  getRecentSearches
};
