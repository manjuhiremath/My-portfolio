'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiClock, FiEye } from 'react-icons/fi';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { SkeletonCategorySection } from '../BlogSkeletons';

export default function CategorySection({ category, initialBlogs = [], categoryColor = '#c4622d' }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [loading, setLoading] = useState(initialBlogs.length === 0);

  const categoryName = typeof category === 'object' ? category?.name || 'Uncategorized' : category || 'Uncategorized';
  const categorySlug = slugify(categoryName);

  useEffect(() => {
    async function fetchMoreData() {
      try {
        const res = await fetch(`/api/blogs?category=${encodeURIComponent(categorySlug)}&limit=5&published=true`);
        const data = await res.json();
        if (data.success) {
          setBlogs(data.blogs);
        }
      } catch (error) {
        console.error('Failed to fetch category blogs:', error);
      } finally {
        setLoading(false);
      }
    }

    if (initialBlogs.length < 6) {
      fetchMoreData();
    }
  }, [categorySlug, initialBlogs.length]);

  if (loading) return <SkeletonCategorySection />;
  if (!blogs?.length) return null;

  const [featured, ...rest] = blogs.slice(0, 6);

  return (
    <section className="w-full py-6 border-t border-gray-100 dark:border-gray-800 first:border-t-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full" style={{ backgroundColor: categoryColor }} />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-display">
              {categoryName}
            </h2>
            <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
              <span className="opacity-60">{blogs.length} Articles</span>
            </div>
          </div>
        </div>
        <Link
          href={`/blog?category=${encodeURIComponent(categoryName)}`}
          className="group hidden sm:flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 transition-all hover:border-primary hover:text-primary active:scale-95"
        >
          Archive
          <FiArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BIG COLUMN (Left) */}
        {featured && (
          <div className="lg:col-span-7 xl:col-span-8">
            <Link href={`/blog/${categorySlug}/${featured.slug}`} className="group block h-[500px]">
              <div className="relative h-full min-h-[300px] lg:min-h-[350px] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-950 shadow-xl ring-1 ring-black/5 dark:ring-white/5">
                <Image
                  src={fixUnsplashUrl(featured.featuredImage)}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                    <span className="flex items-center gap-1.5 text-primary">
                      <FiClock className="h-3 w-3" />
                      {featured.readingTime || 5} MIN
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <span>{(featured.views || 0).toLocaleString()} IMPACT</span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white font-display line-clamp-2">
                    {featured.title}
                  </h3>
                  
                  <p className="line-clamp-2 text-[13px] text-gray-300 font-medium max-w-xl leading-relaxed font-body">
                    {featured.excerpt || 'A definitive technical investigation into the future of this strategic sector.'}
                  </p>
                  
                  <div className="pt-2 flex items-center gap-3">
                    <span className="rounded-full bg-primary/90 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                      Read Deep Dive
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* LIST COLUMN (Right) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-start space-y-4">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {rest.map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${categorySlug}/${blog.slug}`}
                className="group flex gap-4 py-3.5 first:pt-0 last:pb-0 transition-all items-center"
              >
                {/* Compact Thumbnail */}
                <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-900 shadow-md">
                  <Image
                    src={fixUnsplashUrl(blog.featuredImage)}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="120px"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="line-clamp-2 text-[13px] sm:text-[14px] font-bold leading-snug tracking-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors font-display">
                    {blog.title}
                  </h3>
                  <p className="line-clamp-2 text-[13px] text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed font-body">
                    {blog.excerpt || 'A definitive technical investigation into the future of this strategic sector.'}
                  </p>
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <span className="text-primary/70">{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className="flex items-center gap-1">
                      <FiClock className="h-2.5 w-2.5" />
                      {blog.readingTime || 3}M
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={`/blog?category=${encodeURIComponent(categoryName)}`}
            className="group flex sm:hidden items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white p-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white dark:text-gray-900 shadow-xl transition-all active:scale-95"
          >
            See All
            <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
