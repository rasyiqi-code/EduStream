
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

function YouTubeLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto transition-transform hover:scale-110" viewBox="0 0 28 20" fill="currentColor">
      <path d="M27.5 3.125C27.1875 1.875 26.1875 0.9375 24.9375 0.625C22.75 0 14 0 14 0C14 0 5.25 0 3.0625 0.625C1.8125 0.9375 0.8125 1.875 0.5 3.125C0 5.375 0 10 0 10C0 10 0 14.625 0.5 16.875C0.8125 18.125 1.8125 19.0625 3.0625 19.375C5.25 20 14 20 14 20C14 20 22.75 20 24.9375 19.375C26.1875 19.0625 27.1875 18.125 27.5 16.875C28 14.625 28 10 28 10C28 10 28 5.375 27.5 3.125Z" fill="#FF0000"/>
      <path d="M11.1875 14.3125V5.6875L18.5 10L11.1875 14.3125Z" fill="white"/>
    </svg>
  )
}

function NotebookLMLogo() {
    return (
        <Image
            src="https://notebooklm.google.com/_/static/branding/v5/light_mode/notebook-logo.svg"
            alt="NotebookLM Logo"
            width={162}
            height={24}
            className="h-6 w-auto transition-transform hover:scale-110"
        />
    )
}

function LandingPageSkeleton() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
          <main className="flex-1">
            <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
              <div className="container px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-4/5" />
                        <Skeleton className="h-6 w-full mt-4" />
                        <Skeleton className="h-6 w-2/3" />
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                      <Skeleton className="h-12 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-[225px] w-full mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last xl:h-[337px]" />
                </div>
              </div>
            </section>
            
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex items-center justify-center gap-8 md:gap-12 text-foreground">
                            <Skeleton className="h-8 w-28" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                    </div>
                </div>
            </section>
    
          </main>
        </div>
      );
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
    return <LandingPageSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 animate-in fade-in-up duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Ajhar di E-Learning MA Alhuda
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
              <div className="group relative mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last">
                <Image
                  src="https://picsum.photos/seed/education/600/400"
                  width="600"
                  height="400"
                  alt="Hero"
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  data-ai-hint="elearning illustration"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 animate-in fade-in-up duration-500 delay-200">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                Didukung oleh
              </p>
              <div className="flex items-center justify-center gap-8 md:gap-12 text-foreground">
                <div className="text-red-600">
                    <YouTubeLogo />
                </div>
                <NotebookLMLogo />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
