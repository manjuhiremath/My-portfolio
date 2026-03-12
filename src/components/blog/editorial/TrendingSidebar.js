import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { FiTrendingUp, FiClock, FiTag, FiArrowRight } from 'react-icons/fi';

export default function TrendingSidebar({ trendingBlogs, recentBlogs, popularTags }) {
  return (
    <div className="space-y-10">
      {/* Trending / Most Read Section */}
      <section className="rounded-[2rem] bg-white dark:bg-slate-800/50 p-8 border border-slate-100 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-8">
          <FiTrendingUp className="h-5 w-5 text-orange-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
            Most Popular
          </h2>
        </div>
        <div className="space-y-8">
          {(trendingBlogs || []).slice(0, 5).map((blog, index) => {
            const categoryName = blog.category?.name || blog.category;
            const categorySlug = slugify(categoryName);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group flex items-start gap-4">
                <span className="flex-shrink-0 text-2xl font-black text-slate-100 dark:text-slate-800 transition-colors">
                  0{index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-black leading-tight text-slate-900 dark:text-slate-100 transition-colors">
                    {blog.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
      <section className="rounded-[2rem] bg-slate-900 p-8 border border-slate-800 shadow-2xl transition-all">
        <div className="flex items-center gap-3 mb-8">
          <FiClock className="h-5 w-5 text-orange-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">
            Fresh Feed
          </h2>
        </div>
        <div className="space-y-8">
          {(recentBlogs || []).map((blog) => {
            const categoryName = blog.category?.name || blog.category;
            const categorySlug = slugify(categoryName);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group block">
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2">
                  {categoryName}
                </p>
                <h3 className="line-clamp-2 text-sm font-black leading-tight text-white transition-colors">
                  {blog.title}
                </h3>
                <p className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tags */}
      <section className="rounded-[2rem] bg-white dark:bg-slate-800/50 p-8 border border-slate-100 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <FiTag className="h-5 w-5 text-orange-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
            Explore Tags
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(popularTags || []).map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-all"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>

      {/* Modern Newsletter Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-rose-600 p-10 text-white shadow-2xl shadow-orange-500/20">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h4 className="text-2xl font-black tracking-tight leading-tight">Join the <span className="underline decoration-white/30">Manifesto.</span></h4>
          <p className="mt-4 text-sm font-medium text-orange-50 mb-8 leading-relaxed opacity-90">Deep tech insights, architecture patterns, and design engineering delivered weekly.</p>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="w-full rounded-2xl bg-white/10 border border-white/20 px-5 py-4 text-sm text-white placeholder:text-orange-100 outline-none transition-all focus:bg-white/20 focus:ring-2 focus:ring-white/50"
            />
            <button className="w-full rounded-2xl bg-white py-4 text-xs font-black text-orange-600 uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}