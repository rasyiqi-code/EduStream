export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string; // For MP4
  youtubeId?: string; // For YouTube embeds
  channel: string;
  channelAvatarUrl: string;
  views: string;
  uploadedAt: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  videoIds: string[];
};
