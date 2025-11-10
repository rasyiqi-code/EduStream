'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const globalShortcuts = [
  { keys: ['/'], description: 'Focus search' },
  { keys: ['H'], description: 'Go to dashboard' },
  { keys: ['F'], description: 'Go to favorites' },
  { keys: ['Shift', '?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close dialogs' },
];

const videoShortcuts = [
  { keys: ['Space'], description: 'Play/Pause' },
  { keys: ['F'], description: 'Toggle fullscreen' },
  { keys: ['M'], description: 'Mute/Unmute' },
  { keys: ['←'], description: 'Rewind 5 seconds' },
  { keys: ['→'], description: 'Forward 5 seconds' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    window.addEventListener('show-shortcuts-help', handleShow);
    return () => window.removeEventListener('show-shortcuts-help', handleShow);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="h-6 w-6" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Gunakan shortcut ini untuk navigasi lebih cepat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Global Shortcuts */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Global</h3>
            <div className="space-y-2">
              {globalShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <Badge key={i} variant="secondary" className="font-mono px-2 py-1">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Player Shortcuts */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Video Player</h3>
            <div className="space-y-2">
              {videoShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <Badge key={i} variant="secondary" className="font-mono px-2 py-1">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

