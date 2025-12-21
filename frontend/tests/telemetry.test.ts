import telemetry from '../lib/telemetry';

describe('telemetry', () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    if (!('fetch' in globalThis)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = jest.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchSpy = jest.spyOn(globalThis as any, 'fetch').mockImplementation(() => Promise.resolve({ ok: true }));
  });
  afterEach(() => {
    fetchSpy.mockRestore();
    jest.resetAllMocks();
  });
  test('track should POST to /api/events', async () => {
    telemetry.track('unit_test_event', { foo: 'bar' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/api/events');
    const opts = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body);
    expect(body.event).toBe('unit_test_event');
  });
});
