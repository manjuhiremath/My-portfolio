import BlogNavigation from '@/components/blog/BlogNavigation';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

export const metadata = {
  title: 'The Digital Manifesto | Strategic Architectural Insights',
  description: 'A weekly journal exploring high-performance engineering, modern architectural patterns, and the aesthetics of the digital era. Strategic analysis for the modern builder.',
  keywords: ['architectural patterns', 'software engineering', 'digital manifesto', 'engineering excellence', 'technical analysis', 'high-performance systems'],
  verification: {
    google: '2JGk2Vu-1qinl19o3imuPSwhZHcSP7i0zt4ovjzcIpc',
  },
  openGraph: {
    title: 'The Digital Manifesto | Strategic Architectural Insights',
    description: 'A weekly journal exploring high-performance engineering and modern architectural patterns.',
    type: 'website',
    url: '/blog',
    siteName: 'The Digital Manifesto',
  },
  alternates: {
    canonical: '/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Digital Manifesto | Strategic Architectural Insights',
    description: 'A weekly journal exploring high-performance engineering and modern architectural patterns.',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function BlogLayout({ children }) {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" />}>
        <BlogNavigation />
      </Suspense>
      {children}
      <Footer />
    </>
  );
}
