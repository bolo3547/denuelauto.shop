import { Request, Response, NextFunction } from 'express';
import { hasPermission } from './permissions';

export const rbacMiddleware = (requiredAction?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!requiredAction) return next();
    const user = (req as any).user;
    const role = user?.role;
    if (!hasPermission(role, requiredAction)) {
      return res.status(403).json({ error: 'Forbidden - insufficient permissions', action: requiredAction });
    }
    next();
  };
};

