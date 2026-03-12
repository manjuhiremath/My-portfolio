import Link from 'next/link';
import BlogCard from '@/components/blog/BlogCard';
import { FiArrowRight } from 'react-icons/fi';

export default function CategorySection({ category, blogs, categoryColor = '#f97316' }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full" style={{ backgroundColor: categoryColor }} />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Section</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {category} <span className="text-slate-300 dark:text-slate-700 ml-1">/ {blogs.length}</span>
          </h2>
        </div>
        <Link
          href={`/blog?category=${encodeURIComponent(category)}`}
          className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors mb-1"
        >
          <span>Explore</span>
          <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Articles Grid - Dense */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {blogs.slice(0, 5).map((blog) => (
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
