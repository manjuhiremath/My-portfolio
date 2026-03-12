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
    <div className="mobile-blog-layout md:hidden min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sticky Top Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 h-16 flex items-center justify-between border-b ${
        scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-100 dark:border-slate-800 shadow-xl shadow-black/5' : 'bg-transparent border-transparent'
      }`}>
        <Link href="/blog" className="p-2 -ml-2 text-slate-900 dark:text-white">
          <FiArrowLeft className="w-6 h-6" />
        </Link>
        <div className={`flex-1 mx-4 transition-all duration-500 transform ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] truncate line-clamp-1 text-slate-400">{blog.title}</h2>
        </div>
        <button onClick={copyToClipboard} className="p-2 -mr-2 text-slate-900 dark:text-white">
          <FiShare2 className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-screen-sm mx-auto">
          {/* Meta Info */}
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/blog?category=${encodeURIComponent(categoryName)}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">
              {categoryName}
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{readingTime} min read</span>
          </div>

          <h1 className="mobile-title text-[32px] font-black leading-[1.1] tracking-tight mb-8 text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 mb-10 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Published on {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {blog.featuredImage && (
            <div className="relative aspect-[4/3] mb-10 overflow-hidden rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-1000">
              <Image
                src={fixUnsplashUrl(blog.featuredImage)}
                alt={blog.title}
                fill
                className="object-cover"
                priority
                loading="eager"
                sizes="(max-width: 768px) 100vw, 640px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          {/* Render Sections */}
          <div className="mobile-content space-y-8">
            {contentParts.slice(0, loadedSections).map((part, index) => (
              <div 
                key={index} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
                dangerouslySetInnerHTML={{ __html: part }} 
              />
            ))}
          </div>

          {/* Intersection Target for Lazy Loading */}
          {loadedSections < contentParts.length && (
            <div ref={observerTarget} className="h-32 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Tags */}
          {tagNames.length > 0 && (
            <div className="mt-16 flex flex-wrap gap-2 pt-10 border-t border-slate-100 dark:border-slate-800">
              {tagNames.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Related Articles Section */}
          {loadedSections === contentParts.length && (
            <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
              <div className="mb-12">
                <MultiplexAd />
              </div>
              <div className="flex items-center gap-3 mb-8">
                <span className="h-1.5 w-8 rounded-full bg-orange-500" />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Recommendations</h2>
              </div>
              <Suspense fallback={<div className="h-40 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-3xl" />}>
                <RelatedArticles blogs={relatedBlogs} />
              </Suspense>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Share Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pb-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-700 delay-500 fill-mode-both">
        <div className="max-w-screen-sm mx-auto flex items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Pass it on</p>
          <div className="flex items-center gap-3">
            <button 
              onClick={shareTwitter}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black text-white shadow-xl shadow-black/10 transition-transform"
            >
              <FiTwitter className="w-5 h-5" />
            </button>
            <button 
              onClick={shareLinkedin}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0077b5] text-white shadow-xl shadow-blue-500/10 transition-transform"
            >
              <FiLinkedin className="w-5 h-5" />
            </button>
            <button 
              onClick={copyToClipboard}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 shadow-xl shadow-black/5 transition-transform"
            >
              {copied ? <FiCheck className="w-5 h-5 text-green-500" /> : <FiCopy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-content {
            font-size: 18px !important;
            line-height: 1.8 !important;
            font-weight: 500 !important;
            color: #334155 !important;
          }
          .dark .mobile-content {
            color: #cbd5e1 !important;
          }
          .mobile-content h2 {
            font-size: 24px !important;
            font-weight: 900 !important;
            letter-spacing: -0.025em !important;
            margin-top: 3rem !important;
            margin-bottom: 1.5rem !important;
            color: #0f172a !important;
          }
          .dark .mobile-content h2 {
            color: #f8fafc !important;
          }
          .mobile-content p {
            margin-bottom: 1.5rem !important;
          }
          .mobile-content img {
            border-radius: 2rem !important;
            margin: 2.5rem 0 !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important;
          }
          .mobile-content blockquote {
            border-left: 0 !important;
            padding: 2rem !important;
            background: #fff7ed !important;
            border-radius: 2rem !important;
            margin: 2.5rem 0 !important;
            font-style: italic !important;
            font-weight: 600 !important;
            color: #c2410c !important;
          }
          .dark .mobile-content blockquote {
            background: rgba(251, 146, 60, 0.1) !important;
            color: #fb923c !important;
          }
        }
      `}</style>
    </div>
  );
}
