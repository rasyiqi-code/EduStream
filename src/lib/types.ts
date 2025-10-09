import { FieldValue, Timestamp } from "firebase/firestore";

export type UserRole = 'admin' | 'instructor' | 'student';

export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string; // For MP4
  youtubeId?: string; // For YouTube embeds
  channel: string;
  channelAvatarUrl: string;
  uploadDate: Timestamp;
  duration: number;
  authorId?: string;
  authorRole?: UserRole; // To track who uploaded
};

export type Playlist = {
  id:string;
  name: string;
  description: string;
  videoIds: string[];
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole; // admin, instructor, student
};
