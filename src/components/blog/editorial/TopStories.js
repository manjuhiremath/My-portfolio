import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { FiArrowRight, FiClock } from 'react-icons/fi';

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

export default function TopStories({ blogs, getCategoryColor }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Stories Grid - More compact */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
        {blogs.map((blog) => {
          const categoryName = blog.category?.name || blog.category;
          const categorySlug = slugify(categoryName);
          const href = `/blog/${categorySlug}/${blog.slug}`;
          const imageUrl = fixUnsplashUrl(blog.featuredImage);
          const categoryColor = getCategoryColor(blog.category?.name || blog.category?._id || blog.category);

          return (
            <article key={blog._id} className="group relative">
              {/* Image Container - Slightly shorter aspect */}
              <Link href={href} className="relative block aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-sm transition-all duration-500 hover:shadow-md">
                <Image
                  src={imageUrl}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 left-3">
                  <span
                    className="rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md border border-white/10"
                    style={{ backgroundColor: `${categoryColor}CC` }}
                  >
                    {categoryName}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/40 px-2 py-0.5 text-[8px] font-bold text-white backdrop-blur-md border border-white/5">
                  <FiClock className="h-3 w-3" />
                  <span>{blog.readingTime ? `${blog.readingTime}m` : calculateReadingTime(blog.content)}</span>
                </div>
              </Link>

              {/* Content - Tightened */}
              <div className="pt-4 px-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500">
                    {formatDate(blog.createdAt)}
                  </span>
                  <span className="h-0.5 w-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {(blog.views || 0).toLocaleString()} Views
                  </span>
                </div>

                <Link href={href} className="block">
                  <h3 className="text-lg font-black leading-tight tracking-tight text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-orange-600">
                    {blog.title}
                  </h3>
                </Link>

                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                  {blog.excerpt || 'Insightful article with practical tips and expert guidance.'}
                </p>
                
                <div className="mt-4 flex items-center gap-2">
                  <Link href={href} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white border-b border-orange-500 pb-0.5 transition-all flex items-center group/more">
                    Read Story <FiArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover/more:translate-x-1" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
