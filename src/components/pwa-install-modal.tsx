'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';

export function PWAInstallModal() {
  const { showInstallPrompt, isInstalled, installApp, dismissInstallPrompt, canInstall } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the modal recently
    const dismissedTime = localStorage.getItem('pwa-install-modal-dismissed');
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000); // 3 days
    
    if (dismissedTime && parseInt(dismissedTime) > threeDaysAgo) {
      return; // Don't show if dismissed within last 3 days
    }

    // Show modal if PWA can be installed and not already installed
    if (showInstallPrompt && canInstall && !isInstalled) {
      // Delay showing modal to avoid immediate popup
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showInstallPrompt, canInstall, isInstalled]);

  const handleInstall = async () => {
    await installApp();
    setIsOpen(false);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    dismissInstallPrompt();
    // Store dismissal in localStorage
    localStorage.setItem('pwa-install-modal-dismissed', Date.now().toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Install E-Learning MA Alhuda</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Akses lebih cepat dan pengalaman belajar yang lebih baik
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Akses offline untuk konten yang sudah diunduh</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Loading lebih cepat seperti aplikasi native</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Notifikasi untuk update konten baru</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Icon di home screen untuk akses mudah</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleInstall} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Install Sekarang
            </Button>
            <Button onClick={handleDismiss} variant="outline">
              Nanti
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
