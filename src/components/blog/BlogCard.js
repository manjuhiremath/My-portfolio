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
  if (!content) return '5 min';
  const wordsPerMinute = 200;
  const text = typeof content === 'string' ? content : '';
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min`;
}

function stripHtml(text = '') {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanExcerpt(text = '') {
  if (!text) return 'Read this article for practical insights and actionable guidance.';
  // Strip HTML tags and code fences
  let clean = text.replace(/```(?:html)?/gi, '').replace(/```/g, '');
  clean = stripHtml(clean);
  // Truncate to ~160 chars
  if (clean.length > 160) clean = clean.substring(0, 157) + '...';
  return clean;
}

export default function BlogCard({ blog, categoryColor = '#6366f1', variant = 'default' }) {
  if (!blog) return null;

  // Handle category - could be string name (pre-mapped), or object with name
  const categoryValue = blog.category?.name || blog.category || 'Uncategorized';
  const categorySlug = slugify(categoryValue);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  // Compact variant for sidebar
  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group flex gap-3 items-start py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 px-2 rounded-lg transition-colors"
      >
        <div className="relative w-16 h-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
          <Image
            src={imageUrl}
            alt={blog.title || 'Blog post'}
            fill
            sizes="64px"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition-colors">
            {blog.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span style={{ color: categoryColor }}>{categoryValue || 'Uncategorized'}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card variant — Issue 4: show tags, reading time, date, clean excerpt
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] backdrop-blur-sm transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-700">
        <Image
          src={imageUrl}
          alt={blog.title || 'Blog post'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-md border border-white/20"
            style={{ backgroundColor: `${categoryColor}CC` }}
          >
            {categoryValue || 'General'}
          </span>
        </div>

        {/* Reading time badge */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-md border border-white/10">
          <FiClock className="h-3 w-3" />
          <span>{blog.readingTime ? `${blog.readingTime} min` : calculateReadingTime(blog.content)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
            {categoryValue}
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-orange-600 sm:text-xl">
          {blog.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          {cleanExcerpt(blog.excerpt)}
        </p>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="mt-4 flex items-center flex-nowrap gap-2 overflow-hidden">
            {blog.tags.slice(0, 2).map((tag) => (
              <span
                key={tag?._id || tag}
                className="whitespace-nowrap rounded-lg bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-slate-600/50"
              >
                #{tag?.name || tag}
              </span>
            ))}
            {blog.tags.length > 2 && (
              <span className="text-[10px] font-bold text-orange-500 whitespace-nowrap bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg border border-orange-100/50 dark:border-orange-800/50">
                +{blog.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-4">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-slate-100 dark:ring-slate-700">
              <Image src="/Profilemanju.jpeg" alt="Author" fill className="object-cover" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Manjunath M</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <FiEye className="h-3.5 w-3.5" />
              {(blog.views || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}