// @ts-nocheck
// API route for chat messages with Prisma persistence
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { requireTenantAccessApi } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireTenantAccessApi()(req, res, async (req, res, user) => {
      const { userId, limit = 50 } = req.query;
      
      const messages = await prisma.messages.findMany({
        where: {
          OR: [
            { fromUserId: user.id, toUserId: userId as string },
            { fromUserId: userId as string, toUserId: user.id },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      });
      
      res.status(200).json(messages.reverse());
    });
  }
  
  if (req.method === 'POST') {
    return requireTenantAccessApi()(req, res, async (req, res, user) => {
      const { toUserId, content } = req.body;
      
      if (!toUserId || !content?.trim()) {
        res.status(400).json({ error: 'Missing toUserId or content' });
        return;
      }
      
      const message = await prisma.messages.create({
        data: {
          fromUserId: user.id,
          toUserId,
          content: content.trim(),
        },
      });
      
      res.status(201).json(message);
    });
  }
  
  if (req.method === 'PATCH') {
    return requireTenantAccessApi()(req, res, async (req, res, user) => {
      const { messageIds } = req.body;
      
      await prisma.messages.updateMany({
        where: {
          id: { in: messageIds },
          toUserId: user.id, // Only mark messages sent TO the user as read
        },
        data: { read: true },
      });
      
      res.status(200).json({ success: true });
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}