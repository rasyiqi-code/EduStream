"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound, useParams } from 'next/navigation';
import { doc, collection, query, where, limit, Timestamp } from 'firebase/firestore';
import type { Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomYouTubePlayer } from '@/components/custom-youtube-player';

function MP4Player({ videoUrl }: { videoUrl: string }) {
    return (
        <div className="aspect-video w-full">
            <video
                className="w-full h-full rounded-xl bg-black"
                controls
                autoPlay
                src={videoUrl}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

function SuggestedVideos({ currentVideoId }: { currentVideoId: string }) {
    const firestore = useFirestore();

    const suggestedQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'videos'), 
            where('__name__', '!=', currentVideoId), 
            limit(5)
        );
    }, [firestore, currentVideoId]);

    const { data: suggested, isLoading } = useCollection<Video>(suggestedQuery);
    
    if (isLoading) {
        return <SuggestedVideosSkeleton />;
    }
    
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Up Next</h2>
            {suggested?.map((video) => (
                <Link href={`/watch/${video.id}`} key={video.id} className="flex items-start gap-4 group">
                    <div className="w-40 aspect-video overflow-hidden rounded-lg shrink-0">
                         <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            width={160}
                            height={90}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint="video thumbnail"
                        />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{video.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function SuggestedVideosSkeleton() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Up Next</h2>
            {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                    <Skeleton className="w-40 h-[90px] rounded-lg" />
                    <div className='flex-1 space-y-2'>
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-4 w-3/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function WatchPageSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
                <Skeleton className="w-full aspect-video rounded-xl" />
                <div className="mt-4 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className='space-y-2'>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
            <aside className="lg:col-span-1">
                <SuggestedVideosSkeleton />
            </aside>
        </div>
    );
}


export default function WatchPage() {
    const firestore = useFirestore();
    const params = useParams();
    const id = params.id as string;
    
    // Critical Guard: Ensure firestore and a valid ID are present before proceeding.
    if (!firestore || typeof id !== 'string') {
        return <WatchPageSkeleton />;
    }

    return <WatchPageContent firestore={firestore} id={id} />;
}


function WatchPageContent({ firestore, id }: { firestore: any, id: string }) {
    const videoRef = useMemoFirebase(() => {
        // 'id' is guaranteed to be a string here.
        return doc(firestore, 'videos', id);
    }, [firestore, id]);

    const { data: video, isLoading } = useDoc<Video>(videoRef);
    
    if (isLoading) {
      return <WatchPageSkeleton />;
    }

    // ONLY call notFound if loading is complete and the document is confirmed not to exist.
    if (!video) {
        notFound();
        return null;
    }
    
    const uploadedAt = video.uploadDate ? new Date(video.uploadDate.seconds * 1000).toLocaleDateString() : 'N/A';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            {video.youtubeId ? (
              <CustomYouTubePlayer youtubeId={video.youtubeId} />
            ) : video.videoUrl ? (
              <MP4Player videoUrl={video.videoUrl} />
            ) : (
              <div className="aspect-video w-full bg-muted rounded-xl flex items-center justify-center">
                <p>Video source not available.</p>
              </div>
            )}
            <div className="mt-4 space-y-4">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{video.title}</h1>
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={video.channelAvatarUrl} alt={video.channel} />
                        <AvatarFallback>{video.channel.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{video.channel}</p>
                        <div className="text-sm text-muted-foreground">
                            <span>{uploadedAt}</span>
                        </div>
                    </div>
                </div>
                 <div className="bg-card p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{video.description}</p>
                </div>
            </div>
          </div>
          <aside className="lg:col-span-1">
            <SuggestedVideos currentVideoId={video.id} />
          </aside>
        </div>
    );
}
