// =====================================================
// DEALER VERIFICATION API ROUTES
// Verified Badge system & KYC compliance
// =====================================================

import { Router, Request, Response } from 'express';
import { dealerVerificationService } from '../services/dealer-verification.service';

const router = Router();

// =====================================================
// TENANT ROUTES
// =====================================================

/**
 * POST /api/verification/start
 * Start the verification process
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'tenantId is required' });
    }
    
    const result = await dealerVerificationService.startVerification(tenantId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/verification/documents
 * Submit a verification document
 */
router.post('/documents', async (req: Request, res: Response) => {
  try {
    const { tenantId, documentType, documentUrl, documentNumber, expiresAt, notes } = req.body;
    
    if (!tenantId || !documentType || !documentUrl) {
      return res.status(400).json({
        success: false,
        error: 'tenantId, documentType, and documentUrl are required'
      });
    }
    
    const result = await dealerVerificationService.submitVerificationDocument({
      tenantId,
      documentType,
      documentUrl,
      documentNumber,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      notes
    });
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/verification/status/:tenantId
 * Get verification status
 */
router.get('/status/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const result = await dealerVerificationService.getVerificationStatus(tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/verification/check/:tenantId
 * Quick check if tenant is verified
 */
router.get('/check/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const result = await dealerVerificationService.isVerified(tenantId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/verification/requirements
 * Get required documents for each level
 */
router.get('/requirements', async (req: Request, res: Response) => {
  try {
    const level = (req.query.level as 'BASIC' | 'PREMIUM' | 'ENTERPRISE') || 'BASIC';
    const requirements = dealerVerificationService.getRequiredDocuments(level);
    
    res.json({
      success: true,
      level,
      requirements
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// ADMIN ROUTES
// =====================================================

/**
 * GET /api/verification/pending
 * Get all pending verifications (Admin)
 */
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const result = await dealerVerificationService.getPendingVerifications();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/verification/documents/:documentId/review
 * Review a verification document (Admin)
 */
router.post('/documents/:documentId/review', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { status, reviewNotes, rejectionReason } = req.body;
    
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'status must be APPROVED or REJECTED'
      });
    }
    
    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'rejectionReason is required when rejecting'
      });
    }
    
    const result = await dealerVerificationService.reviewDocument(
      documentId,
      status,
      reviewNotes,
      rejectionReason
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/verification/:tenantId/approve
 * Manually approve verification (Admin)
 */
router.post('/:tenantId/approve', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { level = 'BASIC', adminNotes } = req.body;
    
    const result = await dealerVerificationService.completeVerification(
      tenantId,
      level,
      adminNotes
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/verification/:tenantId/reject
 * Reject verification (Admin)
 */
router.post('/:tenantId/reject', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ success: false, error: 'reason is required' });
    }
    
    const result = await dealerVerificationService.rejectVerification(tenantId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/verification/:tenantId/suspend
 * Suspend verification (Admin)
 */
router.post('/:tenantId/suspend', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ success: false, error: 'reason is required' });
    }
    
    const result = await dealerVerificationService.suspendVerification(tenantId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/verification/verified
 * Get all verified dealers
 */
router.get('/verified', async (req: Request, res: Response) => {
  try {
    const result = await dealerVerificationService.getVerifiedDealers();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/verification/expiring
 * Get verifications expiring soon (Admin)
 */
router.get('/expiring', async (req: Request, res: Response) => {
  try {
    const result = await dealerVerificationService.getExpiringVerifications();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/verification/statistics
 * Get verification statistics (Admin)
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const result = await dealerVerificationService.getVerificationStatistics();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
