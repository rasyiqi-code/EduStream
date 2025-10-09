
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

function YouTubeLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto" viewBox="0 0 28 20" fill="none">
      <path d="M27.5 3.125C27.1875 1.875 26.1875 0.9375 24.9375 0.625C22.75 0 14 0 14 0C14 0 5.25 0 3.0625 0.625C1.8125 0.9375 0.8125 1.875 0.5 3.125C0 5.375 0 10 0 10C0 10 0 14.625 0.5 16.875C0.8125 18.125 1.8125 19.0625 3.0625 19.375C5.25 20 14 20 14 20C14 20 22.75 20 24.9375 19.375C26.1875 19.0625 27.1875 18.125 27.5 16.875C28 14.625 28 10 28 10C28 10 28 5.375 27.5 3.125Z" fill="#FF0000"/>
      <path d="M11.1875 14.3125V5.6875L18.5 10L11.1875 14.3125Z" fill="white"/>
    </svg>
  )
}

function NotebookLMLogo() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto" viewBox="0 0 162 24" fill="currentColor">
          <path d="M38.816 16.31V7.53398H42.746V14.17H49.16V16.31H38.816Z"/>
          <path d="M54.085 16.31V7.53398H64.915V9.67398H58.015V11.234H64.135V13.374H58.015V14.17H64.915V16.31H54.085Z"/>
          <path d="M70.3695 16.31V7.53398H81.1995V9.67398H74.2995V11.234H80.4195V13.374H74.2995V14.17H81.1995V16.31H70.3695Z"/>
          <path d="M96.068 7.53398H91.13V16.31H87.2V7.53398H82.262V9.67398H87.2V14.17H91.13V9.67398H96.068V7.53398Z"/>
          <path d="M111.41 9.67398V11.234H107.48V7.53398H111.41V9.67398Z"/>
          <path d="M103.55 16.31V7.53398H115.742C117.814 7.53398 119.474 8.52198 119.474 10.482C119.474 11.85 118.73 12.87 117.542 13.43L119.684 16.142V16.31H117.158L115.394 13.91H111.41V16.31H103.55ZM111.41 11.234V12.986H114.758C115.85 12.986 116.486 12.426 116.486 11.606C116.486 10.786 115.85 10.226 114.758 10.226H107.48V11.234H111.41Z"/>
          <path d="M129.569 16.31V7.53398H133.499V14.17H139.919V16.31H129.569Z"/>
          <path d="M140.781 9.45798V7.53398H151.791V9.45798L147.291 16.31H144.921L148.515 10.742L140.781 9.45798Z"/>
          <path d="M153.303 16.31V7.53398H157.233V16.31H153.303Z"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M11.648 1H1V11.648H11.648V1ZM3 3V9.648H9.648V3H3Z"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M11.648 12.352H1V23H11.648V12.352ZM3 14.352V21H9.648V14.352H3Z"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M12.352 1H23V11.648H12.352V1ZM14.352 3V9.648H21V3H14.352Z"/>
        </svg>
    )
}


export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect to dashboard.
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // Don't render anything for logged-in users while redirecting.
  if (isUserLoading || user) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Selamat Datang di Platform E-Learning MA Alhuda Pangabasen
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Akses materi pembelajaran video eksklusif yang dirancang untuk siswa MA Alhuda Pangabasen. Belajar kapan saja, di mana saja.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">Mulai Belajar</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/landing-hero/600/400"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint="students learning"
              />
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                Didukung oleh
              </p>
              <div className="flex items-center justify-center gap-8 md:gap-12 text-foreground">
                <YouTubeLogo />
                <NotebookLMLogo />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
