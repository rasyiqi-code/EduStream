import type { Metadata } from 'next';
import './globals.css';
import { LayoutProvider } from '@/components/layout-provider';

export const metadata: Metadata = {
  title: 'EduStream',
  description: 'An educational video platform for schools.',
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
      </head>
      <body className="font-body antialiased">
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
