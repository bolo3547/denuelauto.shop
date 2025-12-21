// =====================================================
// NATIONAL DEALER NETWORK API ROUTES
// Priority 1: Cross-dealer inventory sharing
// =====================================================

import { Router, Request, Response } from 'express';
import { networkService } from '../services/network.service';
import { authMiddleware, requireMinRole } from '../middleware/auth';
import featureFlags from '../middleware/featureFlags';

const router = Router();

// =====================================================
// NETWORK MEMBERSHIP
// =====================================================

/**
 * POST /api/network/join
 * Join the National Dealer Network
 */
router.post(
  '/join',
  authMiddleware,
  requireMinRole('dealer_manager'),
  featureFlags.requireFeature('network.enabled'),
  async (req: Request, res: Response) => {
    try {
      const bodyTenantId = (req.body as any)?.tenantId as string | undefined;
      const authTenantId = (req as any).user?.tenantId as string | undefined;
      const agreedTermsVersion = (req.body as any)?.agreedTermsVersion || 'v1';

      const tenantId = authTenantId || bodyTenantId;

      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'tenantId is required' });
      }

      if (bodyTenantId && authTenantId && bodyTenantId !== authTenantId) {
        return res.status(403).json({ success: false, error: 'tenantId mismatch with authenticated user' });
      }

      const result = await networkService.joinNetwork({
        tenantId,
        agreedTermsVersion,
      });

      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/network/approve
 * Approve network membership (Super Admin / Ops)
 */
router.post(
  '/approve',
  authMiddleware,
  // Only ops / platform admins should approve memberships
  requireMinRole('dealer_owner'),
  async (req: Request, res: Response) => {
    try {
      const { membershipId, reviewer = 'system', notes } = req.body;

      if (!membershipId) {
        return res.status(400).json({ success: false, error: 'membershipId is required' });
      }

      const result = await networkService.approveNetworkMembership(membershipId, reviewer, notes);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/network/leave
 * Leave the network
 */
router.post(
  '/leave',
  authMiddleware,
  requireMinRole('dealer_manager'),
  featureFlags.requireFeature('network.enabled'),
  async (req: Request, res: Response) => {
    try {
      const bodyTenantId = (req.body as any)?.tenantId as string | undefined;
      const authTenantId = (req as any).user?.tenantId as string | undefined;
      const tenantId = authTenantId || bodyTenantId;
      
      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'tenantId is required' });
      }

      if (bodyTenantId && authTenantId && bodyTenantId !== authTenantId) {
        return res.status(403).json({ success: false, error: 'tenantId mismatch with authenticated user' });
      }
      
      const result = await networkService.leaveNetwork(tenantId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// =====================================================
// CAR LISTINGS
// =====================================================

/**
 * POST /api/network/listings
 * List a car on the network
 */
router.post(
  '/listings',
  authMiddleware,
  requireMinRole('dealer_manager'),
  featureFlags.requireFeature('network.enabled'),
  async (req: Request, res: Response) => {
    try {
      const { carId, listPrice, currency } = req.body;
      const authTenantId = (req as any).user?.tenantId as string | undefined;

      if (!carId || !authTenantId || !listPrice) {
        return res.status(400).json({
          success: false,
          error: 'carId, tenantId, and listPrice are required',
        });
      }

      const result = await networkService.listCarOnNetwork({
        carId,
        tenantId: authTenantId,
        listPrice,
        currency,
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * DELETE /api/network/listings/:listingId
 * Remove a car from the network
 */
router.delete(
  '/listings/:listingId',
  authMiddleware,
  requireMinRole('dealer_manager'),
  featureFlags.requireFeature('network.enabled'),
  async (req: Request, res: Response) => {
    try {
      const { listingId } = req.params;
      const authTenantId = (req as any).user?.tenantId as string | undefined;

      if (!authTenantId) {
        return res.status(400).json({ success: false, error: 'tenantId is required' });
      }

      const result = await networkService.removeCarFromNetwork(listingId, authTenantId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// =====================================================
// SEARCH & BROWSE
// =====================================================

/**
 * GET /api/network/search
 * Search the national inventory
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const filters = {
      make: req.query.make as string,
      model: req.query.model as string,
      yearMin: req.query.yearMin ? parseInt(req.query.yearMin as string) : undefined,
      yearMax: req.query.yearMax ? parseInt(req.query.yearMax as string) : undefined,
      priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
      priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
      bodyType: req.query.bodyType as string,
      transmission: req.query.transmission as string,
      fuelType: req.query.fuelType as string,
      city: req.query.city as string,
      verifiedOnly: req.query.verifiedOnly === 'true',
      sortBy: req.query.sortBy as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };
    
    const result = await networkService.searchNetwork(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/network/featured
 * Get featured listings
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await networkService.getFeaturedListings(limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/network/listings/:listingId/view
 * Track listing view
 */
router.post('/listings/:listingId/view', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { viewerTenantId } = req.body;
    
    const result = await networkService.trackListingView(listingId, viewerTenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// STATISTICS
// =====================================================

/**
 * GET /api/network/statistics
 * Get network statistics (Super Admin)
 */
router.get(
  '/statistics',
  authMiddleware,
  requireMinRole('dealer_owner'),
  async (req: Request, res: Response) => {
    try {
      const result = await networkService.getNetworkStatistics();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
