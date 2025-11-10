
"use client";

import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomYouTubePlayerProps {
  youtubeId: string;
}

// Declare YouTube Player types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function CustomYouTubePlayer({ youtubeId }: CustomYouTubePlayerProps) {
  const [hasWindow, setHasWindow] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
      
      // Load YouTube IFrame API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Initialize player when API is ready
      window.onYouTubeIframeAPIReady = () => {
        if (playerRef.current && !player) {
          const newPlayer = new window.YT.Player(playerRef.current, {
            videoId: youtubeId,
            playerVars: {
              autoplay: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              cc_load_policy: 0,
              fs: 1,
              autohide: 1,
              color: 'white',
              playsinline: 1
            },
            events: {
              onReady: (event: any) => {
                setPlayer(event.target);
              }
            }
          });
        }
      };

      // If API is already loaded
      if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
      }
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [youtubeId]);

  const setPlaybackSpeed = (speed: number) => {
    if (player && player.setPlaybackRate) {
      player.setPlaybackRate(speed);
    }
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="relative w-full overflow-hidden aspect-video bg-black rounded-xl youtube-player-wrapper">
      {hasWindow ? (
        <>
          {/* YouTube Player Container */}
          <div
            ref={playerRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
          
          {/* Speed Control Note: YouTube has built-in speed controls */}
          {/* Users can access them via the settings gear icon in the player */}
          
          <style jsx>{`
            .youtube-player-wrapper {
              position: relative;
            }
            
            .youtube-player-wrapper iframe {
              pointer-events: auto;
            }
          `}</style>
        </>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
}
