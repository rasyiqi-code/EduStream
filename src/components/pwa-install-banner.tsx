'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

export function PWAInstallBanner() {
  const { showInstallPrompt, isInstalled, installApp, dismissInstallPrompt, canInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt recently
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    if (dismissedTime && parseInt(dismissedTime) > oneDayAgo) {
      return; // Don't show if dismissed within last 24 hours
    }

    // Show banner if PWA can be installed and not already installed
    if (showInstallPrompt && canInstall && !isInstalled) {
      setIsVisible(true);
    }
  }, [showInstallPrompt, canInstall, isInstalled]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Install E-Learning MA Alhuda
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Install aplikasi untuk akses yang lebih cepat dan pengalaman belajar yang lebih baik.
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                onClick={installApp}
                size="sm"
                className="text-xs h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
              <Button
                onClick={dismissInstallPrompt}
                variant="outline"
                size="sm"
                className="text-xs h-8"
              >
                Nanti
              </Button>
            </div>
          </div>
          
          <button
            onClick={dismissInstallPrompt}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
