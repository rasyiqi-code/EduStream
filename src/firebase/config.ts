/**
 * Firebase Configuration
 * 
 * IMPORTANT: For production, set these as environment variables:
 * 1. Copy .env.example to .env.local
 * 2. Fill in your Firebase project credentials
 * 3. Never commit .env.local to version control
 * 
 * The fallback values below are for development only.
 * They should be removed before production deployment.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCWsRnos_botb96XjPOuTxCKvBqmjuimwE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-6945435693-50081.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-6945435693-50081",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-6945435693-50081.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "374721592233",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:374721592233:web:17fb692021aaf38bc562b8",
};

// Validate required config in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Environment variables not set (using fallback values):', missingVars.join(', '));
    console.warn('For production, set these in Vercel: https://vercel.com/docs/environment-variables');
  }
}
