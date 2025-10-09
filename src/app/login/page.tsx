'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Film } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { demoVideos, demoPlaylists } from '@/lib/seed-data';

const SEEDING_FLAG = 'firestore_seeded_v2';

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-67.7 67.7C334.6 114.6 295.2 96 248 96c-88.8 0-160.1 71.1-160.1 160s71.3 160 160.1 160c97.4 0 140.2-69.1 144.9-104.4H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
  );
}


export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // After successful sign-in, the useEffect will handle the rest.
    } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
            console.error("Sign-in error:", error);
            toast({
                variant: "destructive",
                title: "Sign-in Failed",
                description: error.message || "An unexpected error occurred during sign-in.",
            });
        }
    }
  };
  
  const seedDatabase = useCallback(async () => {
      if (!firestore) return;
      const hasBeenSeeded = localStorage.getItem(SEEDING_FLAG);
      if (hasBeenSeeded === 'true') return;

      console.log("Checking if database needs seeding...");
      const videosCollection = collection(firestore, 'videos');
      const videosSnapshot = await getDocs(videosCollection);

      if (!videosSnapshot.empty) {
        console.log("Database already contains data. Seeding skipped.");
        localStorage.setItem(SEEDING_FLAG, 'true');
        return;
      }

      console.log("Database is empty. Seeding demo data...");
      const batch = writeBatch(firestore);

      demoVideos.forEach((video) => {
        const videoRef = doc(firestore, 'videos', video.id);
        const videoData = { ...video, uploadDate: serverTimestamp() };
        delete (videoData as any).id;
        batch.set(videoRef, videoData);
      });

      demoPlaylists.forEach((playlist) => {
        const playlistRef = doc(firestore, 'playlists', playlist.id);
        const playlistData = { ...playlist };
        delete (playlistData as any).id;
        batch.set(playlistRef, playlistData);
      });

      try {
        await batch.commit();
        console.log("Demo data successfully seeded to Firestore.");
        localStorage.setItem(SEEDING_FLAG, 'true');
      } catch (error) {
        console.error("Error seeding database:", error);
         toast({
            variant: "destructive",
            title: "Database Seeding Failed",
            description: "Could not add demo data. Check console for errors.",
        });
      }
    }, [firestore, toast]);


  const updateUserProfile = useCallback(async (user: User) => {
    if (!firestore || !user) return;

    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        // User already has a profile, no need to set role again.
        return;
    }

    // New user, determine role
    const usersCollectionRef = collection(firestore, 'users');
    const existingUsers = await getDocs(usersCollectionRef);

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: existingUsers.empty ? 'admin' : 'student',
    };
    
    // The FirestorePermissionError will be emitted by this non-blocking function
    setDocumentNonBlocking(userDocRef, userProfile, { merge: true });
  }, [firestore]);


  useEffect(() => {
    // When user object is available after sign-in, update profile, seed DB, and redirect.
    if (user && firestore) {
      updateUserProfile(user).then(() => {
        seedDatabase().then(() => {
            router.push('/');
        });
      });
    }
  }, [user, firestore, router, updateUserProfile, seedDatabase]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <p>Setting up your account and redirecting...</p>
            </div>
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Film className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to EduStream</CardTitle>
          <CardDescription>Sign in to continue to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={handleSignIn} disabled={isUserLoading}>
            <GoogleIcon />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
