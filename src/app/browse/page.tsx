/**
 * @file browse/page.tsx
 * @description Browse all videos and courses with advanced filters
 */

'use client';

import React, { Suspense } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { usePaginatedCollection } from '@/hooks/use-paginated-collection';
import { AdvancedFilters, FilterOptions } from '@/components/advanced-filters';
import { VideoCard } from '@/components/video-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function BrowsePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <div className="hidden lg:block">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowsePageContent() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<FilterOptions>({
    sortBy: 'newest'
  });

  // Build base query
  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    let baseQuery = collection(firestore, 'videos');
    let conditions: any[] = [];

    // Apply category filter
    if (filters.category) {
      conditions.push(where('category', '==', filters.category));
    }

    // Apply level filter
    if (filters.level) {
      conditions.push(where('level', '==', filters.level));
    }

    // Apply instructor filter (by channel name)
    if (filters.instructor) {
      conditions.push(where('channel', '==', filters.instructor));
    }

    // Apply sorting
    let orderByField = 'uploadDate';
    let orderByDirection: 'asc' | 'desc' = 'desc';

    switch (filters.sortBy) {
      case 'newest':
        orderByField = 'uploadDate';
        orderByDirection = 'desc';
        break;
      case 'oldest':
        orderByField = 'uploadDate';
        orderByDirection = 'asc';
        break;
      case 'duration-asc':
        orderByField = 'duration';
        orderByDirection = 'asc';
        break;
      case 'duration-desc':
        orderByField = 'duration';
        orderByDirection = 'desc';
        break;
      case 'popular':
        orderByField = 'views';
        orderByDirection = 'desc';
        break;
    }

    return query(baseQuery, ...conditions, orderBy(orderByField, orderByDirection));
  }, [firestore, filters.category, filters.level, filters.instructor, filters.sortBy]);

  const {
    data: videos,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    isEmpty
  } = usePaginatedCollection<Video>(videosQuery, { pageSize: 12 });

  // Extract unique instructors from loaded videos (no separate query needed)
  const instructors = React.useMemo(() => {
    if (!videos || videos.length === 0) return [];
    
    // Get unique channel names from videos
    const uniqueChannels = new Set<string>();
    videos.forEach((video) => {
      if (video.channel) {
        uniqueChannels.add(video.channel);
      }
    });
    
    return Array.from(uniqueChannels).sort();
  }, [videos]);

  // Client-side filtering for search and duration
  const filteredVideos = React.useMemo(() => {
    let result = videos;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Duration filter (client-side since Firestore doesn't support range queries with other filters)
    if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
      const minSec = (filters.minDuration || 0) * 60;
      const maxSec = (filters.maxDuration || 120) * 60;
      result = result.filter((video) => {
        const duration = video.duration || 0;
        return duration >= minSec && duration <= maxSec;
      });
    }

    return result;
  }, [videos, searchTerm, filters.minDuration, filters.maxDuration]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableInstructors={instructors}
          />
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Jelajahi Semua Bab/Seri
            </h1>
            <p className="text-muted-foreground">
              Temukan konten pembelajaran yang sesuai dengan kebutuhan Anda
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari judul atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Mobile Filters Button */}
            <div className="lg:hidden">
              <AdvancedFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableInstructors={instructors}
              />
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Belum ada bab/seri yang tersedia.
              </p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tidak ada hasil yang sesuai dengan pencarian Anda.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ sortBy: 'newest' });
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && !searchTerm && (
                <div className="flex justify-center">
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

              {/* Results Count */}
              <p className="text-center text-sm text-muted-foreground">
                Showing {filteredVideos.length} of {videos.length} bab/seri
                {hasMore && ' (load more for additional content)'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowsePageSkeleton />}>
      <BrowsePageContent />
    </Suspense>
  );
}

