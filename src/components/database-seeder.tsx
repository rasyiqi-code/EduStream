"use client";

import { useEffect, useState } from 'react';
import { collection, doc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { demoVideos, demoPlaylists } from '@/lib/seed-data';

// A simple flag in localStorage to ensure we only seed once per client.
const SEEDING_FLAG = 'firestore_seeded_v1';

export function DatabaseSeeder() {
  const firestore = useFirestore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!firestore || isDone || isSeeding) return;

    const hasBeenSeeded = localStorage.getItem(SEEDING_FLAG);
    if (hasBeenSeeded) {
      setIsDone(true);
      return;
    }

    const seedDatabase = async () => {
      setIsSeeding(true);
      console.log("Checking if database needs seeding...");

      const videosCollection = collection(firestore, 'videos');
      const videosSnapshot = await getDocs(videosCollection);

      if (!videosSnapshot.empty) {
        console.log("Database already contains data. Seeding skipped.");
        localStorage.setItem(SEEDING_FLAG, 'true');
        setIsDone(true);
        setIsSeeding(false);
        return;
      }

      console.log("Database is empty. Seeding demo data...");
      const batch = writeBatch(firestore);

      // Seed videos
      demoVideos.forEach((video) => {
        const videoRef = doc(firestore, 'videos', video.id);
        const videoData = { ...video, uploadDate: serverTimestamp() };
        // We need to remove the id from the data object itself
        delete (videoData as any).id;
        batch.set(videoRef, videoData);
      });

      // Seed playlists
      demoPlaylists.forEach((playlist) => {
        const playlistRef = doc(firestore, 'playlists', playlist.id);
        batch.set(playlistRef, playlist);
      });

      try {
        await batch.commit();
        console.log("Demo data successfully seeded to Firestore.");
        localStorage.setItem(SEEDING_FLAG, 'true');
      } catch (error) {
        console.error("Error seeding database:", error);
      } finally {
        setIsDone(true);
        setIsSeeding(false);
      }
    };

    seedDatabase();

  }, [firestore, isDone, isSeeding]);

  // This component renders nothing. It's only for the seeding effect.
  return null;
}
