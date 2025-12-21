import provisionTenant from '@/lib/hqProvisionShim';

describe('hqProvision (client shim)', () => {
  beforeEach(() => jest.resetAllMocks());

  it('forwards request to backend endpoint and returns response', async () => {
    const fakeResponse = { ok: true, tenant: { id: 't1', slug: 'acme' }, user: { id: 'u1', email: 'owner@acme.com' } };
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => fakeResponse });

    const reg = { businessName: 'ACME Motors', contactName: 'Jane', contactEmail: 'owner@acme.com' };
    const res = await provisionTenant(reg);
    expect(global.fetch).toHaveBeenCalledWith('/api/hq/tenants/provision', expect.objectContaining({ method: 'POST' }));
    expect(res).toEqual(fakeResponse);
  });
});
