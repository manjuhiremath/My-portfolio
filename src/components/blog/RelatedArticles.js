'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiClock } from 'react-icons/fi';
import { fixUnsplashUrl, slugify } from '@/lib/utils';

export default function RelatedArticles({ blogs }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
      {blogs.map((blog) => {
        const categoryName = blog.category?.name || blog.category || 'Uncategorized';
        const categorySlug = slugify(categoryName);
        
        return (
          <Link
            key={blog._id}
            href={`/blog/${categorySlug}/${blog.slug}`}
            className="flex-shrink-0 w-[280px] snap-start group"
          >
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e5e7eb] dark:border-[#1e293b] overflow-hidden shadow-sm transition-all">
              <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800">
                <img
                  src={fixUnsplashUrl(blog.featuredImage)}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold text-[#2563eb] dark:text-[#3b82f6] uppercase tracking-widest mb-2">
                  {categoryName}
                </p>
                <h3 className="text-sm font-bold text-[#111827] dark:text-[#e2e8f0] line-clamp-2 mb-3 leading-tight transition-colors">
                  {blog.title}
                </h3>
                <div className="flex items-center text-[11px] text-[#6b7280] dark:text-[#94a3b8] font-medium">
                  <FiClock className="w-3 h-3 mr-1" />
                  <span>5 min read</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
