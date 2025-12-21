import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { authRateLimiter, authOtpLimiter } from '../middleware/rateLimit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { signStepUpToken } from '../middleware/stepUp';
// express-validator removed (not used)

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refreshchangeme';
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'refreshToken';
const REFRESH_COOKIE_DOMAIN = process.env.REFRESH_COOKIE_DOMAIN || undefined;
const REFRESH_TOKEN_MAX_AGE = Number(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const REFRESH_COOKIE_SAME_SITE = (process.env.REFRESH_COOKIE_SAME_SITE as any) || 'lax';

function signToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email, tenantId: user.tenantId, role: user.role }, JWT_SECRET as jwt.Secret, { expiresIn: process.env.JWT_EXP || '15m' } as jwt.SignOptions);
}

function signBuyerToken(buyer: any) {
  return jwt.sign({ id: buyer.id, email: buyer.email, tenantId: buyer.tenantId, role: 'buyer' }, JWT_SECRET as jwt.Secret, { expiresIn: process.env.JWT_EXP || '15m' } as jwt.SignOptions);
}

function signRefreshToken(user: any) {
  return jwt.sign({ id: user.id }, REFRESH_SECRET as jwt.Secret, { expiresIn: process.env.REFRESH_TOKEN_EXP || '7d' } as jwt.SignOptions);
}

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: REFRESH_COOKIE_SAME_SITE as 'lax' | 'strict' | 'none',
    domain: REFRESH_COOKIE_DOMAIN || undefined,
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  } as any;
}

router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  const refreshToken = signRefreshToken(user);
  // store refresh token hash
  await prisma.refreshToken.create({ data: { tokenHash: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE) } });
  // set refresh token cookie (httpOnly, secure)
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
  const userPayload = { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
  res.json({ token, user: userPayload });
});

router.post('/refresh', async (req: Request, res: Response) => {
  // Prefer cookie-based refresh token; fall back to body for backwards compatibility
  const cookieRefresh = (req as any).cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  const bodyRefresh = req.body && req.body.refreshToken;
  const refreshToken = cookieRefresh || bodyRefresh;
  try {
    const payload: any = jwt.verify(refreshToken, REFRESH_SECRET);
    const tokenRecord = await prisma.refreshToken.findFirst({ where: { userId: payload.id, tokenHash: refreshToken, revoked: false } });
    if (!tokenRecord) return res.status(401).json({ error: 'Invalid refresh token' });
    // rotate
    await prisma.refreshToken.update({ where: { id: tokenRecord.id }, data: { revoked: true } });
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    const newRefresh = signRefreshToken(user);
    await prisma.refreshToken.create({ data: { tokenHash: newRefresh, userId: user!.id, expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE) } });
    const token = signToken(user);
    // set rotated refresh token cookie
    res.cookie(REFRESH_COOKIE_NAME, newRefresh, getRefreshCookieOptions());
    // return only the short-lived access token in response
    res.json({ token });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  // Allow logout via cookie or body. Revoke refresh token(s) and clear cookie.
  const cookieRefresh = (req as any).cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  const bodyRefresh = req.body && req.body.refreshToken;
  const refreshToken = cookieRefresh || bodyRefresh;
  if (!refreshToken) {
    // still clear cookie if present
    res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
    return res.sendStatus(200);
  }
  await prisma.refreshToken.updateMany({ where: { tokenHash: refreshToken }, data: { revoked: true } });
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
  res.sendStatus(200);
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: dbUser.id, email: dbUser.email, role: dbUser.role, tenantId: dbUser.tenantId } });
});

// Send OTP to email or phone (simple prototype)
router.post('/auth/otp/send', authOtpLimiter, async (req: Request, res: Response) => {
  const { contact, tenantId } = req.body;
  if (!contact) return res.status(400).json({ error: 'contact required' });
  // create 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
  await prisma.oneTimeCode.create({ data: { tenantId, contact, method: contact.includes('@') ? 'email' : 'sms', code, expiresAt } as any });
  // Send via email/sms — stub: console
  console.log(`OTP for ${contact}: ${code}`);
  return res.json({ ok: true });
});

router.post('/auth/otp/verify', authOtpLimiter, async (req: Request, res: Response) => {
  const { contact, code } = req.body;
  if (!contact || !code) return res.status(400).json({ error: 'contact and code required' });
  const otp = await prisma.oneTimeCode.findFirst({ where: { contact, code, used: false }, orderBy: { createdAt: 'desc' } });
  if (!otp) return res.status(400).json({ error: 'Invalid OTP' });
  if (otp.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expired' });
  await prisma.oneTimeCode.update({ where: { id: otp.id }, data: { used: true } });
  return res.json({ ok: true });
});

// Register a new user — requires otp verification (a prior used otp record)
router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  const { email, password, fullName, phone, tenantId } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  // check for OTP used recently (10 minutes)
  const otp = await prisma.oneTimeCode.findFirst({ where: { contact: { in: [email, phone] }, used: true }, orderBy: { createdAt: 'desc' } });
  if (!otp || otp.expiresAt < new Date() || (Date.now() - new Date(otp.createdAt).getTime()) > 1000 * 60 * 30) {
    return res.status(400).json({ error: 'Email not verified with OTP' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, tenantId: tenantId || null, role: 'dealer_owner', status: 'active' } as any });
  const token = signToken(user);
  const refreshToken = signRefreshToken(user);
  await prisma.refreshToken.create({ data: { tokenHash: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE) } });
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
  res.json({ token, user });
});

// Step-up: short lived token after confirming password for sensitive actions
router.post('/step-up', authMiddleware, authRateLimiter, async (req: Request, res: Response) => {
  const { password } = req.body;
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return res.status(401).json({ error: 'Not authenticated' });
  const match = await bcrypt.compare(password, dbUser.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const stepUp = signStepUpToken(dbUser.id);
  res.json({ stepUp });
});

export default router;

// Buyer-specific auth endpoints
router.post('/buyer/register', authRateLimiter, async (req: Request, res: Response) => {
  const { tenantSlug, email, firstName, lastName, phone, password, country, city, budget, currency, preferredMakes } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    let tenantId: string | null = null;
    if (tenantSlug) {
      const t = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
      if (t) tenantId = t.id;
    }
    const existing = await prisma.buyer.findFirst({ where: { email, tenantId } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const buyer = await prisma.buyer.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        tenantId,
        passwordHash,
        country: country || 'Zambia',
        city: city || '',
        budget: budget ? new Prisma.Decimal(budget) : undefined,
        currency: currency || 'USD',
        preferredMakes: preferredMakes || undefined,
        emailVerified: !!passwordHash
      },
    });
    const token = signBuyerToken(buyer);
    const refreshToken = signRefreshToken(buyer);
    await prisma.refreshToken.create({ data: { tokenHash: refreshToken, userId: buyer.id as any, expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE) } as any });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
    res.json({ token, buyer });
  } catch (err) {
    console.error('Buyer registration failed', err);
    res.status(500).json({ error: 'Failed to register buyer' });
  }
});

router.post('/buyer/login', authRateLimiter, async (req: Request, res: Response) => {
  const { tenantSlug, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    let tenantId: string | null = null;
    if (tenantSlug) {
      const t = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
      if (t) tenantId = t.id;
    }
    const buyer = await prisma.buyer.findFirst({ where: { email, tenantId } });
    if (!buyer) return res.status(401).json({ error: 'Invalid credentials' });
    if (!buyer.passwordHash) return res.status(401).json({ error: 'No password set for buyer' });
    const match = await bcrypt.compare(password, buyer.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signBuyerToken(buyer);
    const refreshToken = signRefreshToken(buyer);
    await prisma.refreshToken.create({ data: { tokenHash: refreshToken, userId: buyer.id as any, expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE) } as any });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
    res.json({ token, buyer });
  } catch (err) {
    console.error('Buyer login failed', err);
    res.status(500).json({ error: 'Login failed' });
  }
});
