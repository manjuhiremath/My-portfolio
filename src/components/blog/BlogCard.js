import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { FiClock, FiEye } from 'react-icons/fi';

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

function stripHtml(text = '') {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}


import { SkeletonBlogCard } from './BlogSkeletons';

export default function BlogCard({ blog, categoryColor = 'oklch(60% 0.15 250)', variant = 'default', loading = false }) {
  if (loading) return <SkeletonBlogCard variant={variant} />;
  if (!blog) return null;

  const categoryValue = blog.category?.name || blog.category || 'Uncategorized';
  const categorySlug = slugify(categoryValue);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  if (variant === 'featured') {
    return (
      <Link
        href={href}
        className="group relative block h-[320px] sm:h-[400px] lg:h-[480px] w-full overflow-hidden rounded-xl bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700/50 shadow-soft transition-all duration-500 hover:shadow-xl"
      >
        <div className="relative h-full w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={imageUrl}
            alt={blog.title || 'Featured Manifesto'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            priority
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8 space-y-2 sm:space-y-4">
            <span
              className="w-fit rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl backdrop-blur-md border border-white/10"
              style={{ backgroundColor: `${categoryColor}CC` }}
            >
              {categoryValue}
            </span>
            
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white font-display line-clamp-2 sm:line-clamp-3">
              {blog.title}
            </h3>
            
            <p className="hidden sm:line-clamp-2 text-xs sm:text-sm text-gray-300 font-medium max-w-2xl">
              {blog.excerpt}
            </p>
            
            <div className="pt-2 sm:pt-4 flex items-center justify-between border-t border-white/10">
              <div className="flex items-center gap-3 sm:gap-6 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className="flex items-center gap-1.5 text-white">
                  <FiClock className="h-3 w-3" />
                  {blog.readingTime ? `${blog.readingTime}m` : calculateReadingTime(blog.content)}
                </span>
                <span className="text-white/60">
                  {formatDate(blog.publishedAt || blog.createdAt)}
                </span>
              </div>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-primary group-hover:underline decoration-2 underline-offset-4 transition-all">
                Read Article →
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group flex gap-3 items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 -mx-2 px-2 rounded-lg transition-all duration-300"
      >
        <div className="relative w-14 h-14 sm:w-20 sm:h-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm">
          <Image
            src={imageUrl}
            alt={blog.title || 'Manifesto'}
            fill
            sizes="(max-width: 640px) 60px, 80px"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
          <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-700">
            <span style={{ color: categoryColor }}>{categoryValue}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col h-full overflow-hidden rounded-xl bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700/50 shadow-soft transition-all duration-500 hover:shadow-xl hover:trangray-y-[-4px]"
    >
      <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={blog.title || 'Digital Manifesto'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <span
            className="rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl backdrop-blur-md border border-white/10"
            style={{ backgroundColor: `${categoryColor}CC` }}
          >
            {categoryValue}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] text-white backdrop-blur-md border border-white/5 shadow-lg">
          <FiClock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>{blog.readingTime ? `${blog.readingTime}m` : calculateReadingTime(blog.content)}</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-1 sm:p-2 lg:p-3 space-y-1   sm:space-y-2">
        <h3 className="line-clamp-2 h-8 sm:h-9 md:h-12 text-[11px] sm:text-sm lg:text-base font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-primary ">
          {blog.title}
        </h3>

        <p className="line-clamp-2 sm:line-clamp-3 text-[11px] sm:text-[13px] leading-relaxed text-gray-700 dark:text-gray-400 font-medium">
          {blog.excerpt || stripHtml(blog.content).substring(0, 120) + '...'}
        </p>

        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between border-t border-gray-300 dark:border-gray-800">
          <div className="flex items-center gap-2 sm:gap-4 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-1">
              <FiEye className="h-3 w-3 opacity-70" />
              {(blog.views || 0).toLocaleString()}
            </span>
            <span className="text-primary/80">
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-primary opacity-80 group-hover:opacity-100 group-hover:trangray-x-1 transition-all duration-300">
            Access →
          </span>
        </div>
      </div>
    </Link>
  );
}
