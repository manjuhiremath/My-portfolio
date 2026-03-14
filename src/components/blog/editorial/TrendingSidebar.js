import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { FiTrendingUp, FiClock, FiTag, FiArrowRight } from 'react-icons/fi';

import { SkeletonTrendingSidebar } from '../BlogSkeletons';

export default function TrendingSidebar({ trendingBlogs, recentBlogs, popularTags, loading = false }) {
  if (loading) return <SkeletonTrendingSidebar />;
  return (
    <div className="space-y-6">
      {/* Trending / Most Read Section */}
      <section className="rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-5 shadow-lg dark:shadow-2xl transition-all hover:shadow-primary/5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-6 w-6 rounded-full bg-primary/20 dark:bg-primary/20 flex items-center justify-center text-primary shadow-sm">
            <FiTrendingUp className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white font-display">
            Trending <span className="text-primary opacity-50">Now</span>
          </h2>
        </div>
        <div className="space-y-4">
          {(trendingBlogs || []).slice(0, 5).map((blog, index) => {
            const categoryName = blog.category?.name || blog.category;
            const categorySlug = slugify(categoryName);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group flex items-start gap-3">
                <span className="flex-shrink-0 text-lg font-black text-primary/30 dark:text-primary/30 group-hover:text-primary/60 transition-colors leading-none font-display">
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-1">
                  <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors font-display">
                    {blog.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">
                    <span className="text-primary/80">{categoryName}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span>{(blog.views || 0).toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fresh Feed */}
      <section className="rounded-xl bg-white dark:bg-gray-900 p-5 border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-xl transition-all hover:shadow-primary/5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-primary shadow-sm">
            <FiClock className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white font-display">
            The <span className="text-primary">Latest</span>
          </h2>
        </div>
        <div className="space-y-5">
          {(recentBlogs || []).map((blog) => {
            const categoryName = blog.category?.name || blog.category;
            const categorySlug = slugify(categoryName);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group block space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {categoryName}
                  </p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <h3 className="line-clamp-2 text-[12px] font-bold leading-snug text-gray-800 dark:text-white group-hover:text-primary/80 transition-colors font-display">
                  {blog.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tags */}
      <section className="rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-5 shadow-lg dark:shadow-soft transition-all hover:shadow-primary/5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-6 w-6 rounded-full bg-primary/20 dark:bg-primary/20 flex items-center justify-center text-primary shadow-sm">
            <FiTag className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white font-display">
            Popular <span className="text-primary opacity-50">Tags</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(popularTags || []).map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest transition-all hover:border-primary/50 hover:text-primary hover:bg-primary/5 dark:hover:bg-gray-800 shadow-sm"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
