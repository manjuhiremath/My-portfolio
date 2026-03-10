'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FiArrowLeft, FiShare2, FiTwitter, FiLinkedin, FiCopy, FiCheck, FiClock, FiEye } from 'react-icons/fi';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import MultiplexAd from '@/components/ads/MultiplexAd';

// Dynamic imports for components that can be lazy loaded
const RelatedArticles = dynamic(() => import('./RelatedArticles'), {
  loading: () => <div className="h-40 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />,
  ssr: false
});

export default function MobileBlogLayout({ 
  blog, 
  relatedBlogs, 
  categoryName, 
  tagNames, 
  readingTime,
  contentParts 
}) {
  const [loadedSections, setLoadedSections] = useState(1);
  const [copied, setLoadedCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (loadedSections >= contentParts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadedSections(prev => Math.min(prev + 1, contentParts.length));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadedSections, contentParts.length]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setLoadedCopied(true);
    setTimeout(() => setLoadedCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  return (
    <div className="mobile-blog-layout md:hidden min-h-screen bg-white dark:bg-[#0f172a] text-[#111827] dark:text-[#e2e8f0]">
      {/* Sticky Top Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 h-14 flex items-center justify-between border-b ${
        scrolled ? 'bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-[#e5e7eb] dark:border-[#1e293b] shadow-sm' : 'bg-transparent border-transparent'
      }`}>
        <Link href="/blog" className="p-2 -ml-2 text-[#111827] dark:text-[#e2e8f0]">
          <FiArrowLeft className="w-6 h-6" />
        </Link>
        <div className={`flex-1 mx-4 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-sm font-bold truncate line-clamp-1">{blog.title}</h2>
        </div>
        <button onClick={copyToClipboard} className="p-2 -mr-2 text-[#111827] dark:text-[#e2e8f0]">
          <FiShare2 className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-screen-sm mx-auto">
          {/* Meta Info */}
          <div className="flex items-center gap-2 mb-4">
            <Link href={`/blog?category=${encodeURIComponent(categoryName)}`} className="text-[12px] font-bold uppercase tracking-wider text-[#2563eb] dark:text-[#3b82f6]">
              {categoryName}
            </Link>
            <span className="w-1 h-1 rounded-full bg-[#6b7280] dark:bg-[#94a3b8]" />
            <span className="text-[12px] text-[#6b7280] dark:text-[#94a3b8] font-medium">{readingTime} min read</span>
          </div>

          <h1 className="mobile-title text-[26px] font-bold leading-[1.3] mb-6 text-[#111827] dark:text-[#e2e8f0]">
            {blog.title}
          </h1>

          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-[#e5e7eb] dark:border-[#1e293b]">
              <Image src="/Profilemanju.jpeg" alt="Author" fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827] dark:text-[#e2e8f0]">Manjunath M</p>
              <p className="text-[12px] text-[#6b7280] dark:text-[#94a3b8]">
                {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {blog.featuredImage && (
            <div className="relative aspect-[16/10] mb-8 overflow-hidden rounded-2xl shadow-soft border border-[#e5e7eb] dark:border-[#1e293b]">
              <Image
                src={fixUnsplashUrl(blog.featuredImage)}
                alt={blog.title}
                fill
                className="object-cover"
                priority
                loading="eager"
              />
            </div>
          )}

          {/* Render Sections */}
          <div className="mobile-content space-y-6">
            {contentParts.slice(0, loadedSections).map((part, index) => (
              <div 
                key={index} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                dangerouslySetInnerHTML={{ __html: part }} 
              />
            ))}
          </div>

          {/* Intersection Target for Lazy Loading */}
          {loadedSections < contentParts.length && (
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Tags */}
          {tagNames.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-[#e5e7eb] dark:border-[#1e293b]">
              {tagNames.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-[#e5e7eb] dark:border-[#1e293b] text-xs font-semibold text-[#6b7280] dark:text-[#94a3b8]"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Related Articles Section */}
          {loadedSections === contentParts.length && (
            <div className="mt-12 pt-8 border-t border-[#e5e7eb] dark:border-[#1e293b]">
              <div className="mb-10">
                <MultiplexAd />
              </div>
              <h2 className="text-[20px] font-bold mb-6 text-[#111827] dark:text-[#e2e8f0]">Related Articles</h2>
              <Suspense fallback={<div className="h-40 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />}>
                <RelatedArticles blogs={relatedBlogs} />
              </Suspense>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Share Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-[#e5e7eb] dark:border-[#1e293b] animate-in slide-in-from-bottom duration-500">
        <div className="max-w-screen-sm mx-auto flex items-center justify-between gap-4">
          <p className="text-[12px] font-bold text-[#6b7280] dark:text-[#94a3b8] uppercase tracking-widest">Share this</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={shareTwitter}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1da1f2] text-white shadow-soft"
            >
              <FiTwitter className="w-5 h-5" />
            </button>
            <button 
              onClick={shareLinkedin}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0077b5] text-white shadow-soft"
            >
              <FiLinkedin className="w-5 h-5" />
            </button>
            <button 
              onClick={copyToClipboard}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[#111827] dark:text-[#e2e8f0] border border-[#e5e7eb] dark:border-[#1e293b] shadow-soft"
            >
              {copied ? <FiCheck className="w-5 h-5 text-green-500" /> : <FiCopy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-content {
            font-size: 16px !important;
            line-height: 1.8 !important;
            color: #111827 !important;
          }
          .dark .mobile-content {
            color: #e2e8f0 !important;
          }
          .mobile-content h2 {
            font-size: 20px !important;
            font-weight: 700 !important;
            margin-top: 2rem !important;
            margin-bottom: 1rem !important;
          }
          .mobile-content h3 {
            font-size: 18px !important;
            font-weight: 700 !important;
            margin-top: 1.5rem !important;
            margin-bottom: 0.75rem !important;
          }
          .mobile-content p {
            margin-bottom: 1.25rem !important;
          }
          .mobile-content img {
            border-radius: 16px !important;
            margin: 1.5rem 0 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          }
          .mobile-content blockquote {
            border-left: 4px solid #2563eb !important;
            padding-left: 1.25rem !important;
            margin: 1.5rem 0 !important;
            font-style: italic !important;
            color: #6b7280 !important;
          }
          .dark .mobile-content blockquote {
            border-left-color: #3b82f6 !important;
            color: #94a3b8 !important;
          }
        }
      `}</style>
    </div>
  );
}
