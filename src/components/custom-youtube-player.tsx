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
          controls={false} // Disable controls on hover
          light={true} // Show thumbnail first, load player on click
          config={{
            youtube: {
              playerVars: {
                // Hide all YouTube's native UI
                controls: 0, 
                // Hide title, uploader info - deprecated but included for robustness
                showinfo: 0, 
                // Autoplay the video
                autoplay: 1, 
                 // Hide the YouTube logo (partially effective)
                modestbranding: 1,
                // Do not show related videos when playback ends
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
