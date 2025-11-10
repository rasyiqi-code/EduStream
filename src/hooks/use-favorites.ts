'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, onSnapshot, Timestamp } from 'firebase/firestore';

export interface Favorite {
  videoId: string;
  addedAt: Timestamp;
}

export function useFavorites() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !user) {
      setFavorites(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const favoritesRef = collection(firestore, 'users', user.uid, 'favorites');
    
    const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
      const favSet = new Set<string>();
      snapshot.forEach((doc) => {
        favSet.add(doc.id);
      });
      setFavorites(favSet);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user]);

  const addFavorite = async (videoId: string) => {
    if (!firestore || !user) return false;
    
    try {
      const favoriteRef = doc(firestore, 'users', user.uid, 'favorites', videoId);
      await setDoc(favoriteRef, {
        videoId,
        addedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  };

  const removeFavorite = async (videoId: string) => {
    if (!firestore || !user) return false;
    
    try {
      const favoriteRef = doc(firestore, 'users', user.uid, 'favorites', videoId);
      await deleteDoc(favoriteRef);
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  };

  const toggleFavorite = async (videoId: string) => {
    if (favorites.has(videoId)) {
      return await removeFavorite(videoId);
    } else {
      return await addFavorite(videoId);
    }
  };

  const isFavorite = (videoId: string): boolean => {
    return favorites.has(videoId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}

