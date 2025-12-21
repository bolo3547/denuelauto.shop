import express from 'express';
import { PrismaClient } from '@prisma/client';
import redisClient from '../config/redis';
const router = express.Router();
const prisma = new PrismaClient();

router.get('/ussd/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const pong = await redisClient.ping();
    res.json({ ok: true, db: true, redis: pong === 'PONG' });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
