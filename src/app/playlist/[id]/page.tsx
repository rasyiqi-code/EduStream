
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, DocumentData, Firestore } from 'firebase/firestore';
import type { Playlist, Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function PlaylistPageSkeleton() {
    return (
        <div>
            <div className="mb-8">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-2/3 mb-4" />
                <Skeleton className="h-12 w-48" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="flex items-center gap-4 p-4">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="w-32 h-20 rounded-md" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-4/5" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-10 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function PlaylistPageContent({ playlist }: { playlist: Playlist & {id: string} }) {
    const firestore = useFirestore();
    
    // Firestore 'in' queries are limited to 30 elements.
    const videoIds = playlist.videoIds?.slice(0, 30) || [];

    const videosQuery = useMemoFirebase(() => {
        if (!firestore || videoIds.length === 0) return null;
        return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
    }, [firestore, JSON.stringify(videoIds)]);

    const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);
    
    // Order videos based on the `videoIds` array from the playlist
    const orderedVideos = React.useMemo(() => {
        if (!videos || !playlist.videoIds) return [];
        const videoMap = new Map(videos.map(v => [v.id, v]));
        return playlist.videoIds
            .map(id => videoMap.get(id))
            .filter((v): v is Video => !!v);
    }, [videos, playlist.videoIds]);

    const firstVideo = orderedVideos[0];
    const firstVideoId = firstVideo?.id;
    const heroThumbnail = firstVideo?.thumbnailUrl || "https://picsum.photos/seed/playlist-hero/1280/720";

    return (
        <div>
             <section className="relative mb-10 overflow-hidden rounded-xl bg-card text-card-foreground">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-transparent" />
                <div className="relative grid md:grid-cols-2 gap-6 md:gap-10 items-end p-6 md:p-8">
                    <div className="order-2 md:order-1">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-3">{playlist.name}</h1>
                        <p className="text-muted-foreground mb-4 max-w-xl">{playlist.description}</p>
                        <p className="text-sm text-muted-foreground mb-6">{orderedVideos.length} video dalam kursus ini</p>
                        {firstVideoId && (
                            <Button asChild size="lg">
                                <Link href={`/watch/${firstVideoId}`}>
                                <PlayCircle className="mr-2 h-5 w-5" /> Mulai Kursus
                                </Link>
                            </Button>
                        )}
                    </div>
                     <div className="order-1 md:order-2 aspect-video overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src={heroThumbnail}
                            alt={playlist.name}
                            width={1280}
                            height={720}
                            className="w-full h-full object-cover"
                            data-ai-hint="course cover"
                        />
                    </div>
                </div>
            </section>
            
            {/* Video List */}
            <section>
                 <h2 className="text-2xl font-bold mb-6">Daftar Isi Kursus</h2>
                 {areVideosLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: videoIds.length || 3 }).map((_, i) => (
                             <Card key={i}>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <Skeleton className="h-6 w-6" />
                                    <Skeleton className="w-32 h-20 rounded-md" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-4/5" />
                                        <Skeleton className="h-4 w-1/4" />
                                    </div>
                                    <Skeleton className="h-10 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                 ) : orderedVideos.length > 0 ? (
                    <div className="space-y-4">
                        {orderedVideos.map((video, index) => (
                             <Card key={video.id} className="hover:bg-accent/50 transition-colors border-0">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-3 md:gap-4">
                                      <span className="hidden md:block text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                                      <Image 
                                          src={video.thumbnailUrl} 
                                          alt={video.title} 
                                          width={128} 
                                          height={72} 
                                          className="w-28 md:w-32 rounded-md aspect-video object-cover shrink-0"
                                          data-ai-hint="video thumbnail"
                                      />
                                      <div className="flex-1 min-w-0 flex items-center h-full">
                                          <h3 className="font-semibold text-sm md:text-lg line-clamp-2 leading-snug">{video.title}</h3>
                                      </div>
                                      <Button asChild variant="secondary" size="sm" className="h-8 md:h-10 ml-auto self-center">
                                          <Link href={`/watch/${video.id}`}>
                                              <PlayCircle className="mr-0 md:mr-2 h-4 w-4"/>
                                              <span className="hidden md:inline">Putar</span>
                                          </Link>
                                      </Button>
                                  </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                 ): (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Tidak ada video dalam playlist ini.</p>
                    </div>
                 )}
            </section>
        </div>
    )
}

export default function PlaylistPage() {
    const firestore = useFirestore();
    const params = useParams();
    const id = params.id;
    
    // Critical Guard: Ensure firestore and a valid ID are present before proceeding.
    if (!firestore || typeof id !== 'string') {
        return <PlaylistPageSkeleton />;
    }

    const playlistRef = useMemoFirebase(() => {
        return doc(firestore, 'playlists', id);
    }, [firestore, id]);

    const { data: playlist, isLoading: isPlaylistLoading } = useDoc<Playlist>(playlistRef);
    
    if (isPlaylistLoading) {
      return <PlaylistPageSkeleton />;
    }

    if (!playlist) {
        notFound();
        return null;
    }
    
    return <PlaylistPageContent playlist={{...playlist, id}} />;
}
