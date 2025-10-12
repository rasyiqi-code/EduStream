
"use client";

import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
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
    <div className="relative w-full overflow-hidden aspect-video bg-black rounded-xl">
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
                  controls: 1,
                  showinfo: 0,
                  rel: 0,
                  modestbranding: 1,
                },
              },
            }}
          />
        </>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
}
