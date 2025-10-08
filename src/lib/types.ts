import { FieldValue } from "firebase/firestore";

export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string; // For MP4
  youtubeId?: string; // For YouTube embeds
  channel: string;
  channelAvatarUrl: string;
  uploadDate: FieldValue;
  duration: number;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  videoIds: string[];
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};
