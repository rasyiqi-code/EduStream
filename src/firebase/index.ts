'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from 'firebase/firestore'

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
    
    // Enable offline persistence for better performance
    enableFirestoreOfflinePersistence(sdks.firestore);
    
    return sdks;
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

/**
 * Enable Firestore offline persistence for better performance
 * Uses multi-tab persistence in production, single-tab in development
 */
function enableFirestoreOfflinePersistence(firestore: ReturnType<typeof getFirestore>) {
  if (typeof window === 'undefined') return; // Server-side check
  
  const persistenceFunction = process.env.NODE_ENV === 'production' 
    ? enableMultiTabIndexedDbPersistence 
    : enableIndexedDbPersistence;
  
  persistenceFunction(firestore).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // Browser doesn't support persistence
      console.warn('Firestore persistence not supported by browser');
    } else {
      console.error('Firestore persistence error:', err);
    }
  });
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
