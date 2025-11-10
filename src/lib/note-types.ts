/**
 * @file note-types.ts
 * @description Type definitions for notes system
 */

import { Timestamp } from 'firebase/firestore';

export interface Note {
  id: string;
  userId: string;
  videoId: string;
  courseId?: string;
  content: string; // Rich text HTML
  timestamp?: number; // Video position in seconds (optional)
  isHighlighted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NoteWithVideoInfo extends Note {
  videoTitle?: string;
  courseName?: string;
}

