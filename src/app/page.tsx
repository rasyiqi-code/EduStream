'use client';
import { Suspense } from 'react';
import { VideoCard } from "@/components/video-card";
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Video } from '@/lib/types';
import React from 'react';
import { useSearchParams } from 'next/navigation';

function VideoGrid({ searchQuery }: { searchQuery?: string }) {
  const firestore = useFirestore();
  const videosCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const { data: videos, isLoading } = useCollection<Video>(videosCollection);

  if (isLoading) {
    return <VideoGridSkeleton />;
  }

  const filteredVideos = videos?.filter((video) =>
    video.title.toLowerCase().includes(searchQuery?.toLowerCase() ?? "") ||
    video.description.toLowerCase().includes(searchQuery?.toLowerCase() ?? "")
  );

  if (filteredVideos?.length === 0) {
    return <p className="text-center text-muted-foreground col-span-full">No videos found matching your search.</p>;
  }

  return (
    <>
      {filteredVideos?.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </>
  );
}

function VideoGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[202px] w-full rounded-xl" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        <VideoGrid searchQuery={searchQuery || undefined} />
      </div>
  )
}


export default function Home() {
  return (
    <Suspense fallback={<VideoGridSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
