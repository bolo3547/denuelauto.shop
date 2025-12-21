import express, { Request, Response } from 'express';
import axios from 'axios';
import redisClient from '../config/redis';
import secrets from '../config/secrets';
const router = express.Router();

const OPENCHAT_API_URL = process.env.OPENCHAT_API_URL || 'https://api.openchat.example/v1';
// Prefer centralized secret config for admin/ops usage and server-side injection
const OPENCHAT_API_KEY = secrets.OPENCHAT_API_KEY || '';

async function callOpenChat(prompt: string, options: any = {}) {
  const payload = { prompt, ...options };
  const headers: any = { 'Content-Type': 'application/json' };
  if (OPENCHAT_API_KEY) headers.Authorization = `Bearer ${OPENCHAT_API_KEY}`;
  const resp = await axios.post(OPENCHAT_API_URL, payload, { headers });
  return resp.data;
}

// Suggest a car based on preferences
router.post('/suggest-car', async (req: Request, res: Response) => {
  const { preferences, tenantId } = req.body;
  try {
    const prompt = `You are an experienced car dealer and assistant. Given the preferences: ${JSON.stringify(preferences)}. Provide 3 recommended cars with brief pros and cons and a suggested price range.`;
    const result = await callOpenChat(prompt, { tenantId });
    res.json({ ok: true, data: result });
  } catch (err: any) {
    console.error('OpenChat suggest-car error', err?.message || err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Learn tenant business (store or summarize tenant info)
router.post('/tenant-learn', async (req: Request, res: Response) => {
  const { tenantId, tenantData } = req.body;
  try {
    const prompt = `You are a business assistant. Read the tenant data: ${JSON.stringify(tenantData)}. Summarize the business, list 5 recommended improvements, and 3 key reminders.`;
    const result = await callOpenChat(prompt, { tenantId });
    // Optionally cache summary in Redis for tenant context
    if (tenantId && result) {
      try { await redisClient.set(`tenant:${tenantId}:openchat_summary`, JSON.stringify(result)); } catch (e) { /* ignore */ }
    }
    res.json({ ok: true, data: result });
  } catch (err: any) {
    console.error('OpenChat tenant-learn error', err?.message || err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Create a reminder suggestion
router.post('/reminder', async (req: Request, res: Response) => {
  const { tenantId, reminderText, date } = req.body;
  try {
    const prompt = `You are a helpful assistant. Create a short friendly reminder message and list what needs to be done for: ${reminderText} on ${date}.`;
    const result = await callOpenChat(prompt, { tenantId });
    res.json({ ok: true, data: result });
  } catch (err: any) {
    console.error('OpenChat reminder error', err?.message || err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Accounting helper - simple calculations prompt
router.post('/accounting', async (req: Request, res: Response) => {
  const { tenantId, calcPrompt } = req.body;
  try {
    const prompt = `You are an accounting assistant. Answer the following calculation question or provide steps to compute: ${calcPrompt}`;
    const result = await callOpenChat(prompt, { tenantId });
    res.json({ ok: true, data: result });
  } catch (err: any) {
    console.error('OpenChat accounting error', err?.message || err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
