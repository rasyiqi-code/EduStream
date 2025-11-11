'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  persistentSingleTabManager
} from 'firebase/firestore'

// Firebase initialization with fallback for development
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;

    // For development, use config directly to avoid initialization issues
    if (process.env.NODE_ENV === "development") {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      // For production, try Firebase App Hosting first, then fallback to config
      try {
        firebaseApp = initializeApp();
      } catch (e) {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
        firebaseApp = initializeApp(firebaseConfig);
      }
    }

    const sdks = getSdks(firebaseApp);
    
    return sdks;
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  // Initialize Firestore with persistent cache
  const firestore = initializeFirestoreWithCache(firebaseApp);
  
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore
  };
}

/**
 * Initialize Firestore with persistent local cache for better performance
 * Uses multi-tab persistence in production, single-tab in development
 */
function initializeFirestoreWithCache(firebaseApp: FirebaseApp) {
  if (typeof window === 'undefined') {
    // Server-side: return basic firestore without cache
    return getFirestore(firebaseApp);
  }
  
  try {
    // Use the new cache configuration API
    const tabManager = process.env.NODE_ENV === 'production' 
      ? persistentMultipleTabManager()
      : persistentSingleTabManager({});
    
    const cacheSettings = {
      localCache: persistentLocalCache({ tabManager })
    };
    
    // Try to initialize with cache configuration
    return initializeFirestore(firebaseApp, cacheSettings);
  } catch (error: any) {
    // If already initialized or other errors, fallback to getFirestore
    // This will return the already initialized instance or initialize with defaults
    console.warn('Failed to initialize Firestore with cache, using default:', error);
    return getFirestore(firebaseApp);
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
