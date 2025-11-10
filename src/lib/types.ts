import { FieldValue, Timestamp } from "firebase/firestore";

export type UserRole = 'admin' | 'instructor' | 'student';

/**
 * Video = Episode/Chapter in a Course
 * Every video MUST belong to a playlist (course)
 */
export type Video = {
  id: string;
  title: string; // Episode/Chapter title
  description: string;
  thumbnailUrl: string;
  videoUrl?: string; // For MP4
  youtubeId?: string; // For YouTube embeds
  channel: string; // Instructor name
  channelAvatarUrl: string;
  uploadDate: Timestamp;
  duration: number;
  playlistId: string; // REQUIRED - Must belong to a course
  episodeNumber?: number; // Order in the course (1, 2, 3...)
  authorId: string; // REQUIRED - Who created this
  authorRole: UserRole; // REQUIRED - Role when created
  category?: string; // e.g., "Matematika", "Fisika", "Biologi"
  level?: 'beginner' | 'intermediate' | 'advanced';
  views?: number; // View count for sorting/popularity
};

/**
 * Playlist = Course/Materi Package
 * Contains multiple videos (episodes/chapters)
 */
export type Playlist = {
  id: string;
  name: string; // Course name (e.g., "Aljabar Dasar")
  description: string;
  thumbnailUrl?: string;
  videoIds: string[]; // List of episode IDs in order
  authorId: string; // REQUIRED - Instructor who created
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  totalDuration?: number; // Total duration of all videos
  episodeCount?: number; // Number of videos/episodes
  category?: string; // e.g., "Matematika", "Fisika", "Biologi"
  level?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'draft' | 'published' | 'archived'; // Course status
  rating?: number; // Average rating (1-5)
  ratingCount?: number; // Number of ratings
  isFeatured?: boolean; // Featured course
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole; // admin, instructor, student
};

// Re-export quiz types
export type { Quiz, QuizQuestion, QuizAttempt, QuizProgress, QuestionType } from './quiz-types';
