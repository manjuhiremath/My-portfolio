import Link from 'next/link';
import BlogCard from '@/components/blog/BlogCard';
import { FiArrowRight } from 'react-icons/fi';

export default function CategorySection({ category, blogs, categoryColor = '#f97316' }) {
  if (!blogs || blogs.length === 0) return null;
  
  const categoryName = typeof category === 'object' ? category?.name || 'Uncategorized' : (category || 'Uncategorized');

  return (
    <section className="space-y-2">
      {/* Section Header */}
      <div className="flex items-end justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-md font-black tracking-tight text-gray-900 dark:text-white uppercase">
            {categoryName} <span className="text-gray-500 dark:text-gray-300 ml-1">/ {blogs.length}</span>
          </h2>
        </div>
        <Link
          href={`/blog?category=${encodeURIComponent(categoryName)}`}
          className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-primary transition-colors mb-1"
        >
          <span>Explore</span>
          <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:trangray-x-1" />
        </Link>
      </div>

      {/* Articles Grid - Balanced */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
