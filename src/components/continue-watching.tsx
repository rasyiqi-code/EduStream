/**
 * @file continue-watching.tsx
 * @description Continue watching carousel for dashboard
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useContinueWatching } from '@/hooks/use-video-progress';
import { VideoCard } from '@/components/video-card';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export function ContinueWatching() {
  const { videos: progressVideos, isLoading: isProgressLoading } = useContinueWatching(10);
  const firestore = useFirestore();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Get video IDs from progress
  const videoIds = React.useMemo(() => {
    return progressVideos.map(p => p.videoId);
  }, [progressVideos]);

  // Fetch actual video data
  const videosQuery = useMemoFirebase(() => {
    if (!firestore || videoIds.length === 0) return null;
    
    // Firestore 'in' query limited to 30 items
    const limitedIds = videoIds.slice(0, 30);
    return query(
      collection(firestore, 'videos'),
      where(documentId(), 'in', limitedIds)
    );
  }, [firestore, JSON.stringify(videoIds.slice(0, 30))]);

  const { data: videos, isLoading: isVideosLoading } = useCollection<Video>(videosQuery);

  // Match videos with their progress
  const videosWithProgress = React.useMemo(() => {
    if (!videos || !progressVideos.length) return [];
    
    const videoMap = new Map(videos.map(v => [v.id, v]));
    const progressMap = new Map(progressVideos.map(p => [p.videoId, p]));
    
    return videoIds
      .map(id => {
        const video = videoMap.get(id);
        const progress = progressMap.get(id);
        return video && progress ? { ...video, progress } : null;
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
  }, [videos, progressVideos, videoIds]);

  const isLoading = isProgressLoading || isVideosLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (videosWithProgress.length === 0) {
    return null; // Don't show section if no videos in progress
  }

  const itemsPerPage = 4;
  const maxIndex = Math.max(0, Math.ceil(videosWithProgress.length / itemsPerPage) - 1);
  
  const visibleVideos = videosWithProgress.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Play className="h-6 w-6 text-primary" />
            Lanjutkan Menonton
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {videosWithProgress.length} video dalam progress
          </p>
        </div>
        
        {/* Navigation buttons */}
        {videosWithProgress.length > itemsPerPage && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {maxIndex + 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

