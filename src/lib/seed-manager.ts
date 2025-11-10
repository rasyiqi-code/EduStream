/**
 * Seed Data Manager
 * Better approach for managing demo/seed data
 */

import { Firestore, collection, getDocs, writeBatch, doc, query, limit, serverTimestamp } from 'firebase/firestore';
import { demoVideos, demoPlaylists } from './seed-data';

const SEEDING_FLAG_KEY = 'firestore_seeded_v3';
const ADMIN_SEEDING_FLAG = 'admin_manual_seed';

export class SeedManager {
  private firestore: Firestore;

  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  /**
   * Check if database has been seeded
   */
  async isSeed(): Promise<boolean> {
    // Check localStorage first
    const localFlag = localStorage.getItem(SEEDING_FLAG_KEY);
    if (localFlag === 'true') return true;

    // Check if videos exist in Firestore
    try {
      const videosSnapshot = await getDocs(query(collection(this.firestore, 'videos'), limit(1)));
      const hasData = !videosSnapshot.empty;
      
      if (hasData) {
        localStorage.setItem(SEEDING_FLAG_KEY, 'true');
      }
      
      return hasData;
    } catch (error) {
      console.error('Error checking seed status:', error);
      return false;
    }
  }

  /**
   * Seed database with demo data
   */
  async seedDatabase(): Promise<boolean> {
    try {
      const isSeeded = await this.isSeeded();
      if (isSeeded) {
        console.log('Database already seeded');
        return true;
      }

      console.log('Seeding database with demo data...');
      
      const batch = writeBatch(this.firestore);

      // Add videos
      demoVideos.forEach((video) => {
        const videoRef = doc(this.firestore, 'videos', video.id);
        const videoData = { 
          ...video, 
          uploadDate: serverTimestamp(),
          authorId: 'system',
          authorRole: 'admin' 
        };
        delete (videoData as any).id;
        batch.set(videoRef, videoData);
      });

      // Add playlists
      demoPlaylists.forEach((playlist) => {
        const playlistRef = doc(this.firestore, 'playlists', playlist.id);
        const playlistData = { ...playlist };
        delete (playlistData as any).id;
        batch.set(playlistRef, playlistData);
      });

      await batch.commit();
      
      // Set flags
      localStorage.setItem(SEEDING_FLAG_KEY, 'true');
      
      console.log('✅ Database seeded successfully');
      return true;
    } catch (error) {
      console.error('❌ Seed error:', error);
      return false;
    }
  }

  /**
   * Clear all data (admin only - dangerous!)
   */
  async clearAllData(): Promise<boolean> {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will delete ALL videos and playlists! Are you absolutely sure?'
    );
    
    if (!confirmed) return false;

    try {
      // Delete all videos
      const videosSnapshot = await getDocs(collection(this.firestore, 'videos'));
      const batch = writeBatch(this.firestore);
      
      videosSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete all playlists
      const playlistsSnapshot = await getDocs(collection(this.firestore, 'playlists'));
      playlistsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      // Clear flag
      localStorage.removeItem(SEEDING_FLAG_KEY);
      
      console.log('✅ All data cleared');
      return true;
    } catch (error) {
      console.error('❌ Clear data error:', error);
      return false;
    }
  }

  /**
   * Re-seed database (clear + seed)
   */
  async reseedDatabase(): Promise<boolean> {
    const cleared = await this.clearAllData();
    if (!cleared) return false;
    
    return await this.seedDatabase();
  }
}

