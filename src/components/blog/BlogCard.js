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


export default function BlogCard({ blog, categoryColor = 'oklch(60% 0.15 250)', variant = 'default' }) {
  if (!blog) return null;

  const categoryValue = blog.category?.name || blog.category || 'Uncategorized';
  const categorySlug = slugify(categoryValue);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group flex gap-2 items-start py-1 border-b border-gray-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-1 rounded-md transition-all"
      >
        <div className="relative w-16 h-12 flex-shrink-0 overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-800 shadow-sm">
          <Image
            src={imageUrl}
            alt={blog.title || 'Manifesto'}
            fill
            sizes="64px"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <span style={{ color: categoryColor }}>{categoryValue}</span>
            <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-md bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-800/50 shadow-soft transition-all duration-500 hover:shadow-md "
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={imageUrl}
          alt={blog.title || 'Digital Manifesto'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

        <div className="absolute top-4 left-4">
          <span
            className="rounded-full px-1 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl backdrop-blur-md border border-white/10"
            style={{ backgroundColor: `${categoryColor}CC` }}
          >
            {categoryValue}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white backdrop-blur-md border border-white/5 shadow-lg">
          <FiClock className="h-3 w-3" />
          <span>{blog.readingTime ? `${blog.readingTime}m` : calculateReadingTime(blog.content)}</span>
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-1">
       

        <h3 className="line-clamp-2 h-10 sm:h-12  text-base font-bold leading-snug tracking-tight text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-primary">
          {blog.title}
        </h3>

        <p className="line-clamp-3 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          {blog.excerpt}
        </p>

        <div className="pt-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-800/50">
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1.5">
              <FiEye className="h-3 w-3 text-gray-500 dark:text-slate-600" />
              {(blog.views || 0).toLocaleString()}
            </span>
             {/* <div className="flex items-center gap-2"> */}
          <span className="text-[9px] font-black tracking-[0.1em] text-primary">
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
        {/* </div> */}
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-primary opacity-70 -translate-x-2 group-hover:opacity-100  transition-all duration-300">
            Access →
          </span>
        </div>
      </div>
    </Link>
  );
}
