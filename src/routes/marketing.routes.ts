// =====================================================
// MARKETING AUTOMATION API ROUTES
// Social media posting & campaign management
// =====================================================

import { Router, Request, Response } from 'express';
import { marketingService } from '../services/marketing-automation.service';

const router = Router();

// =====================================================
// CAMPAIGNS
// =====================================================

/**
 * POST /api/marketing/campaigns
 * Create a marketing campaign
 */
router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const { tenantId, name, type, description, startDate, endDate, budgetZmw, targetAudience, platforms } = req.body;
    
    if (!tenantId || !name || !type) {
      return res.status(400).json({
        success: false,
        error: 'tenantId, name, and type are required'
      });
    }
    
    const result = await marketingService.createCampaign({
      tenantId,
      name,
      type,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budgetZmw,
      targetAudience,
      platforms
    });
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/marketing/campaigns/:tenantId
 * Get tenant's campaigns
 */
router.get('/campaigns/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const status = req.query.status as string;
    const result = await marketingService.getTenantCampaigns(tenantId, status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/marketing/campaigns/:campaignId/status
 * Update campaign status
 */
router.put('/campaigns/:campaignId/status', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { tenantId, status } = req.body;
    
    if (!tenantId || !status) {
      return res.status(400).json({
        success: false,
        error: 'tenantId and status are required'
      });
    }
    
    const result = await marketingService.updateCampaignStatus(campaignId, tenantId, status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/marketing/campaigns/:campaignId/analytics
 * Update campaign analytics
 */
router.post('/campaigns/:campaignId/analytics', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { impressions, clicks, leads, conversions, spent } = req.body;
    
    const result = await marketingService.updateCampaignAnalytics(campaignId, {
      impressions,
      clicks,
      leads,
      conversions,
      spent
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// SOCIAL POST QUEUE
// =====================================================

/**
 * POST /api/marketing/posts/queue
 * Queue a social media post
 */
router.post('/posts/queue', async (req: Request, res: Response) => {
  try {
    const { tenantId, carId, campaignId, platform, content, mediaUrls, scheduledFor, hashtags } = req.body;
    
    if (!tenantId || !platform || !content) {
      return res.status(400).json({
        success: false,
        error: 'tenantId, platform, and content are required'
      });
    }
    
    const result = await marketingService.queueSocialPost({
      tenantId,
      carId,
      campaignId,
      platform,
      content,
      mediaUrls,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      hashtags
    });
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/marketing/posts/:tenantId
 * Get tenant's social posts
 */
router.get('/posts/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const status = req.query.status as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const result = await marketingService.getTenantSocialPosts(tenantId, status, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/marketing/posts/pending
 * Get pending posts for processing (System/Cron)
 */
router.get('/posts/pending', async (req: Request, res: Response) => {
  try {
    const result = await marketingService.getPendingPosts();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/marketing/posts/:postId/published
 * Mark post as published
 */
router.post('/posts/:postId/published', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { platformPostId, platformUrl } = req.body;
    
    const result = await marketingService.markPostPublished(postId, platformPostId, platformUrl);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/marketing/posts/:postId/failed
 * Mark post as failed
 */
router.post('/posts/:postId/failed', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { errorMessage } = req.body;
    
    if (!errorMessage) {
      return res.status(400).json({ success: false, error: 'errorMessage is required' });
    }
    
    const result = await marketingService.markPostFailed(postId, errorMessage);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/marketing/posts/:postId/engagement
 * Update post engagement metrics
 */
router.post('/posts/:postId/engagement', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { likes, shares, comments, views } = req.body;
    
    const result = await marketingService.updatePostEngagement(postId, {
      likes,
      shares,
      comments,
      views
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// AUTO-GENERATED CONTENT
// =====================================================

/**
 * POST /api/marketing/auto-posts/:carId
 * Auto-create posts for a car
 */
router.post('/auto-posts/:carId', async (req: Request, res: Response) => {
  try {
    const { carId } = req.params;
    const { platforms = ['FACEBOOK', 'WHATSAPP'] } = req.body;
    
    const result = await marketingService.autoCreatePostsForCar(carId, platforms);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/marketing/generate-content
 * Generate content for a car (preview only)
 */
router.post('/generate-content', async (req: Request, res: Response) => {
  try {
    const { car, platform, tenantName, tenantPhone } = req.body;
    
    if (!car || !platform || !tenantName) {
      return res.status(400).json({
        success: false,
        error: 'car, platform, and tenantName are required'
      });
    }
    
    const content = marketingService.generateCarPostContent(car, platform, tenantName, tenantPhone);
    res.json({ success: true, content });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// ANALYTICS
// =====================================================

/**
 * GET /api/marketing/performance/:tenantId
 * Get campaign performance summary
 */
router.get('/performance/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const result = await marketingService.getCampaignPerformance(tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/marketing/social-analytics/:tenantId
 * Get social post analytics
 */
router.get('/social-analytics/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const result = await marketingService.getSocialPostAnalytics(tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/marketing/platform-stats
 * Get platform-wide marketing statistics (Super Admin)
 */
router.get('/platform-stats', async (req: Request, res: Response) => {
  try {
    const result = await marketingService.getPlatformMarketingStats();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
