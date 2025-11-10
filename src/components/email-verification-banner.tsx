'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, X, CheckCircle } from 'lucide-react';
import { sendVerificationEmail, needsEmailVerification } from '@/lib/email-verification';
import { useToast } from '@/hooks/use-toast';

export function EmailVerificationBanner() {
  const { user } = useUser();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  if (!user || !needsEmailVerification(user) || isDismissed) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsSending(true);
    const success = await sendVerificationEmail(user);
    
    if (success) {
      toast({
        variant: 'default',
        title: 'Email Verifikasi Terkirim',
        description: `Kami telah mengirim link verifikasi ke ${user.email}. Silakan cek inbox Anda.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim Email',
        description: 'Terjadi kesalahan. Silakan coba lagi nanti.',
      });
    }
    
    setIsSending(false);
  };

  const handleCheckVerification = async () => {
    try {
      await user.reload();
      
      if (user.emailVerified) {
        toast({
          variant: 'default',
          title: 'Email Terverifikasi!',
          description: 'Terima kasih telah memverifikasi email Anda.',
        });
        window.location.reload();
      } else {
        toast({
          variant: 'default',
          title: 'Belum Terverifikasi',
          description: 'Silakan cek email Anda dan klik link verifikasi.',
        });
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memeriksa status verifikasi. Silakan coba lagi.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 pt-4 max-w-7xl">
      <Alert className="border-2 border-warning bg-warning/10">
        <Mail className="h-5 w-5 text-warning" />
        <AlertTitle className="text-warning">Email Belum Diverifikasi</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-sm">
            Untuk keamanan akun Anda, mohon verifikasi email <strong>{user.email}</strong>
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSendVerification}
              disabled={isSending}
              className="border-warning text-warning hover:bg-warning/10"
            >
              {isSending ? 'Mengirim...' : 'Kirim Ulang Email'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleCheckVerification}
              className="border-warning text-warning hover:bg-warning/10"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Sudah Verifikasi
            </Button>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}

