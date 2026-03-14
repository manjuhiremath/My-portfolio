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
    <section className="space-y-4">
      {/* Stories Grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:gap-4">
        {blogs.map((blog) => {
          const categoryName = blog.category?.name || blog.category;
          const categorySlug = slugify(categoryName);
          const href = `/blog/${categorySlug}/${blog.slug}`;
          const imageUrl = fixUnsplashUrl(blog.featuredImage);
          const categoryColor = getCategoryColor(blog.category?.name || blog.category?._id || blog.category);

          return (
            <article key={blog._id} className="group relative">
              {/* Image Container */}
              <Link href={href} className="relative block aspect-[25/10] overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 shadow-sm transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
                <Image
                  src={imageUrl}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 30vw"
                  className="object-fit transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                <div className="absolute top-2 left-2">
                  <span
                    className="rounded-md px-2 py-1 text-[7px]  font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-xl border border-white/10"
                    style={{ backgroundColor: `${categoryColor}CC` }}
                  >
                    {categoryName}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-white backdrop-blur-xl border border-white/5 shadow-lg">
                  <FiClock className="h-2.5 w-2.5" />
                  <span>{blog.readingTime ? `${blog.readingTime}M` : calculateReadingTime(blog.content)}</span>
                </div>
              </Link>

              {/* Content */}
              <div className="pt-3 px-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-primary">
                    {formatDate(blog.createdAt)}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-gray-800">
                    {(blog.views || 0).toLocaleString()} views
                  </span>
                </div>

                <Link href={href} className="block group/title">
                  <h3 className="text-sm font-bold leading-tight tracking-tight text-slate-900 dark:text-white transition-all duration-300 group-hover/title:text-primary font-display line-clamp-2">
                    {blog.title}
                  </h3>
                </Link>

                <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium max-w-prose">
                  {blog.excerpt || 'Access the technical documentation and strategic analysis behind this manifesto.'}
                </p>
                
                <div className="pt-1 flex justify-end">
                  <Link href={href} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-primary pb-0.5 transition-all hover:gap-2 group/link">
                    Read <FiArrowRight className="h-2.5 w-2.5 transition-transform group-hover/link:translate-x-0.5" />
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
