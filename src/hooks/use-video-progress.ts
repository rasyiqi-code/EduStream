/**
 * @file use-video-progress.ts
 * @description Hook for tracking and managing video watch progress
 * 
 * Features:
 * - Auto-save position every 5 seconds
 * - Resume from last position
 * - Track completion percentage
 * - Mark as completed at 95%+
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

export interface VideoProgress {
  videoId: string;
  userId: string;
  lastPosition: number; // seconds
  duration: number; // total seconds
  percentage: number; // 0-100
  completed: boolean;
  lastWatched: Date;
  watchCount: number;
}

interface UseVideoProgressOptions {
  videoId: string;
  duration: number;
  onSave?: (progress: VideoProgress) => void;
}

/**
 * Hook to track video watch progress
 * 
 * @example
 * ```tsx
 * const { 
 *   currentPosition, 
 *   progress, 
 *   updatePosition, 
 *   resumePosition 
 * } = useVideoProgress({ videoId, duration });
 * ```
 */
export function useVideoProgress({ 
  videoId, 
  duration,
  onSave 
}: UseVideoProgressOptions) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentPosition, setCurrentPosition] = useState(0);
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumePosition, setResumePosition] = useState<number | null>(null);
  
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPositionRef = useRef(0);

  /**
   * Load existing progress from Firestore
   */
  useEffect(() => {
    async function loadProgress() {
      if (!firestore || !user || !videoId) {
        setIsLoading(false);
        return;
      }

      try {
        const progressRef = doc(
          firestore,
          'user-progress',
          user.uid,
          'videos',
          videoId
        );
        
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
          const data = progressDoc.data();
          const progressData: VideoProgress = {
            videoId,
            userId: user.uid,
            lastPosition: data.lastPosition || 0,
            duration: data.duration || duration,
            percentage: data.percentage || 0,
            completed: data.completed || false,
            lastWatched: data.lastWatched?.toDate() || new Date(),
            watchCount: data.watchCount || 1,
          };
          
          setProgress(progressData);
          
          // Set resume position if not completed and progress > 5%
          if (!progressData.completed && progressData.percentage > 5) {
            setResumePosition(progressData.lastPosition);
          }
        }
      } catch (error) {
        console.error('Error loading video progress:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProgress();
  }, [firestore, user, videoId, duration]);

  /**
   * Save progress to Firestore
   */
  const saveProgress = useCallback(async (position: number) => {
    if (!firestore || !user || !videoId || !duration) return;

    // Don't save if position hasn't changed significantly (< 2 seconds)
    if (Math.abs(position - lastSavedPositionRef.current) < 2) return;

    try {
      const percentage = Math.min(Math.round((position / duration) * 100), 100);
      const completed = percentage >= 95;

      const progressRef = doc(
        firestore,
        'user-progress',
        user.uid,
        'videos',
        videoId
      );

      const progressDoc = await getDoc(progressRef);
      
      const progressData: Partial<VideoProgress> = {
        videoId,
        userId: user.uid,
        lastPosition: position,
        duration,
        percentage,
        completed: completed || progressDoc.exists() && progressDoc.data()?.completed,
        lastWatched: new Date(),
        watchCount: progressDoc.exists() ? (progressDoc.data()?.watchCount || 0) + 1 : 1,
      };

      if (progressDoc.exists()) {
        await updateDoc(progressRef, {
          ...progressData,
          lastWatched: serverTimestamp(),
        });
      } else {
        await setDoc(progressRef, {
          ...progressData,
          lastWatched: serverTimestamp(),
        });
      }

      setProgress(progressData as VideoProgress);
      lastSavedPositionRef.current = position;

      // Call callback if provided
      if (onSave) {
        onSave(progressData as VideoProgress);
      }
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  }, [firestore, user, videoId, duration, onSave]);

  /**
   * Update current position and schedule save
   */
  const updatePosition = useCallback((position: number) => {
    setCurrentPosition(position);

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Schedule save after 5 seconds of inactivity
    saveTimerRef.current = setTimeout(() => {
      saveProgress(position);
    }, 5000);
  }, [saveProgress]);

  /**
   * Force save current position
   */
  const forceSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveProgress(currentPosition);
  }, [currentPosition, saveProgress]);

  /**
   * Mark video as completed manually
   */
  const markAsCompleted = useCallback(async () => {
    if (!firestore || !user || !videoId) return;

    try {
      const progressRef = doc(
        firestore,
        'user-progress',
        user.uid,
        'videos',
        videoId
      );

      await updateDoc(progressRef, {
        completed: true,
        percentage: 100,
        lastWatched: serverTimestamp(),
      });

      setProgress((prev) => prev ? { ...prev, completed: true, percentage: 100 } : null);
    } catch (error) {
      console.error('Error marking video as completed:', error);
    }
  }, [firestore, user, videoId]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Save progress on unmount
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (currentPosition > 0) {
        saveProgress(currentPosition);
      }
    };
  }, [currentPosition, saveProgress]);

  return {
    currentPosition,
    progress,
    isLoading,
    resumePosition,
    updatePosition,
    forceSave,
    markAsCompleted,
    percentage: progress?.percentage || 0,
    completed: progress?.completed || false,
  };
}

/**
 * Hook to get user's continue watching videos
 */
export function useContinueWatching(limit = 10) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [videos, setVideos] = useState<VideoProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContinueWatching() {
      if (!firestore || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const { collection, query, where, orderBy, limit: firestoreLimit, getDocs } = await import('firebase/firestore');
        
        const progressRef = collection(firestore, 'user-progress', user.uid, 'videos');
        const q = query(
          progressRef,
          where('completed', '==', false),
          where('percentage', '>', 5),
          orderBy('lastWatched', 'desc'),
          firestoreLimit(limit)
        );

        const snapshot = await getDocs(q);
        const progressData = snapshot.docs.map(doc => ({
          ...doc.data(),
          lastWatched: doc.data().lastWatched?.toDate() || new Date(),
        })) as VideoProgress[];

        setVideos(progressData);
      } catch (error) {
        console.error('Error loading continue watching:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadContinueWatching();
  }, [firestore, user, limit]);

  return { videos, isLoading };
}

