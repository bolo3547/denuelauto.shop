import { useCallback, useState } from 'react';

export default function useAlerts(tenantSlug?: string) {
  const key = `alerts:${tenantSlug || 'global'}`;
  const [alerts, setAlerts] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  });

  const subscribe = useCallback((alert: any) => {
    const next = [...alerts, alert];
    setAlerts(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [alerts, key]);

  const unsubscribe = useCallback((id: string) => {
    const next = alerts.filter(a => a.id !== id);
    setAlerts(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [alerts, key]);

  return { alerts, subscribe, unsubscribe } as const;
}
