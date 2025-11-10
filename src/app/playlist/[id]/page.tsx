
"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDuration, formatNumber } from '@/lib/utils';
import { PlayCircle, Clock, Film, GraduationCap, TrendingUp } from 'lucide-react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, DocumentData, Firestore } from 'firebase/firestore';
import type { Playlist, Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/breadcrumb';
import { Badge } from '@/components/ui/badge';

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
    
    // Calculate total duration
    const totalDuration = orderedVideos.reduce((acc, video) => acc + (video.duration || 0), 0);
    const totalMinutes = Math.floor(totalDuration / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Breadcrumb */}
            <Breadcrumb 
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Playlist', href: '/playlists' },
                { label: playlist.name, href: `/playlist/${playlist.id}` },
              ]}
              className="mb-6"
            />
            
             {/* Hero Section */}
             <section className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border-2 shadow-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <div className="relative grid md:grid-cols-2 gap-6 md:gap-10 items-center p-8 md:p-10">
                    <div className="order-2 md:order-1 space-y-6">
                        {/* Badge */}
                        <Badge variant="secondary" className="gap-2 px-4 py-2">
                            <GraduationCap className="h-4 w-4" />
                            Kursus
                        </Badge>
                        
                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{playlist.name}</h1>
                            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">{playlist.description}</p>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 pt-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <Film className="h-5 w-5" />
                                    {orderedVideos.length}
                                </div>
                                <p className="text-xs text-muted-foreground">Video</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <Clock className="h-5 w-5" />
                                    {totalHours > 0 ? `${totalHours}j` : `${totalMinutes}m`}
                                </div>
                                <p className="text-xs text-muted-foreground">Durasi</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <TrendingUp className="h-5 w-5" />
                                    0%
                                </div>
                                <p className="text-xs text-muted-foreground">Progress</p>
                            </div>
                        </div>
                        
                        {firstVideoId && (
                            <Button asChild size="lg" className="w-full md:w-auto shadow-lg">
                                <Link href={`/watch/${firstVideoId}`}>
                                    <PlayCircle className="mr-2 h-5 w-5" /> Mulai Kursus
                                </Link>
                            </Button>
                        )}
                    </div>
                     
                     <div className="order-1 md:order-2 relative group">
                        <div className="aspect-video overflow-hidden rounded-xl shadow-2xl border-2 border-border">
                            <Image
                                src={heroThumbnail}
                                alt={playlist.name}
                                width={1280}
                                height={720}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint="course cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            
                            {/* Play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                                    <PlayCircle className="h-12 w-12 text-white fill-current" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent/20 blur-3xl -z-10" />
                        <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/20 blur-3xl -z-10" />
                    </div>
                </div>
            </section>
            
            {/* Video List */}
            <section>
                 <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Daftar Isi Kursus</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {orderedVideos.length} video • {totalHours > 0 ? `${totalHours} jam ${totalMinutes % 60} menit` : `${totalMinutes} menit`} total
                        </p>
                    </div>
                 </div>
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
                    <div className="space-y-3">
                        {orderedVideos.map((video, index) => (
                             <Card key={video.id} className="group border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-4">
                                      {/* Number Badge */}
                                      <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold shrink-0">
                                          {index + 1}
                                      </div>
                                      
                                      {/* Thumbnail */}
                                      <div className="relative w-32 md:w-40 aspect-video overflow-hidden rounded-lg shrink-0 group">
                                          <Image 
                                              src={video.thumbnailUrl} 
                                              alt={video.title} 
                                              width={160} 
                                              height={90} 
                                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                              data-ai-hint="video thumbnail"
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <PlayCircle className="h-8 w-8 text-white fill-current" />
                                          </div>
                                          {/* Duration badge */}
                                          <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                                              {formatDuration(video.duration)}
                                          </div>
                                      </div>
                                      
                                      {/* Video Info */}
                                      <div className="flex-1 min-w-0">
                                          <h3 className="font-semibold text-base md:text-lg line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                                              {video.title}
                                          </h3>
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                              <span className="flex items-center gap-1">
                                                  <Clock className="h-3 w-3" />
                                                  {formatDuration(video.duration)}
                                              </span>
                                              <span>•</span>
                                              <span className="md:hidden">Video #{index + 1}</span>
                                          </div>
                                      </div>
                                      
                                      {/* Play Button */}
                                      <Button 
                                          asChild 
                                          className="ml-auto self-center shrink-0 shadow-md"
                                          size="sm"
                                      >
                                          <Link href={`/watch/${video.id}`}>
                                              <PlayCircle className="h-4 w-4 mr-2"/>
                                              <span className="hidden sm:inline">Tonton</span>
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
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const id = params.id;

    useEffect(() => {
        if (!isUserLoading && !user) {
          router.replace(`/login?redirect=/playlist/${id}`);
        }
    }, [isUserLoading, user, router, id]);
    
    // Critical Guard: Ensure firestore and a valid ID are present before proceeding.
    if (!firestore || typeof id !== 'string' || isUserLoading || !user) {
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
