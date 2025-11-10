/**
 * @file certificate/verify/[id]/page.tsx
 * @description Public certificate verification page
 */

'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Certificate } from '@/lib/certificate-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Award, Calendar, User, GraduationCap } from 'lucide-react';

function VerificationPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mt-2 mx-auto" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function VerificationPageContent() {
  const params = useParams();
  const firestore = useFirestore();
  const certificateId = params.id as string;

  const certificatesQuery = useMemoFirebase(() => {
    if (!firestore || !certificateId) return null;
    return query(
      collection(firestore, 'certificates'),
      where('certificateId', '==', certificateId)
    );
  }, [firestore, certificateId]);

  const { data: certificates, isLoading } = useCollection<Certificate>(certificatesQuery);
  const certificate = certificates?.[0];

  if (isLoading) {
    return <VerificationPageSkeleton />;
  }

  const isValid = Boolean(certificate);
  const completionDate = certificate?.completionDate.toDate().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className={isValid ? 'border-green-500 border-2' : 'border-red-500 border-2'}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isValid ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isValid ? 'Sertifikat Valid ✓' : 'Sertifikat Tidak Valid'}
          </CardTitle>
          <CardDescription className="mt-2">
            {isValid
              ? 'Sertifikat ini telah diverifikasi oleh sistem'
              : 'Sertifikat dengan ID ini tidak ditemukan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isValid && certificate ? (
            <div className="space-y-6">
              {/* Certificate Details */}
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Penerima</p>
                    <p className="font-semibold">{certificate.userName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kursus</p>
                    <p className="font-semibold">{certificate.courseName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Instruktur</p>
                    <p className="font-semibold">{certificate.instructorName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                    <p className="font-semibold">{completionDate}</p>
                  </div>
                </div>

                {certificate.score && (
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                    <span className="font-medium">Skor Akhir</span>
                    <Badge className="text-lg px-4 py-1">{certificate.score}%</Badge>
                  </div>
                )}
              </div>

              {/* Certificate ID */}
              <div className="pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">Certificate ID</p>
                <p className="font-mono text-sm mt-1">{certificate.certificateId}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Sertifikat dengan ID <span className="font-mono">{certificateId}</span> tidak ditemukan.</p>
              <p className="text-sm mt-2">Pastikan ID yang Anda masukkan benar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CertificateVerificationPage() {
  return (
    <Suspense fallback={<VerificationPageSkeleton />}>
      <VerificationPageContent />
    </Suspense>
  );
}

