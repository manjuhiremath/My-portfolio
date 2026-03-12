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

export default function FeaturedHero({ blog, categoryColor = '#f97316' }) {
  if (!blog) return null;

  const categoryName = blog.category?.name || blog.category;
  const categorySlug = slugify(categoryName);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  return (
    <article className="group relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-500 hover:shadow-orange-500/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[600px]">
        {/* Content Side - 5 columns */}
        <div className="relative z-20 flex flex-col justify-center p-8 sm:p-10 lg:col-span-5 lg:p-12 xl:p-16 order-2 lg:order-1">
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: categoryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Featured Insight</span>
            </div>

            <Link href={href} className="block">
              <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-white transition-colors group-hover:text-orange-500 sm:text-4xl lg:text-4xl xl:text-5xl">
                {blog.title}
              </h1>
            </Link>

            <p className="line-clamp-3 text-base leading-relaxed text-slate-400 font-medium max-w-lg">
              {blog.excerpt || 'Explore this featured article to stay ahead in the industry with expert insights and practical guidance.'}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{formatDate(blog.createdAt)}</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <FiClock className="h-4 w-4 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{blog.readingTime ? `${blog.readingTime} min` : calculateReadingTime(blog.content)}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href={href}
                className="group/btn inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-all hover:bg-orange-500 hover:text-white hover:-translate-y-1 active:scale-95 shadow-xl shadow-white/5 hover:shadow-orange-500/20"
              >
                Deep Dive
                <FiArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Image Side - 7 columns */}
        <div className="relative lg:col-span-7 order-1 lg:order-2 overflow-hidden">
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            priority
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:via-transparent lg:to-transparent" />
          
          <div className="absolute top-8 right-8">
            <div className="px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                {categoryName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}