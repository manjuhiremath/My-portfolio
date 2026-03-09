import BlogCard from '@/components/blog/BlogCard';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import Link from 'next/link';

export default function LatestBlogsGrid({ blogs, title = 'Latest Articles' }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white">
            <FiClock className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase sm:text-xl">
            {title}
          </h2>
        </div>
        <Link
          href="/blog"
          className="group hidden items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors sm:flex"
        >
          <span>View All</span>
          <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {blogs.slice(0, 6).map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            categoryColor={blog.categoryColor || '#6366f1'}
          />
        ))}
      </div>

      {/* Mobile view all link */}
      <div className="flex justify-center pt-2 sm:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white dark:text-slate-900 transition-all hover:bg-orange-600 hover:text-white"
        >
          View All Articles <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}