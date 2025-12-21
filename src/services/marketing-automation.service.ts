// =====================================================
// MARKETING AUTOMATION SERVICE
// Social media posting, ad campaigns, and automation
// =====================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================================
// MARKETING CAMPAIGNS
// =====================================================

/**
 * Create a marketing campaign
 */
export async function createCampaign(data: {
  tenantId: string;
  name: string;
  type: 'SOCIAL_MEDIA' | 'EMAIL' | 'SMS' | 'PUSH_NOTIFICATION' | 'BILLBOARD' | 'RADIO' | 'OTHER';
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budgetZmw?: number;
  targetAudience?: any;
  platforms?: string[];
}) {
  try {
    const campaign = await prisma.marketingCampaign.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        type: data.type,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        budgetZmw: data.budgetZmw,
        targetAudienceJson: data.targetAudience,
        platformsJson: data.platforms,
        status: 'DRAFT'
      }
    });

    return { success: true, campaign };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(
  campaignId: string,
  tenantId: string,
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
) {
  try {
    const campaign = await prisma.marketingCampaign.updateMany({
      where: { id: campaignId, tenantId },
      data: { status }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get campaigns for a tenant
 */
export async function getTenantCampaigns(tenantId: string, status?: string) {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        tenantId,
        ...(status && { status: status as any })
      },
      include: {
        _count: {
          select: { socialPosts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, campaigns };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update campaign analytics
 */
export async function updateCampaignAnalytics(
  campaignId: string,
  analytics: {
    impressions?: number;
    clicks?: number;
    leads?: number;
    conversions?: number;
    spent?: number;
  }
) {
  try {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    const updated = await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: {
        impressions: { increment: analytics.impressions || 0 },
        clicks: { increment: analytics.clicks || 0 },
        leads: { increment: analytics.leads || 0 },
        conversions: { increment: analytics.conversions || 0 },
        spentZmw: { increment: analytics.spent || 0 }
      }
    });

    return { success: true, campaign: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// SOCIAL MEDIA POST QUEUE
// =====================================================

/**
 * Queue a social media post
 */
export async function queueSocialPost(data: {
  tenantId: string;
  carId?: string;
  campaignId?: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'WHATSAPP' | 'TIKTOK' | 'LINKEDIN';
  content: string;
  mediaUrls?: string[];
  scheduledFor?: Date;
  hashtags?: string[];
}) {
  try {
    const post = await prisma.socialPostQueue.create({
      data: {
        tenantId: data.tenantId,
        carId: data.carId,
        campaignId: data.campaignId,
        platform: data.platform,
        content: data.content,
        mediaUrlsJson: data.mediaUrls,
        scheduledFor: data.scheduledFor || new Date(),
        hashtagsJson: data.hashtags,
        status: data.scheduledFor && data.scheduledFor > new Date() ? 'SCHEDULED' : 'PENDING'
      }
    });

    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get pending posts for processing
 */
export async function getPendingPosts() {
  try {
    const posts = await prisma.socialPostQueue.findMany({
      where: {
        status: { in: ['PENDING', 'SCHEDULED'] },
        scheduledFor: { lte: new Date() }
      },
      include: {
        car: {
          select: { make: true, model: true, year: true, priceLocalZmw: true, imagesJson: true }
        },
        tenant: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { scheduledFor: 'asc' },
      take: 50
    });

    return { success: true, posts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Mark post as published
 */
export async function markPostPublished(
  postId: string,
  platformPostId?: string,
  platformUrl?: string
) {
  try {
    const post = await prisma.socialPostQueue.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        platformPostId,
        platformUrl
      }
    });

    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Mark post as failed
 */
export async function markPostFailed(postId: string, errorMessage: string) {
  try {
    const post = await prisma.socialPostQueue.update({
      where: { id: postId },
      data: {
        status: 'FAILED',
        errorMessage,
        retryCount: { increment: 1 }
      }
    });

    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update post engagement
 */
export async function updatePostEngagement(
  postId: string,
  engagement: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
  }
) {
  try {
    const post = await prisma.socialPostQueue.update({
      where: { id: postId },
      data: {
        likes: engagement.likes,
        shares: engagement.shares,
        comments: engagement.comments,
        views: engagement.views
      }
    });

    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get tenant's social posts
 */
export async function getTenantSocialPosts(tenantId: string, status?: string, limit = 50) {
  try {
    const posts = await prisma.socialPostQueue.findMany({
      where: {
        tenantId,
        ...(status && { status: status as any })
      },
      include: {
        car: {
          select: { make: true, model: true, year: true }
        },
        campaign: {
          select: { name: true }
        }
      },
      orderBy: { scheduledFor: 'desc' },
      take: limit
    });

    return { success: true, posts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// AUTO-GENERATED CONTENT
// =====================================================

/**
 * Generate social media content for a car
 */
export function generateCarPostContent(car: {
  make: string;
  model: string;
  year: number;
  priceLocalZmw?: number | null;
  priceUsd?: number | null;
  mileageKm?: number | null;
  transmission?: string | null;
  fuelType?: string | null;
  condition?: string | null;
}, platform: string, tenantName: string, tenantPhone?: string) {
  const price = car.priceLocalZmw
    ? `K${Number(car.priceLocalZmw).toLocaleString()}`
    : car.priceUsd
    ? `$${Number(car.priceUsd).toLocaleString()}`
    : 'Contact for price';

  const features: string[] = [];
  if (car.mileageKm) features.push(`${car.mileageKm.toLocaleString()}km`);
  if (car.transmission) features.push(car.transmission);
  if (car.fuelType) features.push(car.fuelType);
  if (car.condition) features.push(car.condition);

  const featureText = features.length > 0 ? features.join(' • ') : '';

  switch (platform) {
    case 'FACEBOOK':
    case 'INSTAGRAM':
      return {
        content: `🚗 ${car.year} ${car.make} ${car.model}

💰 ${price}
${featureText ? `📋 ${featureText}` : ''}

Available at ${tenantName}
${tenantPhone ? `📞 ${tenantPhone}` : ''}

#CarsForSale #${car.make.replace(/\s+/g, '')} #ZambiaCars #UsedCars`,
        hashtags: ['CarsForSale', car.make.replace(/\s+/g, ''), 'ZambiaCars', 'UsedCars', 'AutoDealer']
      };

    case 'WHATSAPP':
      return {
        content: `*${car.year} ${car.make} ${car.model}*
Price: ${price}
${featureText ? `Details: ${featureText}` : ''}

Available at ${tenantName}
${tenantPhone ? `Call/WhatsApp: ${tenantPhone}` : ''}`,
        hashtags: []
      };

    case 'TWITTER':
      return {
        content: `🚗 ${car.year} ${car.make} ${car.model} - ${price}
${featureText}

#${car.make.replace(/\s+/g, '')} #CarsForSale #Zambia`,
        hashtags: [car.make.replace(/\s+/g, ''), 'CarsForSale', 'Zambia']
      };

    default:
      return {
        content: `${car.year} ${car.make} ${car.model} - ${price}. ${featureText}. Contact ${tenantName}.`,
        hashtags: []
      };
  }
}

/**
 * Auto-create social posts for new cars
 */
export async function autoCreatePostsForCar(carId: string, platforms: string[] = ['FACEBOOK', 'WHATSAPP']) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        tenant: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    if (!car || !car.tenant) {
      return { success: false, error: 'Car or tenant not found' };
    }

    const posts: any[] = [];

    for (const platform of platforms) {
      const content = generateCarPostContent(
        {
          make: car.make,
          model: car.model,
          year: car.year,
          priceLocalZmw: car.priceLocalZmw ? Number(car.priceLocalZmw) : null,
          priceUsd: car.priceUsd ? Number(car.priceUsd) : null,
          mileageKm: car.mileageKm,
          transmission: car.transmission,
          fuelType: car.fuelType,
          condition: car.condition
        },
        platform,
        car.tenant.name,
        car.tenant.phone || undefined
      );

      // Get first image
      let mediaUrls: string[] = [];
      if (car.imagesJson) {
        const images = typeof car.imagesJson === 'string' 
          ? JSON.parse(car.imagesJson) 
          : car.imagesJson;
        if (Array.isArray(images) && images.length > 0) {
          mediaUrls = [images[0]];
        }
      }

      const post = await prisma.socialPostQueue.create({
        data: {
          tenantId: car.tenant.id,
          carId: car.id,
          platform: platform as any,
          content: content.content,
          mediaUrlsJson: mediaUrls,
          hashtagsJson: content.hashtags,
          scheduledFor: new Date(), // Post immediately
          status: 'PENDING'
        }
      });

      posts.push(post);
    }

    return { success: true, posts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// ANALYTICS & REPORTING
// =====================================================

/**
 * Get campaign performance summary
 */
export async function getCampaignPerformance(tenantId: string) {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        impressions: true,
        clicks: true,
        leads: true,
        conversions: true,
        budgetZmw: true,
        spentZmw: true,
        startDate: true,
        endDate: true
      }
    });

    // Calculate totals
    const totals = campaigns.reduce(
      (acc, c) => ({
        impressions: acc.impressions + c.impressions,
        clicks: acc.clicks + c.clicks,
        leads: acc.leads + c.leads,
        conversions: acc.conversions + c.conversions,
        budget: acc.budget + Number(c.budgetZmw || 0),
        spent: acc.spent + Number(c.spentZmw || 0)
      }),
      { impressions: 0, clicks: 0, leads: 0, conversions: 0, budget: 0, spent: 0 }
    );

    // Calculate CTR and conversion rates
    const ctr = totals.impressions > 0 
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : '0';
    const conversionRate = totals.leads > 0
      ? ((totals.conversions / totals.leads) * 100).toFixed(2)
      : '0';

    return {
      success: true,
      performance: {
        campaigns,
        totals,
        rates: {
          ctr: `${ctr}%`,
          conversionRate: `${conversionRate}%`
        }
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get social post analytics
 */
export async function getSocialPostAnalytics(tenantId: string) {
  try {
    const [totalPosts, byPlatform, byStatus, totalEngagement] = await Promise.all([
      prisma.socialPostQueue.count({ where: { tenantId } }),
      prisma.socialPostQueue.groupBy({
        by: ['platform'],
        where: { tenantId },
        _count: true,
        _sum: { likes: true, shares: true, comments: true, views: true }
      }),
      prisma.socialPostQueue.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true
      }),
      prisma.socialPostQueue.aggregate({
        where: { tenantId },
        _sum: { likes: true, shares: true, comments: true, views: true }
      })
    ]);

    return {
      success: true,
      analytics: {
        totalPosts,
        byPlatform,
        byStatus: byStatus.reduce((acc, s) => {
          acc[s.status] = s._count;
          return acc;
        }, {} as Record<string, number>),
        totalEngagement: totalEngagement._sum
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// SUPER ADMIN FUNCTIONS
// =====================================================

/**
 * Get platform-wide marketing statistics
 */
export async function getPlatformMarketingStats() {
  try {
    const [
      totalCampaigns,
      totalPosts,
      campaignsByType,
      postsByPlatform,
      topPerformingCampaigns
    ] = await Promise.all([
      prisma.marketingCampaign.count(),
      prisma.socialPostQueue.count(),
      prisma.marketingCampaign.groupBy({
        by: ['type'],
        _count: true
      }),
      prisma.socialPostQueue.groupBy({
        by: ['platform'],
        _count: true
      }),
      prisma.marketingCampaign.findMany({
        where: { conversions: { gt: 0 } },
        orderBy: { conversions: 'desc' },
        take: 10,
        include: {
          tenant: { select: { name: true } }
        }
      })
    ]);

    return {
      success: true,
      stats: {
        totalCampaigns,
        totalPosts,
        campaignsByType,
        postsByPlatform,
        topPerformingCampaigns
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const marketingService = {
  createCampaign,
  updateCampaignStatus,
  getTenantCampaigns,
  updateCampaignAnalytics,
  queueSocialPost,
  getPendingPosts,
  markPostPublished,
  markPostFailed,
  updatePostEngagement,
  getTenantSocialPosts,
  generateCarPostContent,
  autoCreatePostsForCar,
  getCampaignPerformance,
  getSocialPostAnalytics,
  getPlatformMarketingStats
};
