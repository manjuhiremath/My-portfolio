import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { FiClock } from 'react-icons/fi';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateReadingTime(content) {
  if (!content) return '5m';
  const wordsPerMinute = 200;
  const text = typeof content === 'string' ? content : '';
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes}m`;
}

import { SkeletonBlogCardSmall } from './BlogSkeletons';

export default function BlogCardSmall({ blog, categoryColor = 'oklch(60% 0.15 250)', loading = false }) {
  if (loading) return <SkeletonBlogCardSmall />;
  if (!blog) return null;

  const categoryValue = blog.category?.name || blog.category || 'Uncategorized';
  const categorySlug = slugify(categoryValue);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700/50 shadow-soft transition-all duration-500 hover:shadow-lg h-full"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={blog.title || 'Digital Manifesto'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        
        <div className="absolute top-2 left-2">
          <span
            className="rounded-full px-2 py-0.5 text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-white shadow-xl backdrop-blur-md border border-white/10"
            style={{ backgroundColor: `${categoryColor}CC` }}
          >
            {categoryValue}
          </span>
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-1.5">
        <h3 className="line-clamp-2 text-[10px] sm:text-[12px] lg:text-[13px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-primary font-display">
          {blog.title}
        </h3>
        
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-300 dark:border-gray-800 mt-1">
          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-gray-400">
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
          <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-gray-400">
            <FiClock className="h-2 w-2" />
            <span>{blog.readingTime ? `${blog.readingTime}m` : calculateReadingTime(blog.content)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
