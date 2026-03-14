import BlogCard from '@/components/blog/BlogCard';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function LatestBlogsGrid({ blogs, title = 'Latest Articles' }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span className="h-6 w-1 bg-primary rounded-full shadow-lg shadow-primary/20" />
            {title}
          </h2>
        </div>
        <Link
          href="/blog"
          className="group hidden items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-all sm:flex"
        >
          <span>Library</span>
          <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Articles Grid - Balanced */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {blogs.slice(0, 8).map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            categoryColor={blog.categoryColor || 'oklch(60% 0.15 250)'}
          />
        ))}
      </div>

      {/* Mobile view all link */}
      <div className="flex justify-center pt-3 sm:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white dark:text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          Full Archive <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
