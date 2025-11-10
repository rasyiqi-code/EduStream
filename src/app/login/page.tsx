
'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, query, limit, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Film } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { demoVideos, demoPlaylists } from '@/lib/seed-data';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Skeleton } from '@/components/ui/skeleton';
import { analytics } from '@/lib/analytics';
import { auditLogger } from '@/lib/audit-logger';

const SEEDING_FLAG = 'firestore_seeded_v2';

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-67.7 67.7C334.6 114.6 295.2 96 248 96c-88.8 0-160.1 71.1-160.1 160s71.3 160 160.1 160c97.4 0 140.2-69.1 144.9-104.4H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
  );
}

function LoginSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center space-y-4">
              <Skeleton className="h-8 w-8 mx-auto" />
              <Skeleton className="h-7 w-48 mx-auto" />
              <Skeleton className="h-5 w-64 mx-auto" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
    )
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
      
      // Track login event
      analytics.login('google');
      
      // Audit log
      if (result.user) {
        auditLogger.logUserLogin(result.user.uid, result.user.email);
      }
      
      // The rest of the logic is handled by the useEffect hook
      // which monitors the `user` state.
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
      
      const videosSnapshot = await getDocs(query(videosCollection, limit(1))).catch(err => {
        const contextualError = new FirestorePermissionError({ operation: 'list', path: 'videos' });
        errorEmitter.emit('permission-error', contextualError);
        return null;
      });

      if (!videosSnapshot) return;

      if (!videosSnapshot.empty) {
        console.log("Database already contains data. Seeding skipped.");
        localStorage.setItem(SEEDING_FLAG, 'true');
        return;
      }

      console.log("Database is empty. Seeding demo data...");
      const batch = writeBatch(firestore);

      demoVideos.forEach((video) => {
        const videoRef = doc(firestore, 'videos', video.id);
        const videoData = { ...video, uploadDate: serverTimestamp(), authorId: 'system', authorRole: 'admin' };
        delete (videoData as any).id;
        batch.set(videoRef, videoData);
      });

      demoPlaylists.forEach((playlist) => {
        const playlistRef = doc(firestore, 'playlists', playlist.id);
        const playlistData = { ...playlist };
        delete (playlistData as any).id;
        batch.set(playlistRef, playlistData);
      });

      batch.commit().catch(err => {
        const contextualError = new FirestorePermissionError({ operation: 'write', path: '[batch]' });
        errorEmitter.emit('permission-error', contextualError);
      });
      
      console.log("Demo data successfully seeded to Firestore.");
      localStorage.setItem(SEEDING_FLAG, 'true');

    }, [firestore]);


  const updateUserProfile = useCallback(async (user: User) => {
    if (!firestore || !user) return;

    const userDocRef = doc(firestore, 'users', user.uid);
    
    const userDocSnap = await getDoc(userDocRef).catch(err => {
        const contextualError = new FirestorePermissionError({ operation: 'get', path: userDocRef.path });
        errorEmitter.emit('permission-error', contextualError);
        return null;
    });

    if (!userDocSnap) return; // Error was handled by the catch block

    if (userDocSnap.exists()) {
        // User profile already exists, do nothing.
        return;
    }
    
    // Default all new users to 'student' role.
    // Role changes can be done manually in the Firestore console.
    const role = 'student';

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: role,
    };
    
    // Use set with merge to safely create the document.
    setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

  }, [firestore]);


  useEffect(() => {
    if (!isUserLoading && user) {
      updateUserProfile(user);
      seedDatabase();
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router, updateUserProfile, seedDatabase]);

  if (isUserLoading || user) {
    return <LoginSkeleton />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
      
      <Card className="w-full max-w-md animate-in fade-in-up duration-500 shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center items-center">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
              A
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">Selamat Datang!</CardTitle>
            <CardDescription className="text-base">
              Login untuk melanjutkan ke platform E-Learning MA Alhuda
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pb-8">
          <Button 
            variant="outline" 
            className="w-full h-12 text-base border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md" 
            onClick={handleSignIn}
          >
            <GoogleIcon />
            Login dengan Google
          </Button>
          
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Dengan login, Anda menyetujui</p>
            <p>
              <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a>
              {' '} dan {' '}
              <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>
            </p>
          </div>
        </CardContent>
        
        {/* Decorative gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      </Card>
    </div>
  );
}
