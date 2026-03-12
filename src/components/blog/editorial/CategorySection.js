import Link from 'next/link';
import BlogCard from '@/components/blog/BlogCard';
import { FiArrowRight } from 'react-icons/fi';

export default function CategorySection({ category, blogs, categoryColor = '#f97316' }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex items-end justify-between px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-10 rounded-full animate-pulse" style={{ backgroundColor: categoryColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Section Portfolio</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {category} <span className="text-slate-200 dark:text-slate-800 ml-2">/ {blogs.length}</span>
          </h2>
        </div>
        <Link
          href={`/blog?category=${encodeURIComponent(category)}`}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors mb-1"
        >
          <span>Explore All</span>
          <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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