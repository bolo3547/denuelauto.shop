export function isFeatureOn(flagKey: string) {
  // Basic feature flags fallback. You can replace with LaunchDarkly or fetch from your server.
  try {
    if (typeof window === 'undefined') return false;
    const flags = (window as any).__FEATURE_FLAGS__ || {};
    if (typeof flags[flagKey] === 'boolean') return flags[flagKey];
    // Fallback: environment variable style flag
    const envKey = `NEXT_PUBLIC_FEATURE_${flagKey.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
    return Boolean(process.env[envKey]);
  } catch (err) {
    return false;
  }
}

export default { isFeatureOn };
