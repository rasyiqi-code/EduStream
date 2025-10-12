'use client';

import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle } from 'lucide-react';

interface PWAStatusProps {
  variant?: 'button' | 'badge';
  className?: string;
}

export function PWAStatus({ variant = 'button', className = '' }: PWAStatusProps) {
  const { showInstallPrompt, isInstalled, installApp, canInstall } = usePWAInstall();

  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full ${className}`}>
          <CheckCircle className="w-3 h-3" />
          <span>Installed</span>
        </div>
      );
    }
    return null; // Don't show button if already installed
  }

  if (!showInstallPrompt || !canInstall) {
    return null; // Don't show if can't install
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ${className}`}>
        <Download className="w-3 h-3" />
        <span>Install Available</span>
      </div>
    );
  }

  return (
    <Button
      onClick={installApp}
      size="sm"
      variant="outline"
      className={`gap-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      Install App
    </Button>
  );
}
