/**
 * @file use-comments.ts
 * @description Hook for managing video comments
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
  increment,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Comment } from '@/lib/comment-types';

export function useComments(videoId: string) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [comments, setComments] = useState<(Comment & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for comments
  useEffect(() => {
    if (!firestore || !videoId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const commentsRef = collection(firestore, 'comments');
    const q = query(
      commentsRef,
      where('videoId', '==', videoId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments: (Comment & { id: string })[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedComments.push({
            id: doc.id,
            videoId: data.videoId,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            content: data.content,
            parentId: data.parentId,
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            isPinned: data.isPinned || false,
            isBestAnswer: data.isBestAnswer || false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            isEdited: data.isEdited || false,
          });
        });
        setComments(fetchedComments);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching comments:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, videoId]);

  /**
   * Add a new comment
   */
  const addComment = useCallback(
    async (content: string, parentId?: string) => {
      if (!firestore || !user || !content.trim()) return null;

      try {
        const commentsRef = collection(firestore, 'comments');
        
        // Build comment data, omitting undefined fields
        const commentData: any = {
          videoId,
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          content: content.trim(),
          parentId: parentId || null,
          upvotes: 0,
          downvotes: 0,
          isPinned: false,
          isBestAnswer: false,
          createdAt: serverTimestamp(),
          isEdited: false,
        };
        
        // Only add userAvatar if it exists
        if (user.photoURL) {
          commentData.userAvatar = user.photoURL;
        }
        
        const docRef = await addDoc(commentsRef, commentData);

        return docRef.id;
      } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    },
    [firestore, user, videoId]
  );

  /**
   * Update a comment
   */
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!firestore || !user) return;

      try {
        const commentRef = doc(firestore, 'comments', commentId);
        await updateDoc(commentRef, {
          content: content.trim(),
          updatedAt: serverTimestamp(),
          isEdited: true,
        });
      } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
      }
    },
    [firestore, user]
  );

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!firestore || !user) return;

      try {
        const commentRef = doc(firestore, 'comments', commentId);
        await deleteDoc(commentRef);
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    },
    [firestore, user]
  );

  /**
   * Vote on a comment
   */
  const voteComment = useCallback(
    async (commentId: string, voteType: 'upvote' | 'downvote') => {
      if (!firestore || !user) return;

      try {
        const voteRef = doc(firestore, 'comment-votes', user.uid, 'votes', commentId);
        const commentRef = doc(firestore, 'comments', commentId);
        
        const voteDoc = await getDoc(voteRef);

        if (voteDoc.exists()) {
          const existingVote = voteDoc.data().type;

          if (existingVote === voteType) {
            // Remove vote
            await deleteDoc(voteRef);
            await updateDoc(commentRef, {
              [voteType === 'upvote' ? 'upvotes' : 'downvotes']: increment(-1),
            });
          } else {
            // Switch vote
            await setDoc(voteRef, { type: voteType });
            await updateDoc(commentRef, {
              [existingVote === 'upvote' ? 'upvotes' : 'downvotes']: increment(-1),
              [voteType === 'upvote' ? 'upvotes' : 'downvotes']: increment(1),
            });
          }
        } else {
          // New vote
          await setDoc(voteRef, { type: voteType });
          await updateDoc(commentRef, {
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: increment(1),
          });
        }
      } catch (error) {
        console.error('Error voting:', error);
        throw error;
      }
    },
    [firestore, user]
  );

  /**
   * Pin a comment (admin/instructor only)
   */
  const pinComment = useCallback(
    async (commentId: string, isPinned: boolean) => {
      if (!firestore) return;

      try {
        const commentRef = doc(firestore, 'comments', commentId);
        await updateDoc(commentRef, { isPinned });
      } catch (error) {
        console.error('Error pinning comment:', error);
        throw error;
      }
    },
    [firestore]
  );

  /**
   * Mark as best answer (instructor only)
   */
  const markBestAnswer = useCallback(
    async (commentId: string, isBestAnswer: boolean) => {
      if (!firestore) return;

      try {
        const commentRef = doc(firestore, 'comments', commentId);
        await updateDoc(commentRef, { isBestAnswer });
      } catch (error) {
        console.error('Error marking best answer:', error);
        throw error;
      }
    },
    [firestore]
  );

  return {
    comments,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
    voteComment,
    pinComment,
    markBestAnswer,
  };
}

