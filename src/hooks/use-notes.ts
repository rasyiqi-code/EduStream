/**
 * @file use-notes.ts
 * @description Hook for managing video notes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Note } from '@/lib/note-types';

interface UseNotesOptions {
  videoId?: string;
  courseId?: string;
}

export function useNotes(options: UseNotesOptions = {}) {
  const { videoId, courseId } = options;
  const firestore = useFirestore();
  const { user } = useUser();
  const [notes, setNotes] = useState<(Note & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for notes
  useEffect(() => {
    if (!firestore || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const notesRef = collection(firestore, 'user-notes', user.uid, 'notes');
    let q = query(notesRef, orderBy('createdAt', 'desc'));

    // Filter by video or course if specified
    if (videoId) {
      q = query(notesRef, where('videoId', '==', videoId), orderBy('createdAt', 'desc'));
    } else if (courseId) {
      q = query(notesRef, where('courseId', '==', courseId), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotes: (Note & { id: string })[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedNotes.push({
            id: doc.id,
            userId: data.userId,
            videoId: data.videoId,
            courseId: data.courseId,
            content: data.content,
            timestamp: data.timestamp,
            isHighlighted: data.isHighlighted || false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setNotes(fetchedNotes);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching notes:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, user, videoId, courseId]);

  /**
   * Create a new note
   */
  const createNote = useCallback(
    async (noteData: {
      videoId: string;
      courseId?: string;
      content: string;
      timestamp?: number;
      isHighlighted?: boolean;
    }) => {
      if (!firestore || !user) return null;

      try {
        const notesRef = collection(firestore, 'user-notes', user.uid, 'notes');
        
        // Build note data, omitting undefined fields
        const noteDocData: any = {
          userId: user.uid,
          videoId: noteData.videoId,
          content: noteData.content,
          isHighlighted: noteData.isHighlighted || false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        // Only add courseId if it's defined
        if (noteData.courseId) {
          noteDocData.courseId = noteData.courseId;
        }
        
        // Only add timestamp if it's defined
        if (noteData.timestamp !== undefined) {
          noteDocData.timestamp = noteData.timestamp;
        }
        
        const docRef = await addDoc(notesRef, noteDocData);

        return docRef.id;
      } catch (error) {
        console.error('Error creating note:', error);
        throw error;
      }
    },
    [firestore, user]
  );

  /**
   * Update an existing note
   */
  const updateNote = useCallback(
    async (noteId: string, updates: Partial<Note>) => {
      if (!firestore || !user) return;

      try {
        const noteRef = doc(firestore, 'user-notes', user.uid, 'notes', noteId);
        
        // Remove undefined fields from updates
        const cleanedUpdates: any = { updatedAt: serverTimestamp() };
        Object.keys(updates).forEach((key) => {
          const value = (updates as any)[key];
          if (value !== undefined) {
            cleanedUpdates[key] = value;
          }
        });
        
        await updateDoc(noteRef, cleanedUpdates);
      } catch (error) {
        console.error('Error updating note:', error);
        throw error;
      }
    },
    [firestore, user]
  );

  /**
   * Delete a note
   */
  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!firestore || !user) return;

      try {
        const noteRef = doc(firestore, 'user-notes', user.uid, 'notes', noteId);
        await deleteDoc(noteRef);
      } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
      }
    },
    [firestore, user]
  );

  /**
   * Toggle highlight on a note
   */
  const toggleHighlight = useCallback(
    async (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      await updateNote(noteId, { isHighlighted: !note.isHighlighted });
    },
    [notes, updateNote]
  );

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    toggleHighlight,
  };
}

