// =====================================================
// MARKET INTELLIGENCE SERVICE
// National data dashboard & AI pricing recommendations
// =====================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================================
// MARKET DATA AGGREGATION
// =====================================================

/**
 * Aggregate market data from all network listings
 * Run this as a scheduled job (daily/weekly)
 */
export async function aggregateMarketData() {
  try {
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30); // Last 30 days

    // Get all active listings grouped by make/model/year
    const listings = await prisma.networkListing.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: periodStart }
      },
      include: {
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            bodyType: true,
            transmission: true,
            mileageKm: true,
            condition: true,
            priceLocalZmw: true,
            priceUsd: true
          }
        }
      }
    });

    // Group by make/model/year
    const groups = new Map<string, any[]>();
    
    listings.forEach(listing => {
      const car = listing.car;
      const key = `${car.make}-${car.model}-${car.year}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push({
        price: Number(listing.listPrice),
        priceZmw: car.priceLocalZmw ? Number(car.priceLocalZmw) : null,
        priceUsd: car.priceUsd ? Number(car.priceUsd) : null,
        bodyType: car.bodyType,
        transmission: car.transmission,
        mileageKm: car.mileageKm,
        condition: car.condition,
        viewCount: listing.viewCount,
        inquiryCount: listing.inquiryCount
      });
    });

    // Calculate statistics for each group
    const results: any[] = [];
    
    for (const [key, items] of groups) {
      if (items.length < 2) continue; // Need at least 2 samples
      
      const [make, model, yearStr] = key.split('-');
      const year = parseInt(yearStr);
      
      const prices = items.map(i => i.price).filter(p => p > 0);
      const pricesZmw = items.map(i => i.priceZmw).filter(p => p != null && p > 0);
      const pricesUsd = items.map(i => i.priceUsd).filter(p => p != null && p > 0);
      
      if (prices.length < 2) continue;
      
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      // Calculate demand score based on views and inquiries
      const totalViews = items.reduce((a, b) => a + b.viewCount, 0);
      const totalInquiries = items.reduce((a, b) => a + b.inquiryCount, 0);
      const demandScore = Math.min(100, Math.round((totalInquiries / Math.max(totalViews, 1)) * 1000));
      
      // Supply score based on number of listings
      const supplyScore = Math.min(100, items.length * 10);

      results.push({
        make,
        model,
        year,
        avgPriceZmw: pricesZmw.length > 0 ? pricesZmw.reduce((a, b) => a + b, 0) / pricesZmw.length : avgPrice,
        avgPriceUsd: pricesUsd.length > 0 ? pricesUsd.reduce((a, b) => a + b, 0) / pricesUsd.length : null,
        minPrice,
        maxPrice,
        sampleCount: items.length,
        demandScore,
        supplyScore,
        periodStart,
        periodEnd
      });
    }

    // Upsert market data points
    for (const data of results) {
      await prisma.marketDataPoint.upsert({
        where: {
          id: `${data.make}-${data.model}-${data.year}-${periodEnd.toISOString().split('T')[0]}`
        },
        create: {
          ...data
        },
        update: {
          ...data
        }
      });
    }

    console.log(`Aggregated market data for ${results.length} make/model/year combinations`);
    return { success: true, count: results.length };
  } catch (error: any) {
    console.error('Market data aggregation error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// MARKET INSIGHTS
// =====================================================

/**
 * Get top searched vehicles
 */
export async function getTopSearchedVehicles(limit: number = 10) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const results = await prisma.searchAnalytics.groupBy({
      by: ['make', 'model'],
      _sum: { searchCount: true },
      where: {
        date: { gte: thirtyDaysAgo },
        make: { not: null }
      },
      orderBy: { _sum: { searchCount: 'desc' } },
      take: limit
    });

    return {
      success: true,
      data: results.map(r => ({
        make: r.make,
        model: r.model,
        searchCount: r._sum.searchCount || 0
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get average prices by make/model
 */
export async function getAveragePrices(make?: string, model?: string) {
  try {
    const where: any = {};
    if (make) where.make = make;
    if (model) where.model = model;

    const data = await prisma.marketDataPoint.findMany({
      where,
      orderBy: [{ make: 'asc' }, { model: 'asc' }, { year: 'desc' }],
      take: 100
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get fastest selling vehicles
 */
export async function getFastestSellingVehicles(limit: number = 10) {
  try {
    const data = await prisma.marketDataPoint.findMany({
      where: {
        daysToSellAvg: { not: null, gt: 0 }
      },
      orderBy: { daysToSellAvg: 'asc' },
      take: limit
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get demand vs supply analysis
 */
export async function getDemandSupplyAnalysis() {
  try {
    // High demand, low supply = opportunity
    const opportunities = await prisma.marketDataPoint.findMany({
      where: {
        demandScore: { gte: 60 },
        supplyScore: { lte: 40 }
      },
      orderBy: { demandScore: 'desc' },
      take: 20
    });

    // Low demand, high supply = oversupplied
    const oversupplied = await prisma.marketDataPoint.findMany({
      where: {
        demandScore: { lte: 40 },
        supplyScore: { gte: 60 }
      },
      orderBy: { supplyScore: 'desc' },
      take: 20
    });

    return {
      success: true,
      opportunities,
      oversupplied
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate market insights
 */
export async function generateMarketInsights() {
  try {
    const insights: any[] = [];
    const validTo = new Date();
    validTo.setDate(validTo.getDate() + 7); // Valid for 1 week

    // Get top searched
    const topSearched = await getTopSearchedVehicles(5);
    if (topSearched.success && topSearched.data) {
      const top = topSearched.data[0];
      if (top) {
        insights.push({
          category: 'DEMAND_SPIKE',
          title: `${top.make} ${top.model || ''} Most Searched`,
          description: `${top.make} ${top.model || 'vehicles'} have been searched ${top.searchCount} times in the last 30 days, making it the most in-demand vehicle on the platform.`,
          make: top.make,
          model: top.model,
          targetAudience: 'TENANT',
          impactScore: 8,
          actionable: true,
          validTo
        });
      }
    }

    // Get demand/supply opportunities
    const demandSupply = await getDemandSupplyAnalysis();
    if (demandSupply.success && demandSupply.opportunities?.length > 0) {
      const opp = demandSupply.opportunities[0];
      insights.push({
        category: 'OPPORTUNITY',
        title: `High Demand: ${opp.make} ${opp.model} ${opp.year}`,
        description: `${opp.make} ${opp.model} ${opp.year} has high buyer demand but low supply. Consider stocking this model. Average price: K${opp.avgPriceZmw.toLocaleString()}`,
        make: opp.make,
        model: opp.model,
        dataJson: { demandScore: opp.demandScore, supplyScore: opp.supplyScore, avgPrice: opp.avgPriceZmw },
        targetAudience: 'TENANT',
        impactScore: 9,
        actionable: true,
        validTo
      });
    }

    // Save insights
    for (const insight of insights) {
      await prisma.marketInsight.create({ data: insight });
    }

    return { success: true, count: insights.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get active market insights
 */
export async function getMarketInsights(targetAudience: 'TENANT' | 'SUPER_ADMIN' | 'BUYER', limit: number = 10) {
  try {
    const now = new Date();

    const insights = await prisma.marketInsight.findMany({
      where: {
        targetAudience,
        validFrom: { lte: now },
        validTo: { gte: now }
      },
      orderBy: [{ impactScore: 'desc' }, { createdAt: 'desc' }],
      take: limit
    });

    return { success: true, insights };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// AI PRICE RECOMMENDATIONS
// =====================================================

/**
 * Generate AI price recommendation for a car
 */
export async function generatePriceRecommendation(carId: string, tenantId: string) {
  try {
    // Get the car
    const car = await prisma.car.findFirst({
      where: { id: carId, tenantId }
    });

    if (!car) {
      return { success: false, error: 'Car not found' };
    }

    // Get market data for similar vehicles
    const marketData = await prisma.marketDataPoint.findFirst({
      where: {
        make: car.make,
        model: car.model,
        year: car.year
      },
      orderBy: { periodEnd: 'desc' }
    });

    if (!marketData) {
      // No market data available, use broader comparison
      const broaderData = await prisma.marketDataPoint.findMany({
        where: {
          make: car.make,
          year: { gte: car.year - 2, lte: car.year + 2 }
        },
        orderBy: { periodEnd: 'desc' },
        take: 10
      });

      if (broaderData.length === 0) {
        return { success: false, error: 'Insufficient market data for recommendation' };
      }

      // Calculate average from broader data
      const avgPrice = broaderData.reduce((a, b) => a + Number(b.avgPriceZmw), 0) / broaderData.length;
      const minPrice = Math.min(...broaderData.map(d => Number(d.minPrice)));
      const maxPrice = Math.max(...broaderData.map(d => Number(d.maxPrice)));

      return createRecommendation(carId, tenantId, car, avgPrice, minPrice, maxPrice, broaderData.length, 'BROADER');
    }

    return createRecommendation(
      carId,
      tenantId,
      car,
      Number(marketData.avgPriceZmw),
      Number(marketData.minPrice),
      Number(marketData.maxPrice),
      marketData.sampleCount,
      'EXACT'
    );
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createRecommendation(
  carId: string,
  tenantId: string,
  car: any,
  avgPrice: number,
  minPrice: number,
  maxPrice: number,
  sampleCount: number,
  matchType: 'EXACT' | 'BROADER'
) {
  const currentPrice = car.priceLocalZmw ? Number(car.priceLocalZmw) : 0;
  
  // Adjust for mileage
  let mileageAdjustment = 1;
  if (car.mileageKm) {
    if (car.mileageKm < 50000) mileageAdjustment = 1.05;
    else if (car.mileageKm > 150000) mileageAdjustment = 0.9;
    else if (car.mileageKm > 100000) mileageAdjustment = 0.95;
  }

  const recommendedPrice = avgPrice * mileageAdjustment;
  const minRecommended = minPrice * 0.95;
  const maxRecommended = maxPrice * 1.05;

  // Determine price position
  let pricePosition = 'FAIR';
  let reasons: string[] = [];

  if (currentPrice > 0) {
    const deviation = (currentPrice - recommendedPrice) / recommendedPrice;
    
    if (deviation > 0.15) {
      pricePosition = 'OVERPRICED';
      reasons.push(`Current price is ${Math.round(deviation * 100)}% above market average`);
      reasons.push(`Consider reducing price to K${Math.round(recommendedPrice).toLocaleString()} for faster sale`);
    } else if (deviation < -0.15) {
      pricePosition = 'UNDERPRICED';
      reasons.push(`Current price is ${Math.round(Math.abs(deviation) * 100)}% below market average`);
      reasons.push(`You could potentially increase price to K${Math.round(recommendedPrice).toLocaleString()}`);
    } else {
      reasons.push('Price is within competitive market range');
    }
  }

  reasons.push(`Based on ${sampleCount} similar vehicles in the market`);
  reasons.push(`Market range: K${Math.round(minPrice).toLocaleString()} - K${Math.round(maxPrice).toLocaleString()}`);

  if (matchType === 'BROADER') {
    reasons.push('Note: Limited exact matches, using broader comparison');
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Calculate confidence
  const confidence = matchType === 'EXACT' ? Math.min(90, 50 + sampleCount * 5) : Math.min(70, 30 + sampleCount * 3);

  const recommendation = await prisma.aiPriceRecommendation.upsert({
    where: { carId },
    create: {
      tenantId,
      carId,
      currentPrice: currentPrice || recommendedPrice,
      recommendedPrice,
      minRecommended,
      maxRecommended,
      confidence,
      pricePosition,
      reasonsJson: reasons,
      comparablesCount: sampleCount,
      marketTrend: 'STABLE',
      expiresAt
    },
    update: {
      currentPrice: currentPrice || recommendedPrice,
      recommendedPrice,
      minRecommended,
      maxRecommended,
      confidence,
      pricePosition,
      reasonsJson: reasons,
      comparablesCount: sampleCount,
      lastUpdated: new Date(),
      expiresAt
    }
  });

  return { success: true, recommendation };
}

/**
 * Get price recommendations for a tenant's inventory
 */
export async function getTenantPriceRecommendations(tenantId: string) {
  try {
    const recommendations = await prisma.aiPriceRecommendation.findMany({
      where: {
        tenantId,
        dismissed: false,
        expiresAt: { gte: new Date() }
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            title: true,
            priceLocalZmw: true,
            imagesJson: true
          }
        }
      },
      orderBy: [
        { pricePosition: 'asc' }, // OVERPRICED first
        { confidence: 'desc' }
      ]
    });

    // Group by price position
    const overpriced = recommendations.filter(r => r.pricePosition === 'OVERPRICED');
    const underpriced = recommendations.filter(r => r.pricePosition === 'UNDERPRICED');
    const fair = recommendations.filter(r => r.pricePosition === 'FAIR');

    return {
      success: true,
      summary: {
        total: recommendations.length,
        overpriced: overpriced.length,
        underpriced: underpriced.length,
        fair: fair.length
      },
      recommendations: {
        overpriced,
        underpriced,
        fair
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Dismiss a price recommendation
 */
export async function dismissPriceRecommendation(carId: string, tenantId: string) {
  try {
    await prisma.aiPriceRecommendation.updateMany({
      where: { carId, tenantId },
      data: { dismissed: true }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// SUPER ADMIN DASHBOARD
// =====================================================

/**
 * Get comprehensive market dashboard for Super Admin
 */
export async function getSuperAdminMarketDashboard() {
  try {
    const [
      topSearched,
      demandSupply,
      priceRanges,
      recentInsights,
      networkStats
    ] = await Promise.all([
      getTopSearchedVehicles(10),
      getDemandSupplyAnalysis(),
      getAveragePrices(),
      getMarketInsights('SUPER_ADMIN', 5),
      getMarketOverview()
    ]);

    return {
      success: true,
      dashboard: {
        topSearched: topSearched.data,
        opportunities: demandSupply.opportunities,
        oversupplied: demandSupply.oversupplied,
        priceRanges: priceRanges.data?.slice(0, 20),
        insights: recentInsights.insights,
        overview: networkStats
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function getMarketOverview() {
  const [totalListings, avgPrice, totalSearches] = await Promise.all([
    prisma.networkListing.count({ where: { status: 'ACTIVE' } }),
    prisma.networkListing.aggregate({
      where: { status: 'ACTIVE' },
      _avg: { listPrice: true }
    }),
    prisma.searchAnalytics.aggregate({
      _sum: { searchCount: true }
    })
  ]);

  return {
    totalListings,
    avgPrice: avgPrice._avg.listPrice,
    totalSearches: totalSearches._sum.searchCount || 0
  };
}

export const marketIntelligenceService = {
  aggregateMarketData,
  getTopSearchedVehicles,
  getAveragePrices,
  getFastestSellingVehicles,
  getDemandSupplyAnalysis,
  generateMarketInsights,
  getMarketInsights,
  generatePriceRecommendation,
  getTenantPriceRecommendations,
  dismissPriceRecommendation,
  getSuperAdminMarketDashboard
};
