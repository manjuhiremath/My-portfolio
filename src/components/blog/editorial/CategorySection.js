import Link from 'next/link';
import BlogCard from '@/components/blog/BlogCard';
import { FiArrowRight } from 'react-icons/fi';

export default function CategorySection({ category, blogs, categoryColor }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-1 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase sm:text-xl">
            {category}
          </h2>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {blogs.length}
          </span>
        </div>
        <Link
          href={`/blog?category=${encodeURIComponent(category)}`}
          className="group flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          <span className="hidden sm:inline">View All</span>
          <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {blogs.slice(0, 4).map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            categoryColor={categoryColor}
          />
        ))}
      </div>
    </section>
  );
}