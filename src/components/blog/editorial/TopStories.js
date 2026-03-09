import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { FiArrowRight, FiClock, FiEye } from 'react-icons/fi';

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

export default function TopStories({ blogs, getCategoryColor }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-1 rounded-full bg-orange-500" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase sm:text-xl">
            Top Stories
          </h2>
        </div>
        <Link
          href="/blog?sort=popular"
          className="group flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          <span>View All</span>
          <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
        {blogs.map((blog) => {
          const categoryName = blog.category?.name || blog.category;
          const categorySlug = slugify(categoryName);
          const href = `/blog/${categorySlug}/${blog.slug}`;
          const imageUrl = fixUnsplashUrl(blog.featuredImage);
          const categoryColor = getCategoryColor(blog.category?.name || blog.category?._id || blog.category);

          return (
            <article key={blog._id} className="group">
              {/* Image */}
              <Link href={href} className="relative block aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <Image
                  src={imageUrl}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {categoryName}
                  </span>
                </div>

                {/* Reading time */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                  <FiClock className="h-3 w-3" />
                  <span>{blog.readingTime ? `${blog.readingTime} min` : calculateReadingTime(blog.content)}</span>
                </div>
              </Link>

              {/* Content */}
              <div className="space-y-2.5 pt-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                  <span className="text-orange-600 dark:text-orange-400">
                    {blog.tags?.[0]?.name || blog.tags?.[0] || categoryName}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-400 dark:text-slate-500">{formatDate(blog.createdAt)}</span>
                </div>

                <Link href={href} className="block">
                  <h3 className="text-base font-bold leading-snug tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-orange-600 sm:text-lg lg:text-xl">
                    {blog.title}
                  </h3>
                </Link>

                <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {blog.excerpt || 'Discover practical tips and expert guidance in this insightful article.'}
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 dark:text-slate-500">
                  <FiEye className="h-3 w-3" />
                  <span>{(blog.views || 0).toLocaleString()} views</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}