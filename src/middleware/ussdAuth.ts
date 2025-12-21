import { Request, Response, NextFunction } from 'express';

export const ussdAuth = (req: Request, res: Response, next: NextFunction) => {
  const headerKey = (req.headers['x-api-task-id'] || req.headers['x-ussd-api-task-id'] || req.headers['x-ussd-task-id']) as string | undefined;
  const expected = process.env.USSD_API_TASK_ID;
  if (!expected) return res.status(500).json({ error: 'USSD_API_TASK_ID not configured' });
  if (!headerKey || headerKey !== expected) return res.status(401).json({ error: 'Invalid USSD API Task ID' });
  next();
};

export default ussdAuth;
