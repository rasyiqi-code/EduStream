"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import React from 'react';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Playlist, Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
    return (
        <div className="aspect-video w-full">
            <iframe
                className="w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
    );
}

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

function PlaylistPageContent({ id }: { id: string }) {
    const firestore = useFirestore();
    const searchParams = useSearchParams();

    const playlistRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'playlists', id);
    }, [firestore, id]);

    const { data: playlist, isLoading: isPlaylistLoading } = useDoc<Playlist>(playlistRef);
    
    const videosQuery = useMemoFirebase(() => {
        if (!firestore || !playlist?.videoIds || playlist.videoIds.length === 0) return null;
        // Firestore 'in' queries are limited to 30 elements.
        return query(collection(firestore, 'videos'), where('__name__', 'in', playlist.videoIds.slice(0, 30)));
    }, [firestore, playlist?.videoIds]);

    const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);
    
    const currentVideoId = searchParams.get('v') || playlist?.videoIds?.[0];

    const currentVideo = videos?.find(v => v.id === currentVideoId);

    if (isPlaylistLoading || areVideosLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Skeleton className="w-full aspect-video rounded-xl" />
                    <div className="mt-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-20 w-full mt-2" />
                    </div>
                </div>
                <aside>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-start gap-4">
                                <Skeleton className="w-[100px] h-[56px] rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                     <div key={i} className="flex items-center gap-3 p-2">
                                        <Skeleton className="w-5 h-5"/>
                                        <Skeleton className="w-[120px] h-[68px] rounded-md"/>
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        )
    }

    if (!playlist) {
        notFound();
    }
    
    const orderedVideos = playlist.videoIds.map(id => videos?.find(v => v.id === id)).filter((v): v is Video => !!v);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {currentVideo ? (
                    currentVideo.youtubeId ? (
                        <YouTubePlayer videoId={currentVideo.youtubeId} title={currentVideo.title} />
                    ) : currentVideo.videoUrl ? (
                        <MP4Player videoUrl={currentVideo.videoUrl} />
                    ) : (
                        <div className="aspect-video w-full bg-muted rounded-xl flex items-center justify-center">
                            <p>Video source not available.</p>
                        </div>
                    )
                ) : (
                     <div className="aspect-video w-full bg-muted rounded-xl flex items-center justify-center">
                        <p className="text-muted-foreground">Select a video to start watching.</p>
                    </div>
                )}
                {currentVideo && (
                    <div className="mt-4">
                        <h1 className="text-2xl font-bold tracking-tight">{currentVideo.title}</h1>
                        <p className="text-muted-foreground mt-2">{currentVideo.description}</p>
                    </div>
                )}
            </div>
            <aside>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4 mb-4">
                            {orderedVideos[0] && (
                                <Image src={orderedVideos[0].thumbnailUrl} alt={playlist.name} width={100} height={56} className="rounded-md aspect-video object-cover" data-ai-hint="playlist thumbnail" />
                            )}
                            <div>
                                <h2 className="text-xl font-semibold">{playlist.name}</h2>
                                <p className="text-sm text-muted-foreground">{orderedVideos.length || 0} videos</p>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {orderedVideos.map((video, index) => {
                                const isActive = video.id === currentVideoId;
                                return (
                                    <Link 
                                        href={`/playlist/${playlist.id}?v=${video.id}`} 
                                        key={video.id} 
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                            isActive ? "bg-accent" : "hover:bg-accent/50"
                                        )}
                                    >
                                        <span className="text-muted-foreground font-mono text-sm w-5 text-center">{isActive ? <PlayCircle className="text-primary"/> : index + 1}</span>
                                        <Image src={video.thumbnailUrl} alt={video.title} width={120} height={68} className="rounded-md aspect-video object-cover" data-ai-hint="video thumbnail" />
                                        <div>
                                            <h4 className="font-semibold text-sm line-clamp-2">{video.title}</h4>
                                            <p className="text-xs text-muted-foreground">{video.channel}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </aside>
        </div>
    )
}


export default function PlaylistPage({ params }: { params: { id: string } }) {
    const id = React.use(params);
    return <PlaylistPageContent id={id} />;
}
