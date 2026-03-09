import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { FiClock, FiArrowRight } from 'react-icons/fi';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateReadingTime(content) {
  if (!content) return '5 min read';
  const wordsPerMinute = 200;
  const text = typeof content === 'string' ? content : '';
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export default function FeaturedHero({ blog, categoryColor = '#6366f1' }) {
  if (!blog) return null;

  const categoryName = blog.category?.name || blog.category;
  const categorySlug = slugify(categoryName);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  return (
    <article className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 lg:rounded-3xl border border-slate-100 dark:border-slate-700">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Image Side - 7 columns */}
        <div className="relative aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[480px] xl:min-h-[520px]">
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black/60" />

          {/* Category badge on image - Mobile */}
          <div className="absolute top-4 left-4 lg:hidden">
            <Link
              href={`/blog?category=${encodeURIComponent(categoryName)}`}
              className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryName}
            </Link>
          </div>
        </div>

        {/* Content Side - 5 columns */}
        <div className="flex flex-col justify-center p-5 sm:p-6 lg:col-span-5 lg:p-8 xl:p-10">
          <div className="space-y-4 lg:space-y-5">
            {/* Label */}
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: categoryColor }} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Featured Article</span>
            </div>

            {/* Category badge - Desktop */}
            <div className="hidden lg:block">
              <Link
                href={`/blog?category=${encodeURIComponent(categoryName)}`}
                className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: categoryColor }}
              >
                {categoryName}
              </Link>
            </div>

            {/* Headline */}
            <Link href={href} className="group block">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-orange-600 sm:text-2xl lg:text-2xl xl:text-3xl">
                {blog.title}
              </h1>
            </Link>

            {/* Excerpt */}
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base lg:line-clamp-3">
              {blog.excerpt || 'Explore this featured article to stay ahead in the industry with expert insights and practical guidance.'}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-700">
                  <Image
                    src="/Profilemanju.jpeg"
                    alt="Manjunath M"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Manjunath M</span>
              </div>

              <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>

              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <FiClock className="h-4 w-4" />
                <span className="text-sm">{blog.readingTime ? `${blog.readingTime} min read` : calculateReadingTime(blog.content)}</span>
              </div>
            </div>

            {/* Date */}
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {formatDate(blog.createdAt)}
            </p>

            {/* CTA */}
            <div className="pt-2">
              <Link
                href={href}
                className="group inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-5 py-3 text-sm font-bold uppercase tracking-wide text-white dark:text-slate-900 transition-all hover:bg-orange-600 hover:text-white hover:shadow-lg active:scale-[0.98] sm:px-6"
              >
                Read Article
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}