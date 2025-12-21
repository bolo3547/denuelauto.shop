// =====================================================
// DENUEL AUTO NETWORK SERVICE
// National Dealer Network - Shared Marketplace Layer
// =====================================================

import { PrismaClient, NetworkMembershipStatus, NetworkListingStatus } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================================
// NETWORK MEMBERSHIP MANAGEMENT
// =====================================================

export interface JoinNetworkInput {
  tenantId: string;
  agreedTermsVersion: string;
}

export interface NetworkMembershipResult {
  success: boolean;
  membership?: any;
  error?: string;
}

/**
 * Tenant opts-in to join the Denuel Auto Network
 */
export async function joinNetwork(input: JoinNetworkInput): Promise<NetworkMembershipResult> {
  try {
    // Check if already a member
    const existing = await prisma.networkMembership.findUnique({
      where: { tenantId: input.tenantId }
    });

    if (existing) {
      if (existing.status === 'OPTED_OUT') {
        // Re-join network
        const updated = await prisma.networkMembership.update({
          where: { tenantId: input.tenantId },
          data: {
            status: 'PENDING',
            optedOutAt: null,
            agreedTermsAt: new Date(),
            agreedTermsVersion: input.agreedTermsVersion
          }
        });
        return { success: true, membership: updated };
      }
      return { success: false, error: 'Already a network member' };
    }

    // Create new membership
    const membership = await prisma.networkMembership.create({
      data: {
        tenantId: input.tenantId,
        status: 'PENDING',
        agreedTermsAt: new Date(),
        agreedTermsVersion: input.agreedTermsVersion,
        visibilityRank: 100,
        commissionRate: 5.0 // Default 5% commission on network leads
      }
    });

    return { success: true, membership };
  } catch (error: any) {
    console.error('Error joining network:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Super Admin approves a network membership
 */
export async function approveNetworkMembership(
  membershipId: string,
  reviewedBy: string = 'system',
  notes?: string
): Promise<NetworkMembershipResult> {
  try {
    const membership = await prisma.networkMembership.update({
      where: { id: membershipId },
      data: {
        status: 'ACTIVE',
        joinedAt: new Date(),
        reviewedBy,
        reviewedAt: new Date(),
        notes,
      },
    });

    return { success: true, membership };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Tenant opts-out of the network
 */
export async function leaveNetwork(tenantId: string): Promise<NetworkMembershipResult> {
  try {
    const membership = await prisma.networkMembership.update({
      where: { tenantId },
      data: {
        status: 'OPTED_OUT',
        optedOutAt: new Date()
      }
    });

    // Deactivate all network listings
    await prisma.networkListing.updateMany({
      where: { membership: { tenantId } },
      data: { status: 'SUSPENDED' }
    });

    return { success: true, membership };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// NETWORK LISTING MANAGEMENT
// =====================================================

export interface ListCarOnNetworkInput {
  tenantId: string;
  carId: string;
  listPrice: number;
  currency?: string;
}

/**
 * List a car on the National Dealer Network
 */
export async function listCarOnNetwork(input: ListCarOnNetworkInput) {
  try {
    // Verify membership is active
    const membership = await prisma.networkMembership.findUnique({
      where: { tenantId: input.tenantId }
    });

    if (!membership || membership.status !== 'ACTIVE') {
      return { success: false, error: 'Must be an active network member to list cars' };
    }

    // Verify car exists and belongs to tenant
    const car = await prisma.car.findFirst({
      where: { id: input.carId, tenantId: input.tenantId },
      include: { media: true }
    });

    if (!car) {
      return { success: false, error: 'Car not found or does not belong to tenant' };
    }

    // Calculate quality score based on listing completeness
    const qualityScore = calculateListingQuality(car);

    // Create or update network listing
    const listing = await prisma.networkListing.upsert({
      where: {
        membershipId_carId: {
          membershipId: membership.id,
          carId: input.carId
        }
      },
      create: {
        membershipId: membership.id,
        carId: input.carId,
        listPrice: input.listPrice,
        currency: input.currency || 'ZMW',
        status: qualityScore >= 70 ? 'ACTIVE' : 'PENDING_REVIEW',
        qualityScore
      },
      update: {
        listPrice: input.listPrice,
        currency: input.currency || 'ZMW',
        qualityScore,
        status: qualityScore >= 70 ? 'ACTIVE' : 'PENDING_REVIEW'
      }
    });

    return { success: true, listing };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Calculate listing quality score based on completeness
 */
function calculateListingQuality(car: any): number {
  let score = 0;
  const maxScore = 100;

  // Basic info (30 points)
  if (car.make) score += 5;
  if (car.model) score += 5;
  if (car.year) score += 5;
  if (car.title) score += 5;
  if (car.priceLocalZmw || car.priceUsd) score += 10;

  // Details (30 points)
  if (car.mileageKm) score += 5;
  if (car.transmission) score += 5;
  if (car.fuelType) score += 5;
  if (car.bodyType) score += 5;
  if (car.engineCc) score += 5;
  if (car.condition) score += 5;

  // Media (30 points)
  const images = car.imagesJson || [];
  if (images.length >= 1) score += 10;
  if (images.length >= 5) score += 10;
  if (images.length >= 10) score += 10;

  // Additional (10 points)
  if (car.featuresJson && Object.keys(car.featuresJson).length > 0) score += 5;
  if (car.remarks) score += 5;

  return Math.min(score, maxScore);
}

/**
 * Remove a car from the network
 */
export async function removeCarFromNetwork(listingId: string, tenantId: string) {
  try {
    const listing = await prisma.networkListing.findUnique({
      where: { id: listingId },
      include: {
        membership: true,
      },
    });

    if (!listing || listing.membership.tenantId !== tenantId) {
      return { success: false, error: 'Listing not found for this tenant' };
    }

    await prisma.networkListing.delete({
      where: { id: listingId },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// NETWORK SEARCH & DISCOVERY
// =====================================================

export interface NetworkSearchParams {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  condition?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'quality';
  page?: number;
  limit?: number;
}

/**
 * Search cars across the entire Denuel Auto Network
 */
export async function searchNetwork(params: NetworkSearchParams) {
  const {
    make,
    model,
    minYear,
    maxYear,
    minPrice,
    maxPrice,
    bodyType,
    transmission,
    fuelType,
    condition,
    sortBy = 'quality',
    page = 1,
    limit = 20
  } = params;

  try {
    // Build filters
    const where: any = {
      status: 'ACTIVE',
      membership: {
        status: 'ACTIVE'
      },
      car: {
        status: 'available',
        publishToPublic: true
      }
    };

    // Car filters
    if (make) where.car.make = { contains: make, mode: 'insensitive' };
    if (model) where.car.model = { contains: model, mode: 'insensitive' };
    if (minYear) where.car.year = { ...where.car.year, gte: minYear };
    if (maxYear) where.car.year = { ...where.car.year, lte: maxYear };
    if (bodyType) where.car.bodyType = bodyType;
    if (transmission) where.car.transmission = transmission;
    if (fuelType) where.car.fuelType = fuelType;
    if (condition) where.car.condition = condition;

    // Price filters
    if (minPrice) where.listPrice = { ...where.listPrice, gte: minPrice };
    if (maxPrice) where.listPrice = { ...where.listPrice, lte: maxPrice };

    // Sorting
    let orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy = { listPrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { listPrice: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'quality':
      default:
        orderBy = [{ qualityScore: 'desc' }, { membership: { visibilityRank: 'asc' } }];
    }

    // Execute search
    const [listings, total] = await Promise.all([
      prisma.networkListing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
          include: {
            car: {
              select: {
                id: true,
                stockNo: true,
                make: true,
                model: true,
                year: true,
                title: true,
                mileageKm: true,
                transmission: true,
                fuelType: true,
                bodyType: true,
                condition: true,
                colorExt: true,
                imagesJson: true,
                priceLocalZmw: true,
                priceUsd: true
              }
            },
          membership: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        }
      }),
      prisma.networkListing.count({ where })
    ]);

    // Track search analytics
    await trackSearchAnalytics({ make, model, bodyType, minYear, maxYear, minPrice, maxPrice, resultCount: total });

    return {
      success: true,
      data: listings,
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

/**
 * Get featured listings for homepage/banner
 */
export async function getFeaturedListings(type: string, limit: number = 10) {
  try {
    const now = new Date();

    // Get active featured placements
    const placements = await prisma.featuredPlacement.findMany({
      where: {
        type: type as any,
        active: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        membership: {
          include: {
            tenant: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      },
      orderBy: { amountPaid: 'desc' },
      take: limit
    });

    // Get cars for featured placements
    const carIds = placements.filter(p => p.carId).map(p => p.carId!);
    
    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      include: {
        tenant: { select: { id: true, name: true, slug: true } }
      }
    });

    // Track impressions
    await prisma.featuredPlacement.updateMany({
      where: { id: { in: placements.map(p => p.id) } },
      data: { impressions: { increment: 1 } }
    });

    return { success: true, placements, cars };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// NETWORK ANALYTICS
// =====================================================

/**
 * Track search analytics for market intelligence
 */
async function trackSearchAnalytics(params: {
  make?: string;
  model?: string;
  bodyType?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  resultCount?: number;
}) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.searchAnalytics.upsert({
      where: {
        id: `${params.make || 'any'}-${params.model || 'any'}-${today.toISOString().split('T')[0]}`
      },
      create: {
        make: params.make,
        model: params.model,
        bodyType: params.bodyType,
        minYear: params.minYear,
        maxYear: params.maxYear,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        searchCount: 1,
        resultCount: params.resultCount,
        date: today
      },
      update: {
        searchCount: { increment: 1 },
        resultCount: params.resultCount
      }
    });
  } catch (error) {
    // Silent fail for analytics
    console.error('Search analytics tracking failed:', error);
  }
}

/**
 * Track listing view
 */
export async function trackListingView(listingId: string) {
  try {
    await prisma.networkListing.update({
      where: { id: listingId },
      data: { viewCount: { increment: 1 } }
    });
  } catch (error) {
    console.error('View tracking failed:', error);
  }
}

/**
 * Get network statistics for Super Admin dashboard
 */
export async function getNetworkStatistics() {
  try {
    const [
      totalMembers,
      activeMembers,
      pendingMembers,
      totalListings,
      activeListings,
      totalInquiries,
      totalViews
    ] = await Promise.all([
      prisma.networkMembership.count(),
      prisma.networkMembership.count({ where: { status: 'ACTIVE' } }),
      prisma.networkMembership.count({ where: { status: 'PENDING' } }),
      prisma.networkListing.count(),
      prisma.networkListing.count({ where: { status: 'ACTIVE' } }),
      prisma.networkInquiry.count(),
      prisma.networkListing.aggregate({ _sum: { viewCount: true } })
    ]);

    // Get top searched makes
    const topSearches = await prisma.searchAnalytics.groupBy({
      by: ['make'],
      _sum: { searchCount: true },
      orderBy: { _sum: { searchCount: 'desc' } },
      take: 10
    });

    return {
      success: true,
      stats: {
        totalMembers,
        activeMembers,
        pendingMembers,
        totalListings,
        activeListings,
        totalInquiries,
        totalViews: totalViews._sum.viewCount || 0,
        topSearches
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const networkService = {
  joinNetwork,
  approveNetworkMembership,
  leaveNetwork,
  listCarOnNetwork,
  removeCarFromNetwork,
  searchNetwork,
  getFeaturedListings,
  trackListingView,
  getNetworkStatistics
};
