'use client';
import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, where, getCountFromServer, doc, deleteDoc } from 'firebase/firestore';
import type { Video, Playlist, UserProfile } from '@/lib/types';
import { VideoCard } from "@/components/video-card";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Film, ListVideo, MoreHorizontal, PlusCircle, Users } from 'lucide-react';
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


function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: number, icon: React.ElementType, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
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
                    errorEmitter.emit('permission-error', new FirestorePermissionError({ operation: 'list', path: 'users' }));
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
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Videos" value={counts.videos} icon={Film} isLoading={isLoading} />
                <StatCard title="Total Playlists" value={counts.playlists} icon={ListVideo} isLoading={isLoading} />
                <StatCard title="Total Users" value={counts.users} icon={Users} isLoading={isLoading} />
            </div>
             <div className="mt-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4">All Videos</h2>
                <VideoGrid />
            </div>
        </div>
    );
}

function InstructorPlaylists() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | undefined>(undefined);
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const playlistsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'playlists'), where('authorId', '==', user.uid));
    }, [firestore, user]);

    const { data: playlists, isLoading } = useCollection<Playlist>(playlistsQuery);
    
    const handleEdit = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setDialogOpen(true);
    };

    const handleAddNew = () => {
        setSelectedPlaylist(undefined);
        setDialogOpen(true);
    };

    const handleDelete = async (playlistId: string) => {
        if (!firestore) return;
        const playlistDocRef = doc(firestore, 'playlists', playlistId);
        deleteDocumentNonBlocking(playlistDocRef);
        toast({
            title: "Playlist Deleted",
            description: "The playlist has been successfully deleted.",
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold tracking-tight">My Playlists</h2>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Playlist
                </Button>
            </div>

            <PlaylistForm
                isOpen={dialogOpen}
                setIsOpen={setDialogOpen}
                playlist={selectedPlaylist}
            />

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
                                    <DropdownMenuItem onClick={() => handleEdit(playlist)}>
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
                                <CardDescription className="line-clamp-3 h-[60px]">{playlist.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{playlist.videoIds?.length || 0} videos</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium text-muted-foreground">No Playlists Created</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start by creating your first playlist.</p>
                     <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Playlist
                    </Button>
                </div>
            )}
        </div>
    );
}


function InstructorDashboard() {
    const { user } = useUser();
    const firestore = useFirestore();

    const videosQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'videos'), orderBy('uploadDate', 'desc'));
    }, [firestore]);

    const { data: allVideos, isLoading } = useCollection<Video>(videosQuery);

    const myVideos = React.useMemo(() => {
        if (!allVideos || !user) return [];
        return allVideos.filter(video => video.authorId === user.uid);
    }, [allVideos, user]);
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
            </div>

            <Tabs defaultValue="videos">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="videos">My Videos</TabsTrigger>
                        <TabsTrigger value="playlists">My Playlists</TabsTrigger>
                    </TabsList>
                     <AddVideoDialog />
                </div>
                <TabsContent value="videos" className="mt-6">
                    {isLoading && <VideoGridSkeleton />}
                    {!isLoading && myVideos.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-medium text-muted-foreground">No Videos Uploaded</h3>
                            <p className="text-sm text-muted-foreground mb-4">Start by adding your first video.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {myVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="playlists" className="mt-6">
                   <InstructorPlaylists />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PlaylistGrid({ searchQuery }: { searchQuery?: string }) {
  const firestore = useFirestore();

  const playlistsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'playlists'));
  }, [firestore]);

  const { data: playlists, isLoading: arePlaylistsLoading } = useCollection<Playlist>(playlistsCollection);
  
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

  const filteredPlaylists = playlists?.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery?.toLowerCase() ?? "") ||
    playlist.description.toLowerCase().includes(searchQuery?.toLowerCase() ?? "")
  );

  if (arePlaylistsLoading || areVideosLoading) {
    return <PlaylistListSkeleton />;
  }
  
  if (filteredPlaylists?.length === 0) {
      return (
        <div className="text-center py-10 col-span-full">
            <h3 className="text-lg font-medium text-muted-foreground">No Courses Found</h3>
            <p className="text-sm text-muted-foreground">Try searching for something else.</p>
        </div>
      )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {filteredPlaylists?.map((playlist) => {
        const firstVideoId = playlist.videoIds?.[0];
        const videoDetails = firstVideoId ? videoDetailsMap.get(firstVideoId) : null;
        const thumbnailUrl = videoDetails?.thumbnailUrl || 'https://picsum.photos/seed/placeholder/640/360';
        const channel = videoDetails?.channel || 'Playlist';
        const channelAvatarUrl = videoDetails?.channelAvatarUrl;

        return (
          <Card key={playlist.id} className="overflow-hidden border-0 shadow-none rounded-lg bg-transparent">
            <CardContent className="p-0">
              <Link href={`/playlist/${playlist.id}`} className="block group">
                <div className="aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={thumbnailUrl}
                    alt={playlist.name}
                    width={640}
                    height={360}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="course thumbnail"
                  />
                </div>
              </Link>
              <div className="flex items-start gap-4 mt-3">
                <Link href={`/playlist/${playlist.id}`}>
                    <Avatar>
                        {channelAvatarUrl && <AvatarImage src={channelAvatarUrl} alt={channel} />}
                        <AvatarFallback>
                            {channel.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1">
                  <Link href={`/playlist/${playlist.id}`}>
                    <h3 className="font-semibold text-base leading-snug line-clamp-2">
                      {playlist.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{channel}</p>
                  <div className="text-sm text-muted-foreground">
                    <span>{playlist.videoIds?.length || 0} videos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StudentDashboard() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search');

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Available Courses"}
            </h1>
            <PlaylistGrid searchQuery={searchQuery || undefined} />
        </div>
    )
}

function VideoGrid({ searchQuery }: { searchQuery?: string }) {
  const firestore = useFirestore();
  const videosCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const { data: videos, isLoading } = useCollection<Video>(videosCollection);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        <VideoGridSkeleton />
      </div>
    );
  }
  
  const filteredVideos = videos?.filter((video) =>
    video.title.toLowerCase().includes(searchQuery?.toLowerCase() ?? "") ||
    video.description.toLowerCase().includes(searchQuery?.toLowerCase() ?? "")
  );

  if (filteredVideos?.length === 0) {
    return <p className="text-center text-muted-foreground col-span-full">No videos found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {filteredVideos?.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}


function HomePageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  if (isUserLoading || isProfileLoading) {
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

export default function Home() {
  return (
    <Suspense fallback={<PlaylistListSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

    