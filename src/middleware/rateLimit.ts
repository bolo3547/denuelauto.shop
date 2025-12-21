import { Request } from 'express';
import rateLimit from 'express-rate-limit';

type MaybeBody = Record<string, any>;

const standardOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

const resolveTenantSlug = (req: Request): string | undefined => {
  if (req.params?.slug) return req.params.slug;
  const body = (req.body || {}) as MaybeBody;
  if (typeof body.tenantSlug === 'string' && body.tenantSlug.trim()) return body.tenantSlug;
  if (typeof body.tenantId === 'string' && body.tenantId.trim()) return body.tenantId;
  const query = (req.query || {}) as MaybeBody;
  if (typeof query.tenantSlug === 'string' && query.tenantSlug.trim()) return query.tenantSlug;
  if (typeof query.slug === 'string' && query.slug.trim()) return query.slug;
  const header = req.headers['x-tenant-slug'];
  if (typeof header === 'string' && header.trim()) return header;
  return undefined;
};

const tenantAwareKey = (req: Request) => {
  const slug = resolveTenantSlug(req);
  const body = (req.body || {}) as MaybeBody;
  const contact = body.email || body.phone || body.contact;
  const baseId = slug ? `${slug}:${req.ip}` : req.ip;
  return contact ? `${baseId}:${String(contact).toLowerCase()}` : baseId;
};

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per windowMs
  ...standardOptions,
});

export const writeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20, // stricter for write operations
  ...standardOptions,
});

export const ussdRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 6, // limit per msisdn: allow 6 requests every 10s
  keyGenerator: (req) => (req.headers['x-msisdn'] || (req.body && (req.body as MaybeBody).phoneNumber) || req.ip) as string,
  ...standardOptions,
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: tenantAwareKey,
  ...standardOptions,
});

export const authOtpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  keyGenerator: tenantAwareKey,
  ...standardOptions,
});

const publicTenantKey = (req: Request) => {
  const slug = resolveTenantSlug(req);
  return slug ? `${slug}:${req.ip}` : req.ip;
};

export const publicInquiryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: publicTenantKey,
  ...standardOptions,
});

export const publicWatchlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: publicTenantKey,
  ...standardOptions,
});
