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

function cleanExcerpt(text = '') {
  if (!text) return 'Practical insights and guidance.';
  let clean = text.replace(/```(?:html)?/gi, '').replace(/```/g, '');
  clean = stripHtml(clean);
  if (clean.length > 100) clean = clean.substring(0, 97) + '...';
  return clean;
}

export default function BlogCard({ blog, categoryColor = '#6366f1', variant = 'default' }) {
  if (!blog) return null;

  const categoryValue = blog.category?.name || blog.category || 'Uncategorized';
  const categorySlug = slugify(categoryValue);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group flex gap-2 items-start py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 -mx-1 px-1 rounded-lg transition-colors"
      >
        <div className="relative w-12 h-10 flex-shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-700">
          <Image
            src={imageUrl}
            alt={blog.title || 'Blog post'}
            fill
            sizes="48px"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="line-clamp-2 text-xs font-bold leading-tight text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition-colors">
            {blog.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span style={{ color: categoryColor }}>{categoryValue}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-700">
        <Image
          src={imageUrl}
          alt={blog.title || 'Blog post'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        <div className="absolute top-2 left-2">
          <span
            className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-sm backdrop-blur-md border border-white/10"
            style={{ backgroundColor: `${categoryColor}CC` }}
          >
            {categoryValue}
          </span>
        </div>

        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-md border border-white/5">
          <FiClock className="h-2.5 w-2.5" />
          <span>{blog.readingTime ? `${blog.readingTime}m` : calculateReadingTime(blog.content)}</span>
        </div>
      </div>

      <div className="p-2.5 sm:p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
        </div>

        <h3 className="line-clamp-2 text-xs sm:text-sm font-bold leading-tight tracking-tight text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-orange-600">
          {blog.title}
        </h3>

        <p className="mt-1.5 hidden sm:line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          {cleanExcerpt(blog.excerpt)}
        </p>

        <div className="mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-2">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <FiEye className="h-2.5 w-2.5" />
              {(blog.views || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
