import express from 'express';
import { requireHqAdminAuth } from '../../middleware/hqAuth';
import secrets from '../../config/secrets';

const router = express.Router();

router.get('/health', requireHqAdminAuth, async (req, res) => {
  // Provide a non-sensitive health check for the admin panel and whether admin API key is configured
  res.json({ status: 'ok', adminApiKeyConfigured: !!secrets.ADMIN_API_KEY });
});

export default router;
