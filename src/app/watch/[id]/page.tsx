
"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase, useCollection, useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound, useParams, useRouter } from 'next/navigation';
import { doc, collection, query, where, limit, Timestamp, Firestore } from 'firebase/firestore';
import type { Video, Playlist } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomYouTubePlayer } from '@/components/custom-youtube-player';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import { Card, CardContent } from '@/components/ui/card';

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

function SuggestedPlaylists() {
    const firestore = useFirestore();

    const playlistsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'playlists'), limit(5));
    }, [firestore]);

    const { data: playlists, isLoading: arePlaylistsLoading } = useCollection<Playlist>(playlistsQuery);

    const videoIds = React.useMemo(() => {
        if (!playlists) return [];
        // Get the first video ID from each playlist to fetch its thumbnail
        return playlists.map(p => p.videoIds?.[0]).filter((id): id is string => !!id);
    }, [playlists]);

    const videosQuery = useMemoFirebase(() => {
        if (!firestore || videoIds.length === 0) return null;
        return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
    }, [firestore, JSON.stringify(videoIds)]);

    const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);

    const videoThumbnails = React.useMemo(() => {
        if (!videos) return new Map<string, string>();
        return new Map(videos.map(v => [v.id, v.thumbnailUrl]));
    }, [videos]);
    
    if (arePlaylistsLoading || areVideosLoading) {
        return <SuggestedPlaylistsSkeleton />;
    }
    
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Kursus Lainnya</h2>
            {/* Mobile Carousel */}
            <div className="lg:hidden">
                <Carousel
                    opts={{
                        align: "start",
                        dragFree: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                    {playlists?.map((playlist) => (
                        <CarouselItem key={playlist.id} className="basis-2/3 sm:basis-1/2">
                             <Link href={`/playlist/${playlist.id}`} className="block group">
                                <div className="space-y-2">
                                    <div className="aspect-video overflow-hidden rounded-lg">
                                        {playlist.videoIds?.[0] && videoThumbnails.get(playlist.videoIds[0]) ? (
                                        <Image
                                            src={videoThumbnails.get(playlist.videoIds[0])!}
                                            alt={playlist.name}
                                            width={320}
                                            height={180}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint="playlist thumbnail"
                                        />
                                        ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                                            <span className="text-xs text-muted-foreground">No Thumbnail</span>
                                        </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{playlist.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{playlist.videoIds?.length || 0} video</p>
                                    </div>
                                </div>
                            </Link>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                </Carousel>
            </div>
            {/* Desktop List */}
            <div className="hidden lg:block space-y-4">
                {playlists?.map((playlist) => (
                    <Link href={`/playlist/${playlist.id}`} key={playlist.id} className="flex items-start gap-4 group">
                        <div className="w-40 aspect-video overflow-hidden rounded-lg shrink-0">
                            {playlist.videoIds?.[0] && videoThumbnails.get(playlist.videoIds[0]) ? (
                            <Image
                                src={videoThumbnails.get(playlist.videoIds[0])!}
                                alt={playlist.name}
                                width={160}
                                height={90}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="playlist thumbnail"
                            />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">No Thumbnail</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{playlist.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{playlist.videoIds?.length || 0} video</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function SuggestedPlaylistsSkeleton() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Kursus Lainnya</h2>
            {/* Mobile skeleton */}
            <div className="lg:hidden flex space-x-4 overflow-hidden">
                 {Array.from({length: 2}).map((_, i) => (
                    <div key={i} className="space-y-2 shrink-0 w-2/3 sm:w-1/2">
                        <Skeleton className="w-full aspect-video rounded-lg" />
                        <div className='space-y-2'>
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-2/5" />
                        </div>
                    </div>
                 ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden lg:block space-y-4">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <Skeleton className="w-40 h-[90px] rounded-lg shrink-0" />
                        <div className='flex-1 space-y-2'>
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-2/5" />
                        </div>
                    </div>
                ))}
            </div>
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
                <SuggestedPlaylistsSkeleton />
            </aside>
        </div>
    );
}


export default function WatchPage() {
    const firestore = useFirestore();
    const params = useParams();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const id = params.id;

    useEffect(() => {
        if (!isUserLoading && !user) {
          router.replace(`/login?redirect=/watch/${id}`);
        }
      }, [isUserLoading, user, router, id]);
    
    // Critical Guard: Ensure firestore and a valid ID are present before proceeding.
    if (!firestore || typeof id !== 'string' || isUserLoading || !user) {
        return <WatchPageSkeleton />;
    }

    return <WatchPageContent firestore={firestore} id={id} />;
}


function WatchPageContent({ firestore, id }: { firestore: Firestore, id: string }) {
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
            <div className="aspect-video w-full">
                {video.youtubeId ? (
                    <CustomYouTubePlayer youtubeId={video.youtubeId} />
                ) : video.videoUrl ? (
                    <MP4Player videoUrl={video.videoUrl} />
                ) : (
                    <div className="aspect-video w-full bg-muted rounded-xl flex items-center justify-center">
                        <p>Video source not available.</p>
                    </div>
                )}
            </div>
            <div className="mt-4 space-y-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{video.title}</h1>
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
            <SuggestedPlaylists />
          </aside>
        </div>
    );
}

    
