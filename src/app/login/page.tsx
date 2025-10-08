'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Film } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

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

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    if (!auth || !firestore) return;

    const provider = new GoogleAuthProvider();
    
    // signInWithPopup can still throw errors for non-permission issues (e.g., popup closed).
    // We let these bubble up for now or handle them separately if needed.
    // The permission error on setDoc will be caught by the non-blocking handler.
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    
    const userDocRef = doc(firestore, 'users', user.uid);
    // The FirestorePermissionError will be emitted by this non-blocking function.
    setDocumentNonBlocking(userDocRef, userProfile, { merge: true });
  };

  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
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
          <Button variant="outline" className="w-full" onClick={handleSignIn}>
            <GoogleIcon />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
