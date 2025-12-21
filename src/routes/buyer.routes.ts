// =====================================================
// GLOBAL BUYER ACCOUNT API ROUTES
// Cross-dealer buyer accounts with favorites & comparisons
// =====================================================

import { Router, Request, Response } from 'express';
import { globalBuyerService } from '../services/global-buyer.service';

const router = Router();

// =====================================================
// AUTHENTICATION
// =====================================================

/**
 * POST /api/buyer/register
 * Register a new global buyer account
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, city, preferredLanguage } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'name, email, and password are required'
      });
    }
    
    const result = await globalBuyerService.registerBuyer({
      name,
      email,
      phone,
      password,
      city,
      preferredLanguage
    });
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/buyer/login
 * Login to global buyer account
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, deviceInfo, ipAddress } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'email and password are required'
      });
    }
    
    const result = await globalBuyerService.loginBuyer(
      email,
      password,
      deviceInfo,
      ipAddress || req.ip
    );
    
    res.status(result.success ? 200 : 401).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/buyer/verify
 * Verify session token
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const result = await globalBuyerService.verifyBuyerSession(token);
    res.status(result.success ? 200 : 401).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// FAVORITES
// =====================================================

/**
 * POST /api/buyer/favorites
 * Add car to favorites
 */
router.post('/favorites', async (req: Request, res: Response) => {
  try {
    const { buyerId, carId, networkListingId, notes } = req.body;
    
    if (!buyerId || !carId) {
      return res.status(400).json({
        success: false,
        error: 'buyerId and carId are required'
      });
    }
    
    const result = await globalBuyerService.addToFavorites(
      buyerId,
      carId,
      networkListingId,
      notes
    );
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/buyer/:buyerId/favorites
 * Get buyer's favorites
 */
router.get('/:buyerId/favorites', async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;
    const result = await globalBuyerService.getBuyerFavorites(buyerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/buyer/favorites/:favoriteId
 * Remove from favorites
 */
router.delete('/favorites/:favoriteId', async (req: Request, res: Response) => {
  try {
    const { favoriteId } = req.params;
    const { buyerId } = req.body;
    
    if (!buyerId) {
      return res.status(400).json({ success: false, error: 'buyerId is required' });
    }
    
    const result = await globalBuyerService.removeFromFavorites(favoriteId, buyerId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// COMPARISONS
// =====================================================

/**
 * POST /api/buyer/comparisons
 * Save a car comparison
 */
router.post('/comparisons', async (req: Request, res: Response) => {
  try {
    const { buyerId, name, carIds } = req.body;
    
    if (!buyerId || !name || !carIds || !Array.isArray(carIds)) {
      return res.status(400).json({
        success: false,
        error: 'buyerId, name, and carIds array are required'
      });
    }
    
    const result = await globalBuyerService.saveComparison(buyerId, name, carIds);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/buyer/:buyerId/comparisons
 * Get buyer's comparisons
 */
router.get('/:buyerId/comparisons', async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;
    const result = await globalBuyerService.getBuyerComparisons(buyerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// INQUIRIES
// =====================================================

/**
 * POST /api/buyer/inquiries
 * Send an inquiry about a car
 */
router.post('/inquiries', async (req: Request, res: Response) => {
  try {
    const {
      buyerId,
      carId,
      listingId,
      sellerTenantId,
      inquiryType,
      message,
      preferredContact,
      buyerPhone,
      buyerEmail
    } = req.body;
    
    if (!carId || !sellerTenantId || !inquiryType || !message) {
      return res.status(400).json({
        success: false,
        error: 'carId, sellerTenantId, inquiryType, and message are required'
      });
    }
    
    const result = await globalBuyerService.sendNetworkInquiry({
      buyerId,
      carId,
      listingId,
      sellerTenantId,
      inquiryType,
      message,
      preferredContact,
      buyerPhone,
      buyerEmail
    });
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/buyer/:buyerId/inquiries
 * Get buyer's inquiries
 */
router.get('/:buyerId/inquiries', async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;
    const result = await globalBuyerService.getBuyerInquiries(buyerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// PRICE ALERTS
// =====================================================

/**
 * POST /api/buyer/alerts
 * Create a price alert
 */
router.post('/alerts', async (req: Request, res: Response) => {
  try {
    const { buyerId, carId, targetPrice } = req.body;
    
    if (!buyerId || !carId || !targetPrice) {
      return res.status(400).json({
        success: false,
        error: 'buyerId, carId, and targetPrice are required'
      });
    }
    
    const result = await globalBuyerService.createPriceAlert(buyerId, carId, targetPrice);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// SEARCH HISTORY
// =====================================================

/**
 * POST /api/buyer/search-history
 * Save search to history
 */
router.post('/search-history', async (req: Request, res: Response) => {
  try {
    const { buyerId, searchCriteria } = req.body;
    
    if (!buyerId || !searchCriteria) {
      return res.status(400).json({
        success: false,
        error: 'buyerId and searchCriteria are required'
      });
    }
    
    const result = await globalBuyerService.saveSearchHistory(buyerId, searchCriteria);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
