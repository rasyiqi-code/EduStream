/**
 * Seed Playlists Script
 * Run: bun scripts/seed-playlists.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs, query, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWsRnos_botb96XjPOuTxCKvBqmjuimwE",
  authDomain: "studio-6945435693-50081.firebaseapp.com",
  projectId: "studio-6945435693-50081",
  storageBucket: "studio-6945435693-50081.appspot.com",
  messagingSenderId: "374721592233",
  appId: "1:374721592233:web:17fb692021aaf38bc562b8",
};

async function seedPlaylists() {
  try {
    // Initialize Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    
    console.log('🔍 Checking existing playlists...');
    
    // Check if playlists already exist
    const playlistsSnapshot = await getDocs(query(collection(db, 'playlists'), limit(1)));
    if (!playlistsSnapshot.empty) {
      console.log('⚠️  Playlists already exist. Skipping seed.');
      return;
    }
    
    console.log('🔍 Fetching existing videos...');
    
    // Get existing videos to reference
    const videosSnapshot = await getDocs(query(collection(db, 'videos'), limit(10)));
    const videoIds = videosSnapshot.docs.map(doc => doc.id);
    
    if (videoIds.length === 0) {
      console.error('❌ No videos found. Please add videos first.');
      process.exit(1);
    }
    
    console.log(`✅ Found ${videoIds.length} videos`);
    console.log('📝 Creating playlists...');
    
    const batch = writeBatch(db);
    const now = new Date();
    
    const playlists = [
      {
        id: 'kalkulus1-full',
        name: 'Kalkulus 1 - Fundamental',
        description: 'Belajar konsep dasar kalkulus dari limit hingga integral. Cocok untuk pemula yang ingin memahami fondasi matematika tingkat lanjut.',
        videoIds: videoIds.slice(0, Math.min(4, videoIds.length)),
        authorId: 'demo-instructor',
        createdAt: now,
        updatedAt: now,
        thumbnailUrl: 'https://picsum.photos/seed/kalkulus1/640/360',
        category: 'Matematika',
        level: 'Menengah',
        status: 'published',
        rating: 4.8,
        ratingCount: 125,
        isFeatured: true
      },
      {
        id: 'aljabar-linear',
        name: 'Aljabar Linear',
        description: 'Matriks, vektor, dan transformasi linear. Dasar untuk machine learning dan computer graphics.',
        videoIds: videoIds.slice(0, Math.min(3, videoIds.length)),
        authorId: 'demo-instructor',
        createdAt: now,
        updatedAt: now,
        thumbnailUrl: 'https://picsum.photos/seed/aljabar/640/360',
        category: 'Matematika',
        level: 'Lanjutan',
        status: 'published',
        rating: 4.6,
        ratingCount: 89,
        isFeatured: false
      },
      {
        id: 'fisika-dasar',
        name: 'Fisika Dasar',
        description: 'Mekanika, termodinamika, dan gelombang. Cocok untuk siswa SMA dan mahasiswa tahun pertama.',
        videoIds: videoIds.slice(0, Math.min(5, videoIds.length)),
        authorId: 'demo-instructor',
        createdAt: now,
        updatedAt: now,
        thumbnailUrl: 'https://picsum.photos/seed/fisika/640/360',
        category: 'Fisika',
        level: 'Pemula',
        status: 'published',
        rating: 4.9,
        ratingCount: 203,
        isFeatured: true
      },
      {
        id: 'pemrograman-python',
        name: 'Python untuk Pemula',
        description: 'Belajar pemrograman Python dari nol. Mulai dari syntax dasar hingga OOP.',
        videoIds: videoIds.slice(0, Math.min(6, videoIds.length)),
        authorId: 'demo-instructor',
        createdAt: now,
        updatedAt: now,
        thumbnailUrl: 'https://picsum.photos/seed/python/640/360',
        category: 'Pemrograman',
        level: 'Pemula',
        status: 'published',
        rating: 4.7,
        ratingCount: 156,
        isFeatured: true
      },
      {
        id: 'kimia-organik',
        name: 'Kimia Organik',
        description: 'Struktur molekul, reaksi organik, dan mekanisme reaksi.',
        videoIds: videoIds.slice(0, Math.min(4, videoIds.length)),
        authorId: 'demo-instructor',
        createdAt: now,
        updatedAt: now,
        thumbnailUrl: 'https://picsum.photos/seed/kimia/640/360',
        category: 'Kimia',
        level: 'Menengah',
        status: 'published',
        rating: 4.5,
        ratingCount: 78,
        isFeatured: false
      },
      {
        id: 'biologi-sel',
        name: 'Biologi Sel',
        description: 'Struktur sel, organela, dan proses seluler. Fundamental untuk biologi modern.',
        videoIds: videoIds.slice(0, Math.min(3, videoIds.length)),
        authorId: 'demo-instructor',
        createdAt: now,
        updatedAt: now,
        thumbnailUrl: 'https://picsum.photos/seed/biologi/640/360',
        category: 'Biologi',
        level: 'Menengah',
        status: 'published',
        rating: 4.8,
        ratingCount: 134,
        isFeatured: false
      }
    ];
    
    // Add playlists to batch
    playlists.forEach(playlist => {
      const docRef = doc(collection(db, 'playlists'), playlist.id);
      batch.set(docRef, playlist);
    });
    
    console.log('💾 Committing to Firestore...');
    
    // Commit batch
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${playlists.length} playlists!`);
    console.log('🎉 Done! Check your dashboard at /dashboard');
    
  } catch (error) {
    console.error('❌ Error seeding playlists:', error);
    process.exit(1);
  }
}

// Run the seed function
seedPlaylists();

