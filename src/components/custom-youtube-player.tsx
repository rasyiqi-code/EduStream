"use client";

import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomYouTubePlayerProps {
  youtubeId: string;
}

export function CustomYouTubePlayer({ youtubeId }: CustomYouTubePlayerProps) {
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {hasWindow ? (
        <>
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            playing
            controls={true}
            config={{
              youtube: {
                playerVars: {
                  // This is the most important part: it hides all YouTube's native UI
                  controls: 0, 
                  // These are included for robustness, even if deprecated
                  showinfo: 0, 
                  rel: 0,
                  modestbranding: 1
                }
              }
            }}
          />
          {/* This overlay prevents the title from showing on hover */}
          <div className="absolute inset-0 w-full h-full pointer-events-none"></div>
        </>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
}
