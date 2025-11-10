
'use client';
import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, where, getCountFromServer, doc, deleteDoc } from 'firebase/firestore';
import { usePaginatedCollection } from '@/hooks/use-paginated-collection';
import type { Video, Playlist, UserProfile } from '@/lib/types';
import { OnboardingTour } from '@/components/onboarding-tour';
import { VideoCard } from "@/components/video-card";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ContinueWatching } from '@/components/continue-watching';
import { Film, ListVideo, MoreHorizontal, PlusCircle, Users, Play } from 'lucide-react';
import { AddVideoDialog } from '@/components/add-video-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PlaylistForm } from '@/components/playlist-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {Array.from({ length: 8 }).map((_, i) => (
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
    </div>
  );
}

function PlaylistListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {Array.from({ length: 4 }).map((_, i) => (
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
    </div>
  )
}


function StatCard({ title, value, icon: Icon, isLoading, gradient }: { 
    title: string, 
    value: number, 
    icon: React.ElementType, 
    isLoading: boolean,
    gradient: string 
}) {
    return (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className={`absolute inset-0 opacity-5 ${gradient}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${gradient} bg-opacity-10`}>
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="relative">
                {isLoading ? (
                    <Skeleton className="h-10 w-24" />
                ) : (
                    <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold">{value}</div>
                        <div className="text-sm text-muted-foreground">total</div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function AdminDashboard() {
    const firestore = useFirestore();
    const [counts, setCounts] = React.useState({ videos: 0, playlists: 0, users: 0 });
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchCounts() {
            if (!firestore) return;
            setIsLoading(true);
            try {
                const videosCol = collection(firestore, 'videos');
                const playlistsCol = collection(firestore, 'playlists');
                const usersCol = collection(firestore, 'users');

                const videosPromise = getCountFromServer(videosCol).catch(err => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({ operation: 'list', path: 'videos' }));
                    return { data: () => ({ count: 0 }) };
                });
                const playlistsPromise = getCountFromServer(playlistsCol).catch(err => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({ operation: 'list', path: 'playlists' }));
                    return { data: () => ({ count: 0 }) };
                });
                const usersPromise = getCountFromServer(usersCol).catch(err => {
                    console.error('Error counting users:', err);
                    return { data: () => ({ count: 0 }) };
                });
                
                const [videosSnap, playlistsSnap, usersSnap] = await Promise.all([
                    videosPromise,
                    playlistsPromise,
                    usersPromise,
                ]);

                setCounts({
                    videos: videosSnap.data().count,
                    playlists: playlistsSnap.data().count,
                    users: usersSnap.data().count,
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCounts();
    }, [firestore]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard Admin</h1>
                <p className="text-muted-foreground">Selamat datang kembali! Berikut adalah ringkasan platform.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Total Kursus" 
                    value={counts.playlists} 
                    icon={ListVideo} 
                    isLoading={isLoading}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard 
                    title="Total Bab/Seri" 
                    value={counts.videos} 
                    icon={Film} 
                    isLoading={isLoading}
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                />
                <Link href="/admin/users" className="block group">
                    <StatCard 
                        title="Total Pengguna" 
                        value={counts.users || 0} 
                        icon={Users} 
                        isLoading={isLoading}
                        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                </Link>
            </div>
            
            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2">
                <Link href="/admin/users">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Manajemen User
                            </CardTitle>
                            <CardDescription>
                                Kelola user, role, dan permissions
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/admin/analytics">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlusCircle className="h-5 w-5" />
                                Analytics Dashboard
                            </CardTitle>
                            <CardDescription>
                                Lihat statistik dan insights platform
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Semua Kursus</h2>
                        <p className="text-sm text-muted-foreground mt-1">Kelola semua kursus di platform</p>
                    </div>
                </div>
                <PlaylistGrid />
            </div>
        </div>
    );
}

function InstructorPlaylists({ onEdit }: { onEdit: (playlist: Playlist) => void }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const playlistsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'playlists'), where('authorId', '==', user.uid));
    }, [firestore, user]);

    const { data: playlists, isLoading } = useCollection<Playlist>(playlistsQuery);
    
    const handleDelete = async (playlistId: string) => {
        if (!firestore) return;
        const playlistDocRef = doc(firestore, 'playlists', playlistId);
        deleteDocumentNonBlocking(playlistDocRef);
        toast({
            title: "Kursus Dihapus",
            description: "Kursus telah berhasil dihapus.",
        });
    };

    return (
        <div>
            {isLoading ? (
                <PlaylistListSkeleton />
            ) : playlists && playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.map((playlist) => (
                        <Card key={playlist.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="line-clamp-2">{playlist.name}</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(playlist)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                Delete
                                            </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the playlist.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(playlist.id)}>
                                                Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground pt-2">
                                    <ListVideo className="mr-1.5 h-4 w-4" />
                                    {playlist.videoIds?.length || 0} bab/seri
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium text-muted-foreground">Belum Ada Kursus</h3>
                    <p className="text-sm text-muted-foreground mb-4">Mulai dengan membuat kursus/materi pertama Anda.</p>
                </div>
            )}
        </div>
    );
}


function InstructorDashboard() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | undefined>(undefined);

    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | undefined>(undefined);


    // Query only instructor's own videos (more efficient)
    const videosQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'videos'), 
            where('authorId', '==', user.uid),
            orderBy('uploadDate', 'desc')
        );
    }, [firestore, user]);

    const { data: myVideos, isLoading } = useCollection<Video>(videosQuery);
    
    const handleEditPlaylist = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setPlaylistDialogOpen(true);
    };

    const handleAddNewPlaylist = () => {
        setSelectedPlaylist(undefined);
        setPlaylistDialogOpen(true);
    };

    const handleEditVideo = (video: Video) => {
        setSelectedVideo(video);
        setVideoDialogOpen(true);
    };

    const handleAddNewVideo = () => {
        setSelectedVideo(undefined);
        setVideoDialogOpen(true);
    };
    
    const handleDeleteVideo = (videoId: string) => {
        if (!firestore) return;
        const videoDocRef = doc(firestore, 'videos', videoId);
        deleteDocumentNonBlocking(videoDocRef);
        toast({
            title: "Bab/Seri Dihapus",
            description: "Bab/seri telah berhasil dihapus.",
        });
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard Instruktur</h1>
                    <p className="text-muted-foreground">Kelola video dan playlist Anda</p>
                </div>
                <div className="flex items-center gap-2">
                     <Button onClick={handleAddNewPlaylist} variant="outline" className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Buat Kursus</span>
                    </Button>
                    <Button onClick={handleAddNewVideo} className="gap-2 shadow-md">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Tambah Bab/Seri</span>
                    </Button>
                </div>
            </div>

            <PlaylistForm
                isOpen={playlistDialogOpen}
                setIsOpen={setPlaylistDialogOpen}
                playlist={selectedPlaylist}
            />
            
            <AddVideoDialog 
                isOpen={videoDialogOpen}
                setIsOpen={setVideoDialogOpen}
                video={selectedVideo}
            />

            <Tabs defaultValue="playlists">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="playlists">Kursus Saya</TabsTrigger>
                        <TabsTrigger value="videos">Bab/Seri Saya</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="playlists" className="mt-6">
                   <InstructorPlaylists onEdit={handleEditPlaylist} />
                </TabsContent>
                <TabsContent value="videos" className="mt-6">
                    {isLoading && <VideoGridSkeleton />}
                    {!isLoading && (!myVideos || myVideos.length === 0) && (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-medium text-muted-foreground">Belum Ada Bab/Seri</h3>
                            <p className="text-sm text-muted-foreground mb-4">Buat kursus terlebih dahulu, lalu tambahkan bab/seri di dalamnya.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {myVideos?.map((video) => (
                            <div key={video.id} className="relative group/card">
                                <VideoCard video={video} />
                                <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditVideo(video)}>
                                                Edit
                                            </DropdownMenuItem>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    Delete
                                                </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the video.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteVideo(video.id)}>
                                                    Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PlaylistGrid({ searchQuery }: { searchQuery?: string }) {
  const firestore = useFirestore();

  const playlistsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'playlists'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { 
    data: playlists, 
    isLoading: arePlaylistsLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    isEmpty
  } = usePaginatedCollection<Playlist>(playlistsCollection, { pageSize: 12 });
  
  const firstVideoIds = React.useMemo(() => {
      if (!playlists) return [];
      return playlists.map(p => p.videoIds?.[0]).filter((id): id is string => !!id);
  }, [playlists]);

  const videosQuery = useMemoFirebase(() => {
      if (!firestore || firstVideoIds.length === 0) return null;
      // Firestore 'in' query is limited to 30 items. We'll use the first 30.
      return query(collection(firestore, 'videos'), where('__name__', 'in', firstVideoIds.slice(0, 30)));
  }, [firestore, JSON.stringify(firstVideoIds.slice(0, 30))]);

  const { data: firstVideos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);
  
  // Don't wait for videos if there are no video IDs to fetch
  const isActuallyLoadingVideos = firstVideoIds.length > 0 ? areVideosLoading : false;
  
  const videoDetailsMap = React.useMemo(() => {
      if (!firstVideos) return new Map<string, Pick<Video, 'thumbnailUrl' | 'channel' | 'channelAvatarUrl'>>();
      const map = new Map<string, Pick<Video, 'thumbnailUrl' | 'channel' | 'channelAvatarUrl'>>();
      firstVideos.forEach(video => {
          map.set(video.id, { 
              thumbnailUrl: video.thumbnailUrl,
              channel: video.channel,
              channelAvatarUrl: video.channelAvatarUrl
          });
      });
      return map;
  }, [firstVideos]);

  // Client-side filtering for search
  const filteredPlaylists = React.useMemo(() => {
    if (!playlists) return [];
    if (!searchQuery) return playlists;
    return playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [playlists, searchQuery]);

  if (arePlaylistsLoading || isActuallyLoadingVideos) {
    return <PlaylistListSkeleton />;
  }

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Belum ada kursus yang tersedia.</p>
      </div>
    );
  }
  
  if (filteredPlaylists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Playlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredPlaylists?.map((playlist) => {
        const firstVideoId = playlist.videoIds?.[0];
        const videoDetails = firstVideoId ? videoDetailsMap.get(firstVideoId) : null;
        const thumbnailUrl = videoDetails?.thumbnailUrl || 'https://picsum.photos/seed/placeholder/640/360';
        const channel = videoDetails?.channel || 'Playlist';
        const channelAvatarUrl = videoDetails?.channelAvatarUrl;

        return (
          <div key={playlist.id} className="group">
            <Link href={`/playlist/${playlist.id}`} className="block">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                <Image
                  src={thumbnailUrl}
                  alt={playlist.name}
                  width={640}
                  height={360}
                  className="w-full h-full object-cover"
                  data-ai-hint="course thumbnail"
                />
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Playlist badge */}
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                  <ListVideo className="h-3 w-3" />
                  {playlist.videoIds?.length || 0} video
                </div>
                
                {/* Play button overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-full p-4 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="h-8 w-8 text-white fill-current" />
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="flex items-start gap-3 mt-3">
              <Link href={`/playlist/${playlist.id}`} className="flex-shrink-0">
                <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary transition-colors duration-300">
                  {channelAvatarUrl && <AvatarImage src={channelAvatarUrl} alt={channel} />}
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-accent text-white">
                    {channel.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link href={`/playlist/${playlist.id}`}>
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {playlist.name}
                  </h3>
                </Link>
                
                <Link href="#" className="block mt-1">
                  <p className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {channel}
                  </p>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
      </div>
      
      {/* Load More Button */}
      {hasMore && !searchQuery && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <span className="mr-2">Loading...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              <>Load More</>
            )}
          </Button>
        </div>
      )}
      
      {/* Showing count */}
      {!searchQuery && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filteredPlaylists.length} kursus{hasMore ? ' (load more for additional content)' : ''}
        </p>
      )}
    </div>
  );
}

function StudentDashboard() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') ?? '';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    {searchQuery ? `Hasil Pencarian` : "Kursus Tersedia"}
                </h1>
                <p className="text-muted-foreground">
                    {searchQuery ? `Menampilkan hasil untuk "${searchQuery}"` : "Jelajahi berbagai kursus pembelajaran"}
                </p>
            </div>
            
            {/* Continue Watching Section */}
            {!searchQuery && (
                <ContinueWatching />
            )}
            
            <PlaylistGrid searchQuery={searchQuery} />
        </div>
    )
}

function VideoGrid({ searchQuery }: { searchQuery?: string }) {
  const firestore = useFirestore();
  const videosCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const { 
    data: videos, 
    isLoading, 
    isLoadingMore, 
    hasMore, 
    loadMore,
    isEmpty 
  } = usePaginatedCollection<Video>(videosCollection, { pageSize: 12 });

  // Client-side filtering for search
  const filteredVideos = React.useMemo(() => {
    if (!videos) return [];
    if (!searchQuery) return videos;
    return videos.filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videos, searchQuery]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        <VideoGridSkeleton />
      </div>
    );
  }

  if (isEmpty || !videos) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Belum ada bab/seri yang tersedia.</p>
      </div>
    );
  }
  
  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {filteredVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      
      {/* Load More Button */}
      {hasMore && !searchQuery && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <span className="mr-2">Loading...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              <>Load More</>
            )}
          </Button>
        </div>
      )}
      
      {/* Showing count */}
      {!searchQuery && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filteredVideos.length} bab/seri{hasMore ? ' (load more for additional content)' : ''}
        </p>
      )}
    </div>
  );
}


function DashboardPageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  if (isUserLoading || isProfileLoading || !user) {
    return <PlaylistListSkeleton />;
  }
  
  switch (userProfile?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
}

export default function DashboardPage() {
  return (
    <>
      <OnboardingTour variant="dashboard" />
      <Suspense fallback={<PlaylistListSkeleton />}>
        <DashboardPageContent />
      </Suspense>
    </>
  );
}

    