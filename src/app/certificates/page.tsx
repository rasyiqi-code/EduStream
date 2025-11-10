/**
 * @file certificates/page.tsx
 * @description User's certificate gallery page
 */

'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Certificate } from '@/lib/certificate-types';
import { CertificateCard } from '@/components/certificate-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Trophy } from 'lucide-react';

function CertificatesPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function CertificatesPageContent() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const certificatesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'certificates'),
      where('userId', '==', user.uid),
      orderBy('issuedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: certificates, isLoading } = useCollection<Certificate>(certificatesQuery);

  if (isUserLoading || isLoading) {
    return <CertificatesPageSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          Sertifikat Saya
        </h1>
        <p className="text-muted-foreground">
          {certificates?.length || 0} sertifikat yang telah Anda peroleh
        </p>
      </div>

      {/* Certificates Grid */}
      {certificates && certificates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <CardTitle className="mb-2">Belum Ada Sertifikat</CardTitle>
            <CardDescription>
              Selesaikan kursus untuk mendapatkan sertifikat
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense fallback={<CertificatesPageSkeleton />}>
      <CertificatesPageContent />
    </Suspense>
  );
}

