/**
 * Check Playlists in Database
 * Run: bun scripts/check-playlists.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWsRnos_botb96XjPOuTxCKvBqmjuimwE",
  authDomain: "studio-6945435693-50081.firebaseapp.com",
  projectId: "studio-6945435693-50081",
  storageBucket: "studio-6945435693-50081.appspot.com",
  messagingSenderId: "374721592233",
  appId: "1:374721592233:web:17fb692021aaf38bc562b8",
};

async function checkPlaylists() {
  try {
    // Initialize Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    
    console.log('🔍 Checking playlists collection...\n');
    
    // Get ALL playlists (no orderBy)
    const snapshot = await getDocs(collection(db, 'playlists'));
    
    console.log(`📊 Total playlists: ${snapshot.size}\n`);
    
    if (snapshot.empty) {
      console.log('❌ No playlists found in database!\n');
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📁 Playlist ID: ${doc.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'NO FIELD'}`);
      console.log(`   Video IDs: ${data.videoIds?.length || 0} videos`);
      console.log(`   Author ID: ${data.authorId || 'N/A'}`);
      console.log('');
    });
    
    console.log('✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkPlaylists();

