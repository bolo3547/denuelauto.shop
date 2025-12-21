import express from 'express';
import ussdService from '../services/ussd.service';

const router = express.Router();

router.post('/ussd/cleanup', async (req, res) => {
  try {
    await ussdService.releaseExpiredHolds();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'failed' });
  }
});

export default router;
