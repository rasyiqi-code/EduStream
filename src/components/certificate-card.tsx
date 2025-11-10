/**
 * @file certificate-card.tsx
 * @description Certificate display and download card
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Award, Share2, ExternalLink } from 'lucide-react';
import type { Certificate } from '@/lib/certificate-types';
import { downloadCertificate, type CertificateData } from '@/lib/certificate-generator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface CertificateCardProps {
  certificate: Certificate & { id: string };
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (!certificate.completionDate) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Tanggal penyelesaian tidak tersedia.',
        });
        setIsDownloading(false);
        return;
      }
      
      const certData: CertificateData = {
        certificateId: certificate.certificateId,
        studentName: certificate.userName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate.toDate(),
        instructorName: certificate.instructorName,
        score: certificate.score,
      };

      await downloadCertificate(certData);

      toast({
        title: 'Certificate Downloaded',
        description: 'Sertifikat berhasil diunduh.',
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengunduh sertifikat.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = certificate.verificationUrl;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Certificate',
          text: `Saya telah menyelesaikan kursus "${certificate.courseName}"!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied',
        description: 'Link verifikasi telah disalin ke clipboard.',
      });
    }
  };

  const completionDate = certificate.completionDate 
    ? certificate.completionDate.toDate().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Tanggal tidak tersedia';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{certificate.courseName}</CardTitle>
              <CardDescription className="mt-1">
                Diselesaikan pada {completionDate}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">Verified</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Instruktur</p>
            <p className="font-medium">{certificate.instructorName}</p>
          </div>
          {certificate.score && (
            <div>
              <p className="text-muted-foreground">Skor</p>
              <p className="font-medium">{certificate.score}%</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-muted-foreground">Certificate ID</p>
            <p className="font-mono text-xs">{certificate.certificateId}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/certificate/verify/${certificate.certificateId}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

