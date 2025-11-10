
import type { Metadata } from 'next';
import './globals.css';
import { LayoutProvider } from '@/components/layout-provider';
import { FirebaseClientProvider } from '@/firebase';
import { PWAInstallBanner } from '@/components/pwa-install-banner';
import { PWAInstallModal } from '@/components/pwa-install-modal';
import { ErrorBoundary } from '@/components/error-boundary';
import { SkipToContent } from '@/components/skip-to-content';

export const metadata: Metadata = {
  title: {
    default: 'E-Learning MA Alhuda - Platform Pembelajaran Online',
    template: '%s | E-Learning MA Alhuda',
  },
  description: 'Platform pembelajaran online dengan video berkualitas tinggi untuk siswa MA Alhuda Pangabasen. Belajar kapan saja, di mana saja dengan materi yang terstruktur.',
  keywords: ['e-learning', 'online learning', 'MA Alhuda', 'pendidikan', 'video pembelajaran', 'kursus online', 'Pangabasen'],
  authors: [{ name: 'MA Alhuda Pangabasen' }],
  creator: 'MA Alhuda Pangabasen',
  publisher: 'MA Alhuda Pangabasen',
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://edustream.app'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'E-Learning MA Alhuda',
    title: 'E-Learning MA Alhuda - Platform Pembelajaran Online',
    description: 'Platform pembelajaran online dengan video berkualitas tinggi untuk siswa MA Alhuda Pangabasen.',
    images: [
      {
        url: '/icons/icon-512.svg',
        width: 512,
        height: 512,
        alt: 'E-Learning MA Alhuda Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Learning MA Alhuda',
    description: 'Platform pembelajaran online untuk siswa MA Alhuda Pangabasen.',
    images: ['/icons/icon-512.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#84ba39" />
      </head>
      <body className="font-body antialiased">
        <SkipToContent />
        <ErrorBoundary>
          <FirebaseClientProvider>
            <LayoutProvider>
              <div id="main-content" role="main">
                {children}
              </div>
            </LayoutProvider>
            <PWAInstallBanner />
            <PWAInstallModal />
          </FirebaseClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
