
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase, useCollection, useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound, useParams, useRouter } from 'next/navigation';
import { doc, collection, query, where, limit, Timestamp, Firestore } from 'firebase/firestore';
import type { Video, Playlist, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomYouTubePlayer } from '@/components/custom-youtube-player';
import { trackVideoView } from '@/lib/video-analytics';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn, formatRelativeTime, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Share2, Bookmark, Eye, Clock, Calendar, Play, ListVideo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/breadcrumb';
import { useFavorites } from '@/hooks/use-favorites';
import { useToast } from '@/hooks/use-toast';
import { useVideoProgress } from '@/hooks/use-video-progress';
import { ResumeDialog } from '@/components/resume-dialog';
import { NotesPanel } from '@/components/notes-panel';
import { CommentsSection } from '@/components/comments-section';


function MP4Player({ 
    videoUrl, 
    videoId, 
    duration,
    onTimeUpdate 
}: { 
    videoUrl: string;
    videoId: string;
    duration: number;
    onTimeUpdate?: (time: number) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showResumeDialog, setShowResumeDialog] = useState(false);
    const hasResumedRef = useRef(false);
    
    const { resumePosition, updatePosition } = useVideoProgress({
        videoId,
        duration,
    });
    
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    
    const handleSpeedChange = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
        }
    };
    
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            updatePosition(currentTime);
            onTimeUpdate?.(currentTime);
        }
    };
    
    const handleResume = () => {
        if (videoRef.current && resumePosition) {
            videoRef.current.currentTime = resumePosition;
            hasResumedRef.current = true;
        }
        setShowResumeDialog(false);
    };
    
    const handleStartOver = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            hasResumedRef.current = true;
        }
        setShowResumeDialog(false);
    };
    
    // Show resume dialog when video is ready and has resume position
    useEffect(() => {
        if (resumePosition && !hasResumedRef.current) {
            setShowResumeDialog(true);
        }
    }, [resumePosition]);
    
    return (
        <>
            <div className="aspect-video w-full relative group">
                <video
                    ref={videoRef}
                    className="w-full h-full rounded-xl bg-black"
                    controls
                    autoPlay={!resumePosition || hasResumedRef.current}
                    src={videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                >
                    Your browser does not support the video tag.
                </video>
                
                {/* Speed Control Overlay */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 flex gap-1">
                        {speeds.map((speed) => (
                            <Button
                                key={speed}
                                size="sm"
                                variant={playbackSpeed === speed ? "default" : "ghost"}
                                className="h-7 px-2 text-xs text-white"
                                onClick={() => handleSpeedChange(speed)}
                            >
                                {speed}x
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Resume Dialog */}
            {resumePosition && (
                <ResumeDialog
                    open={showResumeDialog}
                    onResume={handleResume}
                    onStartOver={handleStartOver}
                    lastPosition={resumePosition}
                    percentage={Math.round((resumePosition / duration) * 100)}
                />
            )}
        </>
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
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ListVideo className="h-4 w-4 text-primary" />
                    </div>
                    Kursus Lainnya
                </h2>
            </div>
            
            {/* Mobile Carousel */}
            <div className="lg:hidden -mx-4">
                <Carousel
                    opts={{
                        align: "start",
                        dragFree: true,
                    }}
                    className="w-full pl-4"
                >
                    <CarouselContent className="-ml-2">
                    {playlists?.map((playlist) => (
                        <CarouselItem key={playlist.id} className="basis-2/3 sm:basis-1/2 pl-2">
                             <Link href={`/playlist/${playlist.id}`} className="block group">
                                <Card className="border-2 hover:border-primary/50 transition-all overflow-hidden">
                                    <div className="aspect-video overflow-hidden relative">
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
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">No Thumbnail</span>
                                        </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                                <Play className="h-6 w-6 text-white fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-3">
                                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{playlist.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                            <ListVideo className="h-3 w-3" />
                                            {playlist.videoIds?.length || 0} video
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                </Carousel>
            </div>
            
            {/* Desktop List */}
            <div className="hidden lg:block space-y-3">
                {playlists?.map((playlist) => (
                    <Link href={`/playlist/${playlist.id}`} key={playlist.id}>
                        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                            <CardContent className="p-3 flex items-start gap-3">
                                <div className="w-32 aspect-video overflow-hidden rounded-lg shrink-0 relative group">
                                    {playlist.videoIds?.[0] && videoThumbnails.get(playlist.videoIds[0]) ? (
                                    <Image
                                        src={videoThumbnails.get(playlist.videoIds[0])!}
                                        alt={playlist.name}
                                        width={128}
                                        height={72}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        data-ai-hint="playlist thumbnail"
                                    />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <ListVideo className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="h-5 w-5 text-white fill-current" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                        {playlist.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge variant="secondary" className="text-xs h-5">
                                            <ListVideo className="h-3 w-3 mr-1" />
                                            {playlist.videoIds?.length || 0} video
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function SuggestedPlaylistsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-32" />
            </div>
            
            {/* Mobile skeleton */}
            <div className="lg:hidden flex space-x-3 overflow-hidden -mx-4 px-4">
                 {Array.from({length: 2}).map((_, i) => (
                    <Card key={i} className="shrink-0 w-2/3 sm:w-1/2 border-2">
                        <Skeleton className="w-full aspect-video" />
                        <CardContent className="p-3 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-16" />
                        </CardContent>
                    </Card>
                 ))}
            </div>
            
            {/* Desktop skeleton */}
            <div className="hidden lg:block space-y-3">
                {Array.from({length: 5}).map((_, i) => (
                    <Card key={i} className="border-2">
                        <CardContent className="p-3 flex items-start gap-3">
                            <Skeleton className="w-32 h-[72px] rounded-lg shrink-0" />
                            <div className='flex-1 space-y-2'>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function WatchPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                <div className="space-y-4">
                    <Skeleton className="w-full aspect-video rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className='space-y-2'>
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-20" />
                                <Skeleton className="h-9 w-20" />
                                <Skeleton className="h-9 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </div>
                <div>
                    <SuggestedPlaylistsSkeleton />
                </div>
            </div>
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
    if (!firestore || typeof id !== 'string' || isUserLoading) {
        return <WatchPageSkeleton />;
    }
    
    // Redirect to login if not authenticated (additional guard)
    if (!user) {
        return <WatchPageSkeleton />;
    }

    return <WatchPageContent firestore={firestore} id={id} />;
}


function WatchPageContent({ firestore, id }: { firestore: Firestore, id: string }) {
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const { isFavorite, toggleFavorite} = useFavorites();
    const { toast } = useToast();
    const { user } = useUser();
    
    // Get user profile for moderation check
    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
    
    // Track video view when page loads
    useEffect(() => {
        if (firestore && id) {
            trackVideoView(firestore, id, user?.uid);
        }
    }, [firestore, id, user?.uid]);

    useEffect(() => {
        const container = playerContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { bottom } = container.getBoundingClientRect();
            // Become sticky when the bottom of the player is scrolled past the top of the viewport
            if (bottom < 0) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
    
    const placeholderHeight = playerContainerRef.current ? playerContainerRef.current.clientHeight : 0;

    const uploadDate = video.uploadDate ? new Date(video.uploadDate.seconds * 1000) : new Date();
    const relativeTime = formatRelativeTime(uploadDate);
    const isVideoFavorite = isFavorite(id);
    
    const handleToggleFavorite = async () => {
        const success = await toggleFavorite(id);
        if (success) {
            toast({
                title: isVideoFavorite ? "Dihapus dari Favorit" : "Ditambahkan ke Favorit",
                description: isVideoFavorite 
                    ? "Video telah dihapus dari daftar favorit Anda." 
                    : "Video telah ditambahkan ke daftar favorit Anda.",
            });
        }
    };
    
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video.title,
                    text: video.description,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled share
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link Disalin",
                description: "Link video telah disalin ke clipboard.",
            });
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                {/* Main Content */}
                <div className="space-y-4">
                    {/* Video Player */}
                    <div ref={playerContainerRef} className="aspect-video w-full">
                        <div
                            className={cn(
                                "w-full transition-all duration-300 rounded-xl overflow-hidden shadow-lg",
                                isSticky
                                    ? "fixed bottom-4 right-4 z-50 w-full max-w-[12rem] sm:max-w-sm md:max-w-md shadow-2xl"
                                    : "relative"
                            )}
                        >
                            {video.youtubeId ? (
                                <CustomYouTubePlayer youtubeId={video.youtubeId} />
                            ) : video.videoUrl ? (
                                <MP4Player 
                                    videoUrl={video.videoUrl} 
                                    videoId={id}
                                    duration={video.duration || 0}
                                    onTimeUpdate={setCurrentPosition}
                                />
                            ) : (
                                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                                    <p>Video source not available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {isSticky && <div style={{ height: placeholderHeight }} />}

                    {/* Video Info Section */}
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                                {video.title}
                            </h1>
                            
                            {/* Video Stats */}
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>{relativeTime}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span>{Math.floor(video.duration / 60)} menit</span>
                                </div>
                            </div>
                        </div>

                        {/* Channel Info & Actions */}
                        <div className="flex items-center justify-between gap-4 py-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-primary/20">
                                    <AvatarImage src={video.channelAvatarUrl} alt={video.channel} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                                        {getInitials(video.channel)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-base">{video.channel}</p>
                                    <p className="text-sm text-muted-foreground">Instruktur</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Bagikan</span>
                                </Button>
                                <Button 
                                    variant={isVideoFavorite ? "default" : "outline"}
                                    size="sm" 
                                    className="gap-2"
                                    onClick={handleToggleFavorite}
                                >
                                    <Bookmark className={cn("h-4 w-4", isVideoFavorite && "fill-current")} />
                                    <span className="hidden sm:inline">
                                        {isVideoFavorite ? "Tersimpan" : "Simpan"}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Description Card */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Eye className="h-4 w-4 text-primary" />
                                    </div>
                                    Deskripsi Video
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {video.description || "Tidak ada deskripsi untuk video ini."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        {video.playlistId && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                                <Badge variant="secondary" className="gap-1">
                                    <ListVideo className="h-3 w-3" />
                                    Bagian dari Kursus
                                </Badge>
                                {video.youtubeId && (
                                    <Badge variant="secondary">YouTube</Badge>
                                )}
                            </div>
                        )}
                        
                        {/* Comments Section */}
                        <CommentsSection videoId={id} canModerate={userProfile?.role === 'admin' || userProfile?.role === 'instructor'} />
                    </div>
                </div>

                {/* Sidebar - Related Content & Notes */}
                <div className="lg:sticky lg:top-20 lg:h-fit space-y-6">
                    {/* Notes Panel */}
                    <NotesPanel 
                        videoId={id} 
                        courseId={video.playlistId}
                        currentTime={currentPosition}
                    />
                    
                    {/* Suggested Playlists */}
                    <SuggestedPlaylists />
                </div>
            </div>
        </div>
    );
}
