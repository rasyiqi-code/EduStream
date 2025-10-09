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
          playing // Autoplay the video
          controls={true} // Use react-player's own controls
          config={{
            youtube: {
              playerVars: {
                // Hide all YouTube's native UI elements, including title, buttons, and controls
                controls: 0, 
                // Deprecated but included for robustness to hide title/info
                showinfo: 0, 
                // Do not show related videos when playback ends
                rel: 0,
                // Deprecated but included to attempt to reduce YouTube branding
                modestbranding: 1
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
