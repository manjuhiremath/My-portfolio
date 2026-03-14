import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { FiTrendingUp, FiClock, FiTag, FiArrowRight } from 'react-icons/fi';

export default function TrendingSidebar({ trendingBlogs, recentBlogs, popularTags }) {
  return (
    <div className="space-y-4">
      {/* Trending / Most Read Section */}
      <section className="rounded-lg bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-100 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <FiTrendingUp className="h-2.5 w-2.5" />
          </div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Trending
          </h2>
        </div>
        <div className="space-y-3">
          {(trendingBlogs || []).slice(0, 5).map((blog, index) => {
            const categoryName = blog.category?.name || blog.category;
            const categorySlug = slugify(categoryName);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group flex items-start gap-2">
                <span className="flex-shrink-0 text-xs font-bold text-slate-800 dark:text-slate-300  transition-colors leading-none pt-0.5">
                  0{index + 1}
                </span>
                <div className="min-w-0 space-y-1">
                  <h3 className="line-clamp-2 text-[11px] font-bold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-primary">{categoryName}</span>
                    <span>{(blog.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fresh Feed */}
      <section className="rounded-lg bg-slate-900 p-4 border border-slate-800 shadow-lg transition-all">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 rounded-full bg-white/5 flex items-center justify-center text-primary shadow-sm">
            <FiClock className="h-2.5 w-2.5" />
          </div>
          <h2 className="text-[8px] font-bold uppercase tracking-wider text-white">
            Recent
          </h2>
        </div>
        <div className="space-y-3">
          {(recentBlogs || []).map((blog) => {
            const categoryName = blog.category?.name || blog.category;
            const categorySlug = slugify(categoryName);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group block space-y-1">
                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">
                  {categoryName}
                </p>
                <h3 className="line-clamp-2 text-[10px] font-bold leading-snug text-white group-hover:text-gray-400  transition-colors">
                  {blog.title}
                </h3>
                <p className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tags */}
      <section className="rounded-lg bg-white dark:bg-slate-800/30 p-4 border border-slate-100 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <FiTag className="h-2.5 w-2.5" />
          </div>
          <h2 className="text-[8px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Tags
          </h2>
        </div>
        <div className="flex flex-wrap gap-1">
          {(popularTags || []).map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 text-[7px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-all hover:border-primary hover:text-primary hover:bg-white dark:hover:bg-slate-800 shadow-sm"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Card */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 text-center space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-bold tracking-tight leading-tight uppercase font-display">Join the <span className="text-primary italic">Manifesto.</span></h4>
            <p className="text-[8px] font-medium text-slate-400 leading-relaxed max-w-[20ch] mx-auto">Deep tech insights weekly.</p>
          </div>
          <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email..."
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[9px] text-white placeholder:text-slate-600 outline-none transition-all focus:bg-white/10 focus:border-primary/50 shadow-inner"
            />
            <button className="btn btn-primary w-full py-2 text-[8px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
