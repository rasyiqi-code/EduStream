/**
 * @file use-paginated-collection.ts
 * @description Custom hook for paginated Firestore queries with infinite scroll support
 * 
 * Features:
 * - Auto-load more on scroll
 * - Manual "Load More" button
 * - Customizable page size
 * - Loading states
 * - Empty state detection
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Query, 
  DocumentData, 
  getDocs, 
  limit as firestoreLimit, 
  startAfter,
  query as firestoreQuery,
  QueryDocumentSnapshot
} from 'firebase/firestore';

export interface UsePaginatedCollectionOptions {
  pageSize?: number;
  enabled?: boolean;
}

export interface UsePaginatedCollectionResult<T> {
  data: (T & { id: string })[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
  isEmpty: boolean;
  totalLoaded: number;
}

/**
 * Hook for paginated Firestore collection queries
 * 
 * @example
 * ```typescript
 * const videosQuery = useMemoFirebase(() => {
 *   if (!firestore) return null;
 *   return query(collection(firestore, 'videos'), orderBy('uploadDate', 'desc'));
 * }, [firestore]);
 * 
 * const { data: videos, loadMore, hasMore, isLoading } = usePaginatedCollection<Video>(
 *   videosQuery,
 *   { pageSize: 12 }
 * );
 * ```
 */
export function usePaginatedCollection<T = any>(
  baseQuery: Query<DocumentData> | null | undefined,
  options: UsePaginatedCollectionOptions = {}
): UsePaginatedCollectionResult<T> {
  const { pageSize = 12, enabled = true } = options;

  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Create stable query key for dependency
  const queryKey = useMemo(() => {
    if (!baseQuery) return null;
    return baseQuery.toString();
  }, [baseQuery]);

  /**
   * Fetch initial page
   */
  const fetchInitialPage = useCallback(async () => {
    if (!baseQuery || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const paginatedQuery = firestoreQuery(baseQuery, firestoreLimit(pageSize));
      const snapshot = await getDocs(paginatedQuery);

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (T & { id: string })[];

      setData(items);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error('Error fetching initial page:', err);
      setError(err as Error);
      setData([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [baseQuery, enabled, pageSize]);

  /**
   * Load more items (next page)
   */
  const loadMore = useCallback(async () => {
    if (!baseQuery || !enabled || !hasMore || isLoadingMore || !lastDoc) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const paginatedQuery = firestoreQuery(
        baseQuery,
        startAfter(lastDoc),
        firestoreLimit(pageSize)
      );
      const snapshot = await getDocs(paginatedQuery);

      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (T & { id: string })[];

      setData(prev => [...prev, ...newItems]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error('Error loading more:', err);
      setError(err as Error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [baseQuery, enabled, hasMore, isLoadingMore, lastDoc, pageSize]);

  /**
   * Reset pagination to first page
   */
  const reset = useCallback(() => {
    setData([]);
    setLastDoc(null);
    setHasMore(true);
    setError(null);
    fetchInitialPage();
  }, [fetchInitialPage]);

  /**
   * Fetch initial page when query changes
   */
  useEffect(() => {
    fetchInitialPage();
  }, [queryKey]); // Only re-fetch when query actually changes

  const isEmpty = !isLoading && data.length === 0;
  const totalLoaded = data.length;

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    reset,
    isEmpty,
    totalLoaded,
  };
}

/**
 * Hook for infinite scroll behavior
 * Automatically loads more when user scrolls near bottom
 * 
 * @example
 * ```typescript
 * const { data, isLoading, hasMore, isLoadingMore } = usePaginatedCollection(...);
 * const scrollRef = useInfiniteScroll(() => {
 *   if (hasMore && !isLoadingMore) {
 *     loadMore();
 *   }
 * });
 * 
 * return <div ref={scrollRef}>...</div>
 * ```
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  options: { threshold?: number; enabled?: boolean } = {}
) {
  const { threshold = 300, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      // Check if user scrolled near bottom
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceFromBottom < threshold) {
        onLoadMore();
      }
    };

    // Throttle scroll event
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [onLoadMore, threshold, enabled]);
}

