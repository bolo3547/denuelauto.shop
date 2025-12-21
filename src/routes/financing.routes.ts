// =====================================================
// FINANCING PARTNER API ROUTES
// Priority 3: White-label financing integration
// =====================================================

import { Router, Request, Response } from 'express';
import { financingService } from '../services/financing.service';

const router = Router();

// =====================================================
// PARTNER MANAGEMENT (Super Admin)
// =====================================================

/**
 * POST /api/financing/partners
 * Register a new financing partner
 */
router.post('/partners', async (req: Request, res: Response) => {
  try {
    const result = await financingService.registerFinancingPartner(req.body);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/financing/partners
 * Get all financing partners
 */
router.get('/partners', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as any;
    const result = await financingService.getFinancingPartners(status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/financing/partners/:partnerId/approve
 * Approve a financing partner
 */
router.post('/partners/:partnerId/approve', async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const result = await financingService.approveFinancingPartner(partnerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/financing/partners/:partnerId/suspend
 * Suspend a financing partner
 */
router.post('/partners/:partnerId/suspend', async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ success: false, error: 'reason is required' });
    }
    
    const result = await financingService.suspendFinancingPartner(partnerId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// FINANCING OPTIONS (Public)
// =====================================================

/**
 * GET /api/financing/options/:carId
 * Get financing options for a specific car
 */
router.get('/options/:carId', async (req: Request, res: Response) => {
  try {
    const { carId } = req.params;
    const result = await financingService.getFinancingOptions(carId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/financing/calculate
 * Calculate monthly payment
 */
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { principal, annualRate, termMonths } = req.body;
    
    if (!principal || !annualRate || !termMonths) {
      return res.status(400).json({
        success: false,
        error: 'principal, annualRate, and termMonths are required'
      });
    }
    
    const monthlyPayment = financingService.calculateMonthlyPayment(
      principal,
      annualRate,
      termMonths
    );
    
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - principal;
    
    res.json({
      success: true,
      calculation: {
        principal,
        annualRate,
        termMonths,
        monthlyPayment,
        totalPayment,
        totalInterest
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// APPLICATIONS (Buyers)
// =====================================================

/**
 * POST /api/financing/applications
 * Submit a financing application
 */
router.post('/applications', async (req: Request, res: Response) => {
  try {
    const required = ['carId', 'partnerId', 'tenantId', 'applicantName', 
      'applicantEmail', 'applicantPhone', 'applicantNrc', 'monthlyIncome',
      'employmentStatus', 'requestedAmount', 'requestedTermMonths'];
    
    for (const field of required) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`
        });
      }
    }
    
    const result = await financingService.submitFinancingApplication(req.body);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/financing/applications/buyer/:buyerId
 * Get buyer's applications
 */
router.get('/applications/buyer/:buyerId', async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;
    const result = await financingService.getBuyerApplications(buyerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// APPLICATIONS (Tenants/Dealers)
// =====================================================

/**
 * GET /api/financing/applications/tenant/:tenantId
 * Get tenant's applications
 */
router.get('/applications/tenant/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const result = await financingService.getTenantApplications(tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// APPLICATIONS (Partners)
// =====================================================

/**
 * GET /api/financing/applications/partner/:partnerId
 * Get partner's applications
 */
router.get('/applications/partner/:partnerId', async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const status = req.query.status as string;
    const result = await financingService.getPartnerApplications(partnerId, status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/financing/applications/:applicationId/status
 * Update application status (Partner)
 */
router.put('/applications/:applicationId/status', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { partnerId, status, details } = req.body;
    
    if (!partnerId || !status) {
      return res.status(400).json({
        success: false,
        error: 'partnerId and status are required'
      });
    }
    
    const result = await financingService.updateApplicationStatus(
      applicationId,
      partnerId,
      status,
      details
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// PARTNER WEBHOOK
// =====================================================

/**
 * POST /api/financing/webhook
 * Handle partner webhook callbacks
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const apiSecret = req.headers['x-api-secret'] as string;
    const { event, payload } = req.body;
    
    if (!apiKey || !apiSecret) {
      return res.status(401).json({ success: false, error: 'Missing API credentials' });
    }
    
    if (!event || !payload) {
      return res.status(400).json({ success: false, error: 'event and payload are required' });
    }
    
    const result = await financingService.handlePartnerWebhook(
      apiKey,
      apiSecret,
      event,
      payload
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// STATISTICS (Super Admin)
// =====================================================

/**
 * GET /api/financing/statistics
 * Get financing statistics
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const result = await financingService.getFinancingStatistics();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
