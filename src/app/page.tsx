'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where,getCountFromServer } from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import type { Video, Playlist, UserProfile } from '@/lib/types';
import { VideoCard } from "@/components/video-card";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, ListVideo, Users } from 'lucide-react';
import { AddVideoDialog } from '@/components/add-video-dialog';

function VideoGridSkeleton() {
  return (
    <>
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
    </>
  );
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

                const [videosSnap, playlistsSnap, usersSnap] = await Promise.all([
                    getCountFromServer(videosCol),
                    getCountFromServer(playlistsCol),
                    getCountFromServer(usersCol),
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


function InstructorDashboard() {
    const { user } = useUser();
    const firestore = useFirestore();

    const videosQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'videos'), where('authorId', '==', user.uid), orderBy('uploadDate', 'desc'));
    }, [firestore, user]);

    const { data: videos, isLoading } = useCollection<Video>(videosQuery);
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
                <AddVideoDialog />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">My Videos</h2>
            {isLoading && <VideoGridSkeleton />}
            {!isLoading && videos?.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium text-muted-foreground">No Videos Uploaded</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start by adding your first video.</p>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {videos?.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        </div>
    );
}

function StudentDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Available Courses</h1>
            <VideoGrid />
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
  
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  if (isUserLoading || isProfileLoading) {
    return <VideoGridSkeleton />;
  }
  
  // Handle search explicitly for students or when no specific role dashboard is shown
  if (searchQuery) {
    return <VideoGrid searchQuery={searchQuery} />;
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
    <Suspense fallback={<VideoGridSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
