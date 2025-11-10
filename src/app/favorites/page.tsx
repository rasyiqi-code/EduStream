'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { useFavorites } from '@/hooks/use-favorites';
import type { Video } from '@/lib/types';
import { VideoCard } from '@/components/video-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb } from '@/components/breadcrumb';
import { Bookmark, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function FavoritesPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { favorites, isLoading: isFavoritesLoading } = useFavorites();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login?redirect=/favorites');
    }
  }, [isUserLoading, user, router]);

  const favoriteVideoIds = Array.from(favorites).slice(0, 30); // Firestore 'in' limit

  const videosQuery = useMemoFirebase(() => {
    if (!firestore || favoriteVideoIds.length === 0) return null;
    return query(
      collection(firestore, 'videos'),
      where(documentId(), 'in', favoriteVideoIds)
    );
  }, [firestore, JSON.stringify(favoriteVideoIds)]);

  const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);

  if (isUserLoading || !user || isFavoritesLoading) {
    return <FavoritesPageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Video Favorit', href: '/favorites' },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Heart className="h-5 w-5 text-white fill-current" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Video Favorit Saya</h1>
        </div>
        <p className="text-muted-foreground">
          {favorites.size > 0 
            ? `Anda memiliki ${favorites.size} video favorit` 
            : 'Anda belum menyimpan video favorit'}
        </p>
      </div>

      {areVideosLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-video rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bookmark className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Belum Ada Favorit</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Simpan video favorit Anda untuk akses cepat. Klik tombol bookmark di halaman video untuk menyimpan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

