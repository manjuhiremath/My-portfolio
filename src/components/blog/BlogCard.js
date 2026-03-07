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

  const categorySlug = slugify(blog.category);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  // Compact variant for sidebar
  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group flex gap-3 items-start py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
      >
        <div className="relative w-16 h-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
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
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900 group-hover:text-orange-600 transition-colors">
            {blog.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
            <span className="font-medium" style={{ color: categoryColor }}>{blog.category}</span>
            <span className="text-slate-300">·</span>
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
      className="group block overflow-hidden rounded-xl bg-white shadow-sm shadow-slate-100 border border-slate-100 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={imageUrl}
          alt={blog.title || 'Blog post'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm"
            style={{ backgroundColor: categoryColor }}
          >
            {blog.category || 'General'}
          </span>
        </div>

        {/* Reading time badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          <FiClock className="h-3 w-3" />
          <span>{blog.readingTime ? `${blog.readingTime} min` : calculateReadingTime(blog.content)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-orange-600 sm:text-lg">
          {blog.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {cleanExcerpt(blog.excerpt)}
        </p>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {blog.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-100"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wide" style={{ color: categoryColor }}>
            {blog.category || 'Insights'}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FiEye className="h-3 w-3" />
              {(blog.views || 0).toLocaleString()}
            </span>
            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}