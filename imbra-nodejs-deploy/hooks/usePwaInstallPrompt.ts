import { useEffect, useState } from 'react';

export default function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    }
    function onAppInstalled() {
      setDeferredPrompt(null);
      setCanInstall(false);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', onAppInstalled as any);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', onAppInstalled as any);
    };
  }, []);

  return {
    canInstall,
    promptInstall: async () => {
      if (!deferredPrompt) return false;
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        return choice.outcome === 'accepted';
      } catch (err) {
        return false;
      }
    }
  };
}
