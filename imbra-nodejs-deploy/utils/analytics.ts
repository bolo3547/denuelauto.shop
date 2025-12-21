export function trackEvent(name: string, props?: Record<string, unknown>) {
  // Minimal analytics hook — expand to GA/Segment/Plausible/PostHog
  try {
    if (typeof window !== 'undefined') {
      // gtag / dataLayer example
      const anyWindow = window as unknown as { dataLayer?: unknown };
      if (anyWindow?.dataLayer && typeof (anyWindow.dataLayer as any)?.push === 'function') {
        (anyWindow.dataLayer as any).push({ event: name, ...props });
      }
      // Fallback console log
      console.info('trackEvent', name, props);
    }
  } catch (e) {
    // swallow
    console.info('trackEvent-error', e);
  }
}
