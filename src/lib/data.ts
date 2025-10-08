import type { Playlist } from '@/lib/types';

// This data is now stored in Firestore.
// This file is kept for the playlist data, which is still static.
// The videos array has been removed.

export const playlists: Playlist[] = [
  {
    id: 'cs-101',
    name: 'Computer Science 101',
    description: 'Fundamental concepts of computer science, from algorithms to data structures.',
    thumbnailUrl: 'https://picsum.photos/seed/cs-playlist/320/180',
    videoIds: ['1', '2'], // These IDs will need to match Firestore document IDs
  },
  {
    id: 'history-of-art',
    name: 'History of Art',
    description: 'A journey through the most significant art movements in history.',
    thumbnailUrl: 'https://picsum.photos/seed/art-playlist/320/180',
    videoIds: ['3'], // These IDs will need to match Firestore document IDs
  },
  {
    id: 'ancient-civilizations',
    name: 'Ancient Civilizations',
    description: 'Explore the rise and fall of great empires of the ancient world.',
    thumbnailUrl: 'https://picsum.photos/seed/history-playlist/320/180',
    videoIds: ['4'], // These IDs will need to match Firestore document IDs
  },
];
