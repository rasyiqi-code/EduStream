/**
 * @file video-progress-bar.tsx
 * @description Progress bar overlay for video cards
 */

'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface VideoProgressBarProps {
  percentage: number;
  completed?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function VideoProgressBar({ 
  percentage, 
  completed = false,
  className,
  showLabel = false 
}: VideoProgressBarProps) {
  if (percentage < 1 && !completed) {
    return null; // Don't show for unwatched videos
  }

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {completed ? 'Selesai' : `${Math.round(percentage)}% ditonton`}
          </span>
          {completed && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>
      )}
      <Progress 
        value={percentage} 
        className={cn(
          "h-1.5",
          completed && "bg-green-500"
        )}
      />
    </div>
  );
}

/**
 * Compact progress bar for video card overlay
 */
export function VideoProgressOverlay({ 
  percentage, 
  completed = false 
}: { 
  percentage: number; 
  completed?: boolean;
}) {
  if (percentage < 1 && !completed) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div className="relative h-1 bg-black/30 backdrop-blur-sm">
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-all duration-300",
            completed ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {completed && (
        <div className="absolute -top-6 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Selesai
        </div>
      )}
    </div>
  );
}

