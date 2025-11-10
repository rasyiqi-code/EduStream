'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keyboard shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');

      // Allow search shortcut (/) even in input fields for focus behavior
      if (isInputField && event.key !== '/') {
        return;
      }

      // Safety check for event.key
      if (!event.key) return;

      for (const shortcut of shortcuts) {
        const isCtrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const isShiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const isAltMatch = shortcut.alt ? event.altKey : !event.altKey;
        const isKeyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
          // Prevent default only for our shortcuts
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Global keyboard shortcuts hook
export function useGlobalKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[name="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search',
    },
    {
      key: 'h',
      action: () => router.push('/dashboard'),
      description: 'Go to dashboard',
    },
    {
      key: 'f',
      action: () => router.push('/favorites'),
      description: 'Go to favorites',
    },
    {
      key: '?',
      shift: true,
      action: () => {
        // Show keyboard shortcuts help modal
        const event = new CustomEvent('show-shortcuts-help');
        window.dispatchEvent(event);
      },
      description: 'Show keyboard shortcuts',
    },
  ];

  useKeyboardShortcuts(shortcuts, true);
}

// Video player specific shortcuts
export function useVideoPlayerShortcuts(videoElement: HTMLVideoElement | null) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: ' ',
      action: () => {
        if (videoElement) {
          if (videoElement.paused) {
            videoElement.play();
          } else {
            videoElement.pause();
          }
        }
      },
      description: 'Play/Pause',
    },
    {
      key: 'f',
      action: () => {
        if (videoElement) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            videoElement.requestFullscreen();
          }
        }
      },
      description: 'Toggle fullscreen',
    },
    {
      key: 'm',
      action: () => {
        if (videoElement) {
          videoElement.muted = !videoElement.muted;
        }
      },
      description: 'Mute/Unmute',
    },
    {
      key: 'ArrowLeft',
      action: () => {
        if (videoElement) {
          videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
        }
      },
      description: 'Rewind 5 seconds',
    },
    {
      key: 'ArrowRight',
      action: () => {
        if (videoElement) {
          videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 5);
        }
      },
      description: 'Forward 5 seconds',
    },
  ];

  useKeyboardShortcuts(shortcuts, !!videoElement);
}

