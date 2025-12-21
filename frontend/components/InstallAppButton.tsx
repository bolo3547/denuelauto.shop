import React from 'react';
import usePwaInstallPrompt from '@/hooks/usePwaInstallPrompt';

export default function InstallAppButton(){
  const { canInstall, promptInstall } = usePwaInstallPrompt();
  if (!canInstall) return null;
  return (
    <button onClick={() => promptInstall()} className="px-3 py-2 rounded border text-sm bg-[var(--primary)] text-white">
      Install App
    </button>
  );
}
