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

import { SkeletonBlogCard } from '../BlogSkeletons';

export default function FeaturedHero({ blog, categoryColor = 'oklch(70% 0.18 45)', loading = false }) {
  if (loading) return <SkeletonBlogCard variant="featured" />;
  if (!blog) return null;

  const categoryName = blog.category?.name || blog.category;
  const categorySlug = slugify(categoryName);
  const href = `/blog/${categorySlug}/${blog.slug}`;
  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  return (
    <article className="group relative overflow-hidden rounded-xl bg-gray-700 border border-gray-800 shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px] lg:min-h-[350px] m-2 bg-gray-900 rounded-xl border-2 border-gray-700">
        {/* Content Side - 5 columns */}
        <div className="relative z-20 flex flex-col justify-center p-4 sm:p-6 lg:col-span-5 lg:p-8 order-2 lg:order-1">
          <div className="space-y-3 lg:space-y-4">
            <Link href={href} className="block group/title">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-white transition-colors sm:text-xl lg:text-xl group-hover/title:text-primary line-clamp-2 font-display">
                {blog.title}
              </h1>
            </Link>

            <p className="line-clamp-2 text-xs leading-relaxed text-gray-400 font-medium max-w-xl">
              {blog.excerpt || 'Access the technical documentation and strategic analysis behind this priority manifesto.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  {blog.readingTime ? `${blog.readingTime} MIN` : calculateReadingTime(blog.content)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={href}
                className="group/btn inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-[9px] font-bold uppercase tracking-wide text-gray-900 shadow-lg transition-all hover:scale-[1.02] hover:bg-primary hover:text-white active:scale-[0.98]"
              >
                Read More
                <FiArrowRight className="h-3 w-3 transition-transform group-hover/btn:trangray-x-0.5" />
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
            className="object-fit transition-transform rounded-xl duration-[2000ms] group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent lg:bg-gradient-to-r lg:from-gray-900 lg:via-transparent lg:to-transparent" />
        </div>
      </div>
    </article>
  );
}