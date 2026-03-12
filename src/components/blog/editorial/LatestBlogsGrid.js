import BlogCard from '@/components/blog/BlogCard';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import Link from 'next/link';

export default function LatestBlogsGrid({ blogs, title = 'Latest Articles' }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-10">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-4">
            <span className="h-8 w-1.5 bg-orange-500 rounded-full" />
            {title}
          </h2>
        </div>
        <Link
          href="/blog"
          className="group hidden items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 sm:flex"
        >
          <span>See Library</span>
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {blogs.slice(0, 6).map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            categoryColor={blog.categoryColor || '#f97316'}
          />
        ))}
      </div>

      {/* Mobile view all link */}
      <div className="flex justify-center pt-4 sm:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white dark:text-slate-900 shadow-xl active:scale-95"
        >
          View Full Archive <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}