'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-muted/30 to-background">
      <Card className="max-w-md w-full border-2 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <WifiOff className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Anda Sedang Offline</CardTitle>
          <CardDescription className="text-base">
            Koneksi internet Anda terputus. Beberapa fitur mungkin tidak tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Yang Masih Bisa Anda Lakukan:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Lihat video yang sudah di-cache</li>
              <li>• Browse konten yang sudah dimuat</li>
              <li>• Akses halaman yang sudah pernah dibuka</li>
            </ul>
          </div>

          <Button onClick={handleRetry} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Aplikasi akan otomatis tersambung kembali saat koneksi internet aktif
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

