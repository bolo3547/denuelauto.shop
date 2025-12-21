import { Request, Response, NextFunction } from 'express';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  dealer_owner: ['*'],
  dealer_manager: ['cars.create', 'cars.read', 'cars.update', 'cars.delete', 'leads.*', 'quotes.*', 'proformas.*', 'payments.verify', 'payments.read', 'payments.record', 'shipments.*', 'analytics.read', 'agents.manage', 'buyers.manage', 'deals.*', 'testDrives.*', 'reviews.manage'],
  // dealer_manager can manage agents and buyers, read and record payments
  sales: ['leads.create', 'leads.read', 'quotes.create', 'quotes.read', 'proformas.create', 'testDrives.create', 'testDrives.read'],
  media: ['cars.media.manage'],
  accountant: ['payments.verify', 'payments.read', 'proformas.read', 'proformas.update', 'reviews.manage'],
  ops: ['billing.*', 'org.domains.manage', 'org.domains.read', 'secrets.rotate', 'tenants.manage', 'org.ussd.manage'],
  // specialized review management permission already granted to accountant/dealer_manager
  exporter_manager: ['export.ports.manage', 'export.rules.manage', 'export.calc', 'shipments.*', 'proformas.*'],
  agent: ['deals.manage', 'leads.assigned'],
  buyer: ['buyer.own.*'],
};

export function hasPermission(role: string | undefined, permission: string) {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  if (perms.includes(permission)) return true;
  // allow wildcard on resource level, like 'cars.*'
  const [res] = permission.split('.');
  if (perms.includes(`${res}.*`)) return true;
  return false;
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;
    if (!hasPermission(role, permission)) return res.status(403).json({ error: 'Forbidden - missing permission', permission });
    next();
  };
}
