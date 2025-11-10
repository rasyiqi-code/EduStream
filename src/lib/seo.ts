import type { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.other';
  publishedTime?: string;
  author?: string;
}

export function generateSEO({
  title,
  description,
  image = '/icons/icon-512.svg',
  url,
  type = 'website',
  publishedTime,
  author,
}: SEOProps): Metadata {
  const siteName = 'E-Learning MA Alhuda';
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edustream.app';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'id_ID',
      type,
      ...(publishedTime && { publishedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@maalhuda',
    },
    alternates: {
      canonical: fullUrl,
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
  };
}

export const defaultSEO = generateSEO({
  title: 'Platform E-Learning Terbaik',
  description: 'Platform pembelajaran online dengan video berkualitas tinggi untuk siswa MA Alhuda Pangabasen. Belajar kapan saja, di mana saja dengan materi yang terstruktur.',
});

