/**
 * @file resume-dialog.tsx
 * @description Dialog to prompt user to resume from last position
 */

'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, RotateCcw } from 'lucide-react';

interface ResumeDialogProps {
  open: boolean;
  onResume: () => void;
  onStartOver: () => void;
  lastPosition: number; // in seconds
  percentage: number;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function ResumeDialog({
  open,
  onResume,
  onStartOver,
  lastPosition,
  percentage,
}: ResumeDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Lanjutkan Menonton?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Anda telah menonton {Math.round(percentage)}% dari video ini.
            </p>
            <p className="text-sm text-muted-foreground">
              Posisi terakhir: <span className="font-semibold text-foreground">{formatTime(lastPosition)}</span>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStartOver} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Mulai dari Awal
          </AlertDialogCancel>
          <AlertDialogAction onClick={onResume} className="gap-2">
            <Clock className="h-4 w-4" />
            Lanjutkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

