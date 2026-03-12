import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { FiTrendingUp, FiClock, FiTag, FiArrowRight } from 'react-icons/fi';

export default function TrendingSidebar({ trendingBlogs, recentBlogs, popularTags }) {
  return (
    <div className="space-y-6">
      {/* Trending / Most Read Section */}
      <section className="rounded-2xl bg-white dark:bg-slate-800/50 p-5 border border-slate-100 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-5">
          <FiTrendingUp className="h-4 w-4 text-orange-500" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
            Most Popular
          </h2>
        </div>
        <div className="space-y-5">
          {(trendingBlogs || []).slice(0, 5).map((blog, index) => {
            const categoryName = blog.category?.name || blog.category;
            const categorySlug = slugify(categoryName);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group flex items-start gap-3">
                <span className="flex-shrink-0 text-xl font-black text-slate-100 dark:text-slate-800 group-hover:text-orange-500/20 transition-colors">
                  0{index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-xs font-black leading-tight text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition-colors">
                    {blog.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="text-orange-500">{categoryName}</span>
                    <span>·</span>
                    <span>{(blog.views || 0).toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fresh Feed */}
      <section className="rounded-2xl bg-slate-900 p-5 border border-slate-800 shadow-xl transition-all">
        <div className="flex items-center gap-2 mb-5">
          <FiClock className="h-4 w-4 text-orange-500" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
            Fresh Feed
          </h2>
        </div>
        <div className="space-y-5">
          {(recentBlogs || []).map((blog) => {
            const categoryName = blog.category?.name || blog.category;
            const categorySlug = slugify(categoryName);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group block">
                <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1.5">
                  {categoryName}
                </p>
                <h3 className="line-clamp-2 text-xs font-black leading-tight text-white group-hover:text-orange-400 transition-colors">
                  {blog.title}
                </h3>
                <p className="mt-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tags */}
      <section className="rounded-2xl bg-white dark:bg-slate-800/50 p-5 border border-slate-100 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <FiTag className="h-4 w-4 text-orange-500" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
            Explore Tags
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(popularTags || []).map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-all hover:border-orange-500 hover:text-orange-600"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>

      {/* Modern Newsletter Card - Tightened */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 text-center">
          <h4 className="text-lg font-black tracking-tight leading-tight">Join the Manifesto.</h4>
          <p className="mt-2 text-xs font-medium text-orange-50 mb-5 leading-relaxed opacity-90">Architecture patterns and design engineering weekly.</p>
          <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email..."
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs text-white placeholder:text-orange-100 outline-none transition-all focus:bg-white/20"
            />
            <button className="w-full rounded-xl bg-white py-2.5 text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
