import BlogCard from '@/components/blog/BlogCard';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function LatestBlogsGrid({ blogs, title = 'Latest Articles' }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
            <span className="h-6 w-1 bg-orange-500 rounded-full" />
            {title}
          </h2>
        </div>
        <Link
          href="/blog"
          className="group hidden items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors sm:flex"
        >
          <span>See Library</span>
          <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Articles Grid - More dense */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {blogs.slice(0, 8).map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            categoryColor={blog.categoryColor || '#f97316'}
          />
        ))}
      </div>

      {/* Mobile view all link */}
      <div className="flex justify-center pt-2 sm:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white dark:text-slate-900 transition-all hover:bg-orange-500 hover:text-white active:scale-95"
        >
          Full Archive <FiArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
