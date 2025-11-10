
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Play, BookOpen, Users, Award, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

  const features = [
    {
      icon: BookOpen,
      title: "Materi Berkualitas",
      description: "Video pembelajaran yang dirancang khusus oleh instruktur berpengalaman"
    },
    {
      icon: Clock,
      title: "Belajar Fleksibel",
      description: "Akses materi kapan saja, di mana saja sesuai kecepatan belajar Anda"
    },
    {
      icon: Users,
      title: "Komunitas Aktif",
      description: "Bergabung dengan siswa lain dalam perjalanan belajar Anda"
    },
    {
      icon: Award,
      title: "Sertifikat",
      description: "Dapatkan pengakuan atas pencapaian pembelajaran Anda"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 lg:py-32 xl:py-40 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
        
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6 fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Platform E-Learning Modern</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                  Ajhar Bersama
                  <span className="text-gradient block mt-2">MA Alhuda</span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl max-w-[600px]">
                  Platform pembelajaran interaktif dengan video berkualitas tinggi, AI assistant, dan akses kapan saja untuk siswa MA Alhuda Pangabasen.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button asChild size="lg" className="text-base group">
                  <Link href="/login">
                    Mulai Belajar
                    <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base">
                  <Link href="#features">
                    Pelajari Lebih Lanjut
                  </Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t">
                <div>
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground">Video Pembelajaran</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Kursus Tersedia</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Siswa Aktif</div>
                </div>
              </div>
            </div>
            
            <div className="relative lg:order-last fade-in">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
                  width="800"
                  height="600"
                  alt="Students Learning"
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 glass-effect rounded-xl p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">Sedang Belajar</div>
                      <div className="text-xs text-white/80">Matematika Dasar - Bab 3</div>
                    </div>
                    <div className="text-2xl font-bold text-primary">75%</div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">Keunggulan Platform</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Belajar dengan Cara yang Lebih Baik
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Platform kami dirancang dengan fitur-fitur modern untuk memberikan pengalaman belajar terbaik
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
              Didukung oleh Teknologi Terbaik
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
              <div className="text-red-600 grayscale hover:grayscale-0 transition-all">
                <YouTubeLogo />
              </div>
              <div className="grayscale hover:grayscale-0 transition-all">
                <NotebookLMLogo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-10 -z-10" />
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Siap Memulai Perjalanan Belajar Anda?
              </h2>
              <p className="text-lg text-muted-foreground md:text-xl">
                Bergabunglah dengan ratusan siswa MA Alhuda yang sudah merasakan manfaat belajar online
              </p>
            </div>
            <Button asChild size="lg" className="text-base h-12 px-8">
              <Link href="/login">
                <GraduationCap className="mr-2 h-5 w-5" />
                Daftar Sekarang - Gratis!
              </Link>
            </Button>
            
            <blockquote className="max-w-2xl mx-auto text-lg italic text-muted-foreground mt-8 pt-8 border-t">
              "Belajarlah! Karena otak yang ganggur, makin tua makin bebal."
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
