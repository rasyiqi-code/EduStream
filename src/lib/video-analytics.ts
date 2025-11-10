/**
 * @file video-analytics.ts
 * @description Video analytics tracking system for views and watch time
 * 
 * Features:
 * - Track video views
 * - Track watch duration
 * - Debounced updates to Firestore
 * - User session tracking
 */

import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

/**
 * Track a video view
 * Increments the view count for a video
 * 
 * @param firestore - Firestore instance
 * @param videoId - ID of the video
 * @param userId - ID of the user viewing (optional, for unique view tracking)
 */
export async function trackVideoView(
  firestore: Firestore,
  videoId: string,
  userId?: string
): Promise<void> {
  try {
    const videoRef = doc(firestore, 'videos', videoId);
    
    // Increment view count
    await updateDoc(videoRef, {
      views: increment(1),
      lastViewed: new Date()
    });

    // If user is logged in, track in user's view history
    if (userId) {
      const userViewRef = doc(
        firestore,
        'user-analytics',
        userId,
        'views',
        videoId
      );
      
      const userViewDoc = await getDoc(userViewRef);
      
      if (userViewDoc.exists()) {
        // Update existing view
        await updateDoc(userViewRef, {
          viewCount: increment(1),
          lastViewed: new Date()
        });
      } else {
        // Create new view record
        await setDoc(userViewRef, {
          videoId,
          viewCount: 1,
          firstViewed: new Date(),
          lastViewed: new Date()
        });
      }
    }
  } catch (error) {
    console.error('Error tracking video view:', error);
    // Don't throw - analytics should never break the app
  }
}

/**
 * Track watch time for a video
 * Updates the total watch time and percentage watched
 * 
 * @param firestore - Firestore instance
 * @param videoId - ID of the video
 * @param userId - ID of the user
 * @param currentTime - Current playback position in seconds
 * @param duration - Total video duration in seconds
 */
export async function trackWatchTime(
  firestore: Firestore,
  videoId: string,
  userId: string,
  currentTime: number,
  duration: number
): Promise<void> {
  if (!userId) return;

  try {
    const watchRef = doc(
      firestore,
      'user-analytics',
      userId,
      'watch-time',
      videoId
    );

    const percentage = Math.min(Math.round((currentTime / duration) * 100), 100);
    const completed = percentage >= 95;

    const watchDoc = await getDoc(watchRef);
    
    if (watchDoc.exists()) {
      // Update existing watch record
      const existingData = watchDoc.data();
      await updateDoc(watchRef, {
        currentPosition: currentTime,
        percentage,
        completed: completed || existingData.completed,
        lastWatched: new Date(),
        watchCount: increment(1)
      });
    } else {
      // Create new watch record
      await setDoc(watchRef, {
        videoId,
        currentPosition: currentTime,
        percentage,
        completed,
        duration,
        firstWatched: new Date(),
        lastWatched: new Date(),
        watchCount: 1
      });
    }
  } catch (error) {
    console.error('Error tracking watch time:', error);
    // Don't throw - analytics should never break the app
  }
}

/**
 * Get video analytics data
 * Returns view count and other metrics for a video
 * 
 * @param firestore - Firestore instance
 * @param videoId - ID of the video
 * @returns Promise<VideoAnalytics | null>
 */
export async function getVideoAnalytics(
  firestore: Firestore,
  videoId: string
): Promise<{
  views: number;
  lastViewed?: Date;
} | null> {
  try {
    const videoRef = doc(firestore, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);

    if (!videoDoc.exists()) {
      return null;
    }

    const data = videoDoc.data();
    return {
      views: data.views || 0,
      lastViewed: data.lastViewed?.toDate()
    };
  } catch (error) {
    console.error('Error getting video analytics:', error);
    return null;
  }
}

/**
 * Get user's watch progress for a video
 * Returns the last position and completion status
 * 
 * @param firestore - Firestore instance
 * @param userId - ID of the user
 * @param videoId - ID of the video
 * @returns Promise<WatchProgress | null>
 */
export async function getUserWatchProgress(
  firestore: Firestore,
  userId: string,
  videoId: string
): Promise<{
  currentPosition: number;
  percentage: number;
  completed: boolean;
  lastWatched?: Date;
} | null> {
  if (!userId) return null;

  try {
    const watchRef = doc(
      firestore,
      'user-analytics',
      userId,
      'watch-time',
      videoId
    );
    const watchDoc = await getDoc(watchRef);

    if (!watchDoc.exists()) {
      return null;
    }

    const data = watchDoc.data();
    return {
      currentPosition: data.currentPosition || 0,
      percentage: data.percentage || 0,
      completed: data.completed || false,
      lastWatched: data.lastWatched?.toDate()
    };
  } catch (error) {
    console.error('Error getting watch progress:', error);
    return null;
  }
}

/**
 * Debounced watch time tracker
 * Use this to avoid too many Firestore writes
 */
export class WatchTimeTracker {
  private firestore: Firestore;
  private videoId: string;
  private userId: string;
  private duration: number;
  private lastSavedTime: number = 0;
  private saveInterval: number = 30000; // Save every 30 seconds
  private timer: NodeJS.Timeout | null = null;

  constructor(
    firestore: Firestore,
    videoId: string,
    userId: string,
    duration: number
  ) {
    this.firestore = firestore;
    this.videoId = videoId;
    this.userId = userId;
    this.duration = duration;
  }

  /**
   * Update current position
   * Will save to Firestore if enough time has passed
   */
  update(currentTime: number): void {
    const now = Date.now();
    
    // Save if 30 seconds have passed since last save
    if (now - this.lastSavedTime >= this.saveInterval) {
      this.save(currentTime);
      this.lastSavedTime = now;
    }
    
    // Also schedule a save for when user pauses/leaves
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    this.timer = setTimeout(() => {
      this.save(currentTime);
    }, 5000); // Save 5 seconds after last update
  }

  /**
   * Force save current position
   */
  async save(currentTime: number): Promise<void> {
    await trackWatchTime(
      this.firestore,
      this.videoId,
      this.userId,
      currentTime,
      this.duration
    );
  }

  /**
   * Clean up timers
   */
  destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

