"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { playlists, videos } from "@/lib/data";
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import React from 'react';

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


export default function PlaylistPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const searchParams = useSearchParams();
    const playlist = playlists.find((p) => p.id === id);

    if (!playlist) {
        notFound();
    }
    
    const playlistVideos = playlist.videoIds.map(videoId => videos.find(v => v.id === videoId)).filter(Boolean);

    const currentVideoId = searchParams.get('v') || playlist.videoIds[0];
    const currentVideo = videos.find(v => v.id === currentVideoId);

    if (!currentVideo) {
        // This case should ideally not happen if data is consistent
        return <p>Selected video not found in this playlist.</p>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {currentVideo.youtubeId ? (
                    <YouTubePlayer videoId={currentVideo.youtubeId} title={currentVideo.title} />
                ) : currentVideo.videoUrl ? (
                    <MP4Player videoUrl={currentVideo.videoUrl} />
                ) : (
                    <div className="aspect-video w-full bg-muted rounded-xl flex items-center justify-center">
                        <p>Video source not available.</p>
                    </div>
                )}
                <div className="mt-4">
                    <h1 className="text-2xl font-bold tracking-tight">{currentVideo.title}</h1>
                    <p className="text-muted-foreground mt-2">{currentVideo.description}</p>
                </div>
            </div>
            <aside>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4 mb-4">
                            <Image src={playlist.thumbnailUrl} alt={playlist.name} width={100} height={56} className="rounded-md aspect-video object-cover" data-ai-hint="playlist thumbnail" />
                            <div>
                                <h2 className="text-xl font-semibold">{playlist.name}</h2>
                                <p className="text-sm text-muted-foreground">{playlistVideos.length} videos</p>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {playlistVideos.map((video, index) => {
                                if (!video) return null;
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
                                        <span className="text-muted-foreground font-mono text-sm">{isActive ? <PlayCircle className="text-primary"/> : index + 1}</span>
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
