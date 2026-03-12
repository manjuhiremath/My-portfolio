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
    <section className="space-y-10">
      {/* Stories Grid */}
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:gap-12">
        {blogs.map((blog) => {
          const categoryName = blog.category?.name || blog.category;
          const categorySlug = slugify(categoryName);
          const href = `/blog/${categorySlug}/${blog.slug}`;
          const imageUrl = fixUnsplashUrl(blog.featuredImage);
          const categoryColor = getCategoryColor(blog.category?.name || blog.category?._id || blog.category);

          return (
            <article key={blog._id} className="group relative">
              {/* Image Container */}
              <Link href={href} className="relative block aspect-[16/10] overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-800 shadow-sm transition-all duration-500">
                <Image
                  src={imageUrl}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-500" />

                {/* Badges */}
                <div className="absolute top-4 left-4">
                  <span
                    className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md border border-white/20"
                    style={{ backgroundColor: `${categoryColor}CC` }}
                  >
                    {categoryName}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-[9px] font-bold text-white backdrop-blur-md border border-white/10">
                  <FiClock className="h-3 w-3" />
                  <span>{blog.readingTime ? `${blog.readingTime} min` : calculateReadingTime(blog.content)}</span>
                </div>
              </Link>

              {/* Content */}
              <div className="pt-6 px-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                    {formatDate(blog.createdAt)}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {(blog.views || 0).toLocaleString()} Views
                  </span>
                </div>

                <Link href={href} className="block">
                  <h3 className="text-xl font-black leading-tight tracking-tight text-slate-900 dark:text-white transition-colors duration-300 lg:text-2xl">
                    {blog.title}
                  </h3>
                </Link>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                  {blog.excerpt || 'Discover practical tips and expert guidance in this insightful article.'}
                </p>
                
                <div className="mt-6 flex items-center gap-2">
                  <Link href={href} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white border-b-2 border-orange-500 pb-0.5 transition-all flex items-center group/more">
                    Read Story <FiArrowRight className="ml-2" />
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