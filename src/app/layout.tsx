
import type { Metadata } from 'next';
import './globals.css';
import { LayoutProvider } from '@/components/layout-provider';
import { FirebaseClientProvider } from '@/firebase';
import { PWAInstallBanner } from '@/components/pwa-install-banner';
import { PWAInstallModal } from '@/components/pwa-install-modal';

export const metadata: Metadata = {
  title: 'E-Learning MA Alhuda',
  description: 'Platform e-learning untuk siswa MA Alhuda Pangabasen.',
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#84ba39" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <LayoutProvider>{children}</LayoutProvider>
          <PWAInstallBanner />
          <PWAInstallModal />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
