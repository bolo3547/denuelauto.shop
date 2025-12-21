// =====================================================
// MARKET INTELLIGENCE API ROUTES
// Priority 2: Data dashboard & AI pricing
// =====================================================

import { Router, Request, Response } from 'express';
import { marketIntelligenceService } from '../services/market-intelligence.service';

const router = Router();

// =====================================================
// MARKET DATA
// =====================================================

/**
 * POST /api/market/aggregate
 * Trigger market data aggregation (Admin/Cron job)
 */
router.post('/aggregate', async (req: Request, res: Response) => {
  try {
    const result = await marketIntelligenceService.aggregateMarketData();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/market/top-searched
 * Get top searched vehicles
 */
router.get('/top-searched', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await marketIntelligenceService.getTopSearchedVehicles(limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/market/prices
 * Get average prices by make/model
 */
router.get('/prices', async (req: Request, res: Response) => {
  try {
    const make = req.query.make as string;
    const model = req.query.model as string;
    const result = await marketIntelligenceService.getAveragePrices(make, model);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/market/fastest-selling
 * Get fastest selling vehicles
 */
router.get('/fastest-selling', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await marketIntelligenceService.getFastestSellingVehicles(limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/market/demand-supply
 * Get demand vs supply analysis
 */
router.get('/demand-supply', async (req: Request, res: Response) => {
  try {
    const result = await marketIntelligenceService.getDemandSupplyAnalysis();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// MARKET INSIGHTS
// =====================================================

/**
 * POST /api/market/insights/generate
 * Generate market insights (Admin/Cron job)
 */
router.post('/insights/generate', async (req: Request, res: Response) => {
  try {
    const result = await marketIntelligenceService.generateMarketInsights();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/market/insights
 * Get active market insights
 */
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const audience = (req.query.audience as 'TENANT' | 'SUPER_ADMIN' | 'BUYER') || 'TENANT';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await marketIntelligenceService.getMarketInsights(audience, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// AI PRICE RECOMMENDATIONS
// =====================================================

/**
 * POST /api/market/price-recommendation
 * Generate AI price recommendation for a car
 */
router.post('/price-recommendation', async (req: Request, res: Response) => {
  try {
    const { carId, tenantId } = req.body;
    
    if (!carId || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'carId and tenantId are required'
      });
    }
    
    const result = await marketIntelligenceService.generatePriceRecommendation(carId, tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/market/price-recommendations/:tenantId
 * Get all price recommendations for a tenant
 */
router.get('/price-recommendations/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const result = await marketIntelligenceService.getTenantPriceRecommendations(tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/market/price-recommendation/dismiss
 * Dismiss a price recommendation
 */
router.post('/price-recommendation/dismiss', async (req: Request, res: Response) => {
  try {
    const { carId, tenantId } = req.body;
    
    if (!carId || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'carId and tenantId are required'
      });
    }
    
    const result = await marketIntelligenceService.dismissPriceRecommendation(carId, tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// SUPER ADMIN DASHBOARD
// =====================================================

/**
 * GET /api/market/dashboard
 * Get comprehensive market dashboard (Super Admin)
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const result = await marketIntelligenceService.getSuperAdminMarketDashboard();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
