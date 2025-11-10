/**
 * Migration: Add timestamps to existing playlists
 * Run: bun scripts/migrate-playlists-timestamps.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWsRnos_botb96XjPOuTxCKvBqmjuimwE",
  authDomain: "studio-6945435693-50081.firebaseapp.com",
  projectId: "studio-6945435693-50081",
  storageBucket: "studio-6945435693-50081.appspot.com",
  messagingSenderId: "374721592233",
  appId: "1:374721592233:web:17fb692021aaf38bc562b8",
};

async function migratePlaylistTimestamps() {
  try {
    // Initialize Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    
    console.log('🔍 Fetching all playlists...\n');
    
    const snapshot = await getDocs(collection(db, 'playlists'));
    
    if (snapshot.empty) {
      console.log('⚠️  No playlists found.');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} playlists\n`);
    
    const batch = writeBatch(db);
    const now = new Date();
    let updateCount = 0;
    
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      
      // Check if timestamps are missing
      if (!data.createdAt || !data.updatedAt) {
        console.log(`📝 Updating playlist: ${data.name || docSnapshot.id}`);
        
        batch.update(doc(db, 'playlists', docSnapshot.id), {
          createdAt: data.createdAt || now,
          updatedAt: data.updatedAt || now,
        });
        
        updateCount++;
      } else {
        console.log(`✅ Playlist already has timestamps: ${data.name || docSnapshot.id}`);
      }
    });
    
    if (updateCount === 0) {
      console.log('\n✅ All playlists already have timestamps!');
      return;
    }
    
    console.log(`\n💾 Updating ${updateCount} playlists...`);
    await batch.commit();
    
    console.log('✅ Migration complete!');
    console.log('🔄 Refresh your dashboard to see the playlists');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migratePlaylistTimestamps();

