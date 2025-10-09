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
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      {hasWindow ? (
        <ReactPlayer
          url={videoUrl}
          width="100%"
          height="100%"
          playing
          controls // Use react-player's own controls, not YouTube's
          config={{
            youtube: {
              playerVars: {
                // This is the key change: force YouTube's native controls off.
                controls: 0,
                // These are extra measures to ensure a clean player.
                showinfo: 0,
                autoplay: 1,
                modestbranding: 1,
                rel: 0
              }
            }
          }}
        />
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
}
