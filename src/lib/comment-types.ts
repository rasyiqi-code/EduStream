/**
 * @file comment-types.ts
 * @description Type definitions for comments and discussion system
 */

import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string; // For replies/threads
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  isBestAnswer: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited: boolean;
}

export interface CommentVote {
  userId: string;
  commentId: string;
  type: 'upvote' | 'downvote';
}

