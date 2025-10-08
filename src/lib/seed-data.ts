import type { Video, Playlist } from '@/lib/types';
import { serverTimestamp } from 'firebase/firestore';

// Note: The 'id' properties will be used as the document IDs in Firestore.

export const demoVideos: (Omit<Video, 'uploadDate' | 'id'> & {id: string})[] = [
  {
    id: 'intro-to-algebra',
    title: 'Introduction to Algebra',
    description: 'Learn the basics of algebra, including variables, expressions, and equations. This video is perfect for beginners.',
    youtubeId: 'zp4B_1j2w2I', // A relevant video from Khan Academy
    thumbnailUrl: 'https://img.youtube.com/vi/zp4B_1j2w2I/0.jpg',
    channel: 'Khan Academy',
    channelAvatarUrl: 'https://picsum.photos/seed/ka/48/48',
    duration: 549,
  },
  {
    id: 'what-is-an-algorithm',
    title: 'What Is an Algorithm?',
    description: 'An overview of what algorithms are and why they are fundamental to computer science and programming.',
    youtubeId: '6hfOvs8pY1k', // A relevant video 
    thumbnailUrl: 'https://img.youtube.com/vi/6hfOvs8pY1k/0.jpg',
    channel: 'CrashCourse',
    channelAvatarUrl: 'https://picsum.photos/seed/cc/48/48',
    duration: 689,
  },
  {
    id: 'renaissance-art',
    title: 'The Renaissance - Overview',
    description: 'A brief overview of the key characteristics and major artists of the Italian Renaissance.',
    youtubeId: '2d2d93-02B0', // A placeholder video, using a valid ID format
    thumbnailUrl: 'https://img.youtube.com/vi/2d2d93-02B0/0.jpg',
    channel: 'ArtExplorers',
    channelAvatarUrl: 'https://picsum.photos/seed/ae/48/48',
    duration: 832,
  },
  {
    id: 'ancient-rome',
    title: 'History of Ancient Rome',
    description: 'Explore the rise and fall of one of the most influential empires in world history.',
    youtubeId: '3-Uh8R6r-QI', // A placeholder video
    thumbnailUrl: 'https://img.youtube.com/vi/3-Uh8R6r-QI/0.jpg',
    channel: 'HistoryUncovered',
    channelAvatarUrl: 'https://picsum.photos/seed/hu/48/48',
    duration: 1250,
  }
];

export const demoPlaylists: Playlist[] = [
  {
    id: 'cs-101',
    name: 'Computer Science 101',
    description: 'Fundamental concepts of computer science, from algorithms to data structures.',
    videoIds: ['intro-to-algebra', 'what-is-an-algorithm'],
  },
  {
    id: 'history-of-art',
    name: 'History of Art',
    description: 'A journey through the most significant art movements in history.',
    videoIds: ['renaissance-art'],
  },
  {
    id: 'ancient-civilizations',
    name: 'Ancient Civilizations',
    description: 'Explore the rise and fall of great empires of the ancient world.',
    videoIds: ['ancient-rome'],
  },
];
