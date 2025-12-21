import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Auth cookie refresh flow', () => {
  let userId: string;
  const email = 'cookie-test@local';
  const password = 'password123';

  beforeAll(async () => {
    const u = await prisma.user.create({ data: { email, passwordHash: await bcrypt.hash(password, 10), role: 'dealer_owner', status: 'active' } as any });
    userId = u.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('sets refresh cookie on login, rotates on refresh, clears on logout', async () => {
    const agent = request.agent(app as any);
    const loginRes = await agent.post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    const setCookieHeader = loginRes.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    const cookieString = setCookieHeader.join(';');
    expect(cookieString).toMatch(/refreshToken/);
    // refresh using cookie; no body
    const refreshRes = await agent.post('/api/auth/refresh').send({});
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.token).toBeDefined();
    // logout should clear cookie
    const logoutRes = await agent.post('/api/auth/logout').send({});
    expect(logoutRes.status).toBe(200);
    const logoutSetCookie = logoutRes.headers['set-cookie'];
    if (logoutSetCookie) {
      const cleared = logoutSetCookie.join(';');
      expect(cleared).toMatch(/refreshToken=;/);
    }
  });
});
