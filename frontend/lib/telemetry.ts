import { makeApiUrl } from '@/lib/config/api';

export type TelemetryPayload = { event: string; properties?: Record<string, any> };

export function track(event: string, properties?: Record<string, any>) {
  // Simple telemetry POST to local API route. Replace with PostHog/Segment integration.
  try {
    if (typeof window === 'undefined') return;
    fetch(makeApiUrl('/api/events'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties }),
    }).catch((err) => {
      // swallow errors in telemetry to avoid breaking UX
      console.warn('Telemetry track failed', err);
    });
  } catch (err) {
    // noop
  }
}

export default { track };
