import { test, expect, request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

test.describe('Auth cookie flow', () => {
  test('register -> login sets cookie, refresh rotates cookie, logout clears cookie', async ({ request: _request }) => {
    // Create a fresh request context to track cookies
    const req = await _request.newContext();

    const email = `playwright-${Date.now()}@example.com`;
    const password = 'Password123!';

    // Register buyer (creates buyer and sets refresh cookie)
    const reg = await req.post(`${API_BASE}/api/auth/buyer/register`, { data: { tenantSlug: undefined, firstName: 'PW', lastName: 'Test', email, phone: '+260970000000', country: 'Zambia', password, acceptTerms: true } });
    expect(reg.ok()).toBeTruthy();
    const setCookie = reg.headers()['set-cookie'];
    expect(setCookie).toBeTruthy();
    expect(JSON.stringify(setCookie)).toMatch(/refreshToken/);

    // Login as buyer (should set/rotate cookie)
    const login = await req.post(`${API_BASE}/api/auth/buyer/login`, { data: { email, password } });
    expect(login.ok()).toBeTruthy();
    const loginCookies = login.headers()['set-cookie'];
    expect(loginCookies).toBeTruthy();

    // Refresh using cookie (server should rotate & set new cookie)
    const refresh = await req.post(`${API_BASE}/api/auth/refresh`);
    expect(refresh.ok()).toBeTruthy();
    const refreshCookies = refresh.headers()['set-cookie'];
    expect(refreshCookies).toBeTruthy();

    // Logout: should clear cookie
    const logout = await req.post(`${API_BASE}/api/auth/logout`);
    expect(logout.ok()).toBeTruthy();
    const logoutSet = logout.headers()['set-cookie'] || [];
    // If cookie is cleared, it will often be set with empty value / max-age=0
    expect(JSON.stringify(logoutSet)).toMatch(/refreshToken=;|refreshToken=.*Max-Age=0|refreshToken=.*expires=/i);
  });
});
