
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Film, BookOpen, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
                    Platform Video Edukasi Modern Anda
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    EduStream menyediakan kursus video berkualitas tinggi yang dikurasi oleh para ahli untuk memberdayakan pembelajaran Anda.
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
                data-ai-hint="learning online"
              />
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-card px-3 py-1 text-sm">Fitur Utama</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Belajar Lebih Cerdas, Bukan Lebih Keras</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Kami menyediakan alat dan fitur yang Anda butuhkan untuk berhasil dalam perjalanan pendidikan Anda.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <Film className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Konten Terkurasi</h3>
                <p className="text-muted-foreground">
                  Akses perpustakaan video yang dibuat oleh para instruktur ahli di berbagai bidang.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <BookOpen className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Playlist Terstruktur</h3>
                <p className="text-muted-foreground">
                  Ikuti jalur pembelajaran yang terorganisir dengan baik melalui playlist kursus kami yang mudah dinavigasi.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Lingkungan Aman</h3>
                <p className="text-muted-foreground">
                  Platform aman yang dirancang khusus untuk institusi pendidikan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
