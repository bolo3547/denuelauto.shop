// Frontend stub for Prisma client
// Actual Prisma client lives in backend. This file intentionally does not import the Prisma client package
// to avoid bundling server code into the static frontend build.

export const prisma: any = (process.env.STATIC_EXPORT || typeof window !== 'undefined') ? {} : (() => { throw new Error('Prisma client not available in frontend. Use backend services instead.'); })();
