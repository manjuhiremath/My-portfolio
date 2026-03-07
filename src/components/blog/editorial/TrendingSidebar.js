import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { FiTrendingUp, FiClock, FiTag, FiArrowRight } from 'react-icons/fi';

export default function TrendingSidebar({ trendingBlogs, recentBlogs, popularTags }) {
  return (
    <div className="space-y-6">
      {/* Trending / Most Read Section */}
      <section className="rounded-xl bg-white p-5 shadow-sm shadow-slate-100 border border-slate-100">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FiTrendingUp className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            Trending Now
          </h2>
        </div>
        <div className="divide-y divide-slate-100 pt-3">
          {(trendingBlogs || []).slice(0, 5).map((blog, index) => {
            const categorySlug = slugify(blog.category);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-orange-600 text-[10px] font-bold text-white shadow-sm">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-orange-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {blog.category} · {(blog.views || 0).toLocaleString()} views
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="rounded-xl bg-white p-5 shadow-sm shadow-slate-100 border border-slate-100">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FiClock className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            Fresh Posts
          </h2>
        </div>
        <div className="divide-y divide-slate-100 pt-3">
          {(recentBlogs || []).map((blog) => {
            const categorySlug = slugify(blog.category);
            const href = `/blog/${categorySlug}/${blog.slug}`;

            return (
              <Link key={blog._id} href={href} className="group block py-2.5 first:pt-0 last:pb-0">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                  {blog.category}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-orange-600 transition-colors">
                  {blog.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-400 font-medium">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </Link>
            );
          })}
        </div>
        <Link
          href="/blog"
          className="group mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          View All Recent <FiArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>

      {/* Popular Tags Section — Issue 2: Link to /blog/tag/[tag] */}
      <section className="rounded-xl bg-white p-5 shadow-sm shadow-slate-100 border border-slate-100">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FiTag className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            Popular Tags
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 pt-3">
          {(popularTags || []).map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Card */}
      <div className="rounded-xl bg-gradient-to-br from-gray-500 via-gray-700 to-gray-800 p-6 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
          <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em]">Newsletter</p>
        <h4 className="mt-2 text-lg font-bold text-white">Stay Updated</h4>
        <p className="mt-2 text-sm text-white font-semibold">Get the latest articles delivered weekly.</p>
        <form className="mt-5 flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-white outline-none transition-all focus:ring-2 focus:ring-orange-500/50 border border-gray-200/50"
          />
          <button className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white uppercase tracking-wide transition-all hover:bg-orange-600 hover:shadow-lg active:scale-[0.98]">
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}