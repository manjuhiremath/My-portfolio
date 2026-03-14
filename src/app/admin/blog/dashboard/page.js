'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { 
  FiDownload, 
  FiFilter, 
  FiPlus, 
  FiRefreshCw, 
  FiZap, 
  FiBook, 
  FiCheckCircle, 
  FiEye, 
  FiLayout, 
  FiTarget, 
  FiTrendingUp,
  FiArrowRight,
  FiMoreHorizontal
} from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminMetricCard from '@/components/admin/ui/AdminMetricCard';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';
import { motion } from 'framer-motion';

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getSeoVariant(score) {
  if (score >= 90) return 'success';
  if (score >= 70) return 'info';
  if (score >= 50) return 'warning';
  return 'danger';
}

const MiniSparkline = ({ data, max, color = 'bg-primary' }) => (
  <div className="flex items-end gap-0.5 h-8 w-24">
    {data.map((v, i) => (
      <div 
        key={i} 
        className={`flex-1 ${color} opacity-40 rounded-t-[1px]`} 
        style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
      />
    ))}
  </div>
);

export default function AdminDashboardPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  async function loadStats() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }
      setPayload(data.data || data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const metrics = payload?.metrics;
  const recentBlogs = payload?.recentBlogs;
  const monthlyViews = payload?.monthlyViews || [];
  const topArticles = payload?.topArticles || [];
  const seoDistribution = payload?.seoScoreDistribution || [];

  const filteredRecentBlogs = useMemo(() => {
    return (recentBlogs || []).filter((blog) => {
      const searchMatch =
        !query ||
        blog.title?.toLowerCase().includes(query.toLowerCase()) ||
        blog.slug?.toLowerCase().includes(query.toLowerCase());
      const statusMatch =
        status === 'all' ||
        (status === 'published' && blog.published) ||
        (status === 'draft' && !blog.published);
      return searchMatch && statusMatch;
    });
  }, [query, recentBlogs, status]);

  const maxMonthlyViews = Math.max(...monthlyViews.map((item) => item.views || 0), 1);
  const maxSeoDistribution = Math.max(...seoDistribution.map((item) => item.count || 0), 1);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      <AdminPageHeader
        title="Institutional Dashboard"
        description="Command center for high-performance content orchestration."
        actions={[
          {
            label: 'AI Generator',
            href: '/admin/blog/blogs/generate',
            icon: <FiZap className="h-3.5 w-3.5" />,
            variant: 'primary',
          },
          {
            label: 'New Manifesto',
            href: '/admin/blog/blogs/create',
            icon: <FiPlus className="h-3.5 w-3.5" />,
            variant: 'secondary',
          },
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-sm text-gray-500 font-medium">Synchronizing protocol data...</p>
        </div>
      ) : (
        <>
          {/* KPI GRID */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <AdminMetricCard 
              label="Total Manifestos" 
              value={formatNumber(metrics?.totalBlogs)} 
              hint={`${formatNumber(metrics?.blogsLast30Days)} New`}
              icon={FiBook}
              color="text-indigo-600"
            />
            <AdminMetricCard 
              label="Published" 
              value={formatNumber(metrics?.publishedBlogs)} 
              hint={`${formatNumber(metrics?.draftBlogs)} in queue`}
              icon={FiCheckCircle}
              color="text-emerald-600"
            />
            <AdminMetricCard 
              label="Global Impact" 
              value={formatNumber(metrics?.totalViews)} 
              trend={metrics?.viewsTrend}
              icon={FiEye}
              color="text-blue-600"
            />
            <AdminMetricCard 
              label="Protocol SEO" 
              value={`${metrics?.averageSeoScore}%`} 
              hint="Avg score"
              icon={FiTarget}
              color="text-violet-600"
            />
            <AdminMetricCard 
              label="Taxonomies" 
              value={formatNumber(metrics?.totalCategories)} 
              hint="Active categories"
              icon={FiLayout}
              color="text-amber-600"
            />
          </section>

          <AdminActionToolbar>
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search recent index..."
                className="h-8 w-64 rounded-lg border border-gray-200 dark:border-gray-800 px-3 text-xs outline-none focus:border-primary transition-all bg-white dark:bg-gray-900 dark:text-white"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-8 rounded-lg border border-gray-200 dark:border-gray-800 px-2 text-xs outline-none bg-white dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="all">All Status</option>
              <option value="published">Live</option>
              <option value="draft">Queue</option>
            </select>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />
            <button onClick={loadStats} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-800 px-3 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <FiRefreshCw className="h-3 w-3" />
              Sync
            </button>
          </AdminActionToolbar>

          {/* SECONDARY INSIGHTS */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
            <article className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-soft">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Traffic Momentum</h2>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">Global view distribution (12M)</p>
                </div>
                <Link href="/admin/blog/analytics" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                  Deep Analytics →
                </Link>
              </div>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
                {monthlyViews.map((item) => (
                  <div key={item.key} className="space-y-2 group">
                    <div className="flex h-24 items-end rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 px-1 py-1.5 transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(8, ((item.views || 0) / maxMonthlyViews) * 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="w-full rounded-md bg-gray-900 dark:bg-primary shadow-glow shadow-primary/20"
                      />
                    </div>
                    <div className="space-y-0.5 px-0.5">
                      <p className="truncate text-[9px] font-black uppercase text-gray-400">{item.month.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-gray-900 dark:text-gray-300">{formatNumber(item.views)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-soft">
              <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">SEO Health Protocol</h2>
              <div className="space-y-5">
                {seoDistribution.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="text-gray-500">{item.key}</span>
                      <span className="text-gray-900 dark:text-gray-300">{item.count} Assets</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(4, ((item.count || 0) / maxSeoDistribution) * 100)}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Avg Score</span>
                  <p className="text-xl font-black text-primary">{metrics?.averageSeoScore}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Pass Rate</span>
                  <p className="text-xl font-black text-emerald-500">100%</p>
                </div>
              </div>
            </article>
          </section>

          {/* TABLES */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
            <article className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-soft">
              <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Recent Index Activity</h2>
                <Link href="/admin/blog/blogs" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View Ledger</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase tracking-[0.1em] font-black text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-5 py-3 text-left">Manifesto Title</th>
                      <th className="px-5 py-3 text-left">Classification</th>
                      <th className="px-5 py-3 text-left">SEO Status</th>
                      <th className="px-5 py-3 text-left">Engagement</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredRecentBlogs.slice(0, 10).map((blog) => (
                      <tr key={blog._id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <p className="max-w-[320px] truncate font-bold text-gray-800 dark:text-gray-200">{blog.title}</p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: {blog._id.slice(-8)}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <AdminStatusBadge 
                            value={typeof blog.category === 'object' ? (blog.category?.name || 'Uncategorized') : 'Uncategorized'} 
                            variant="indigo" 
                          />
                        </td>
                        <td className="px-5 py-4">
                          <AdminStatusBadge value={`${blog.seoScore}/100`} variant={getSeoVariant(blog.seoScore)} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-700 dark:text-gray-300">{formatNumber(blog.views)}</span>
                            <span className="text-[9px] text-gray-400 uppercase font-black">{formatDate(blog.updatedAt)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link 
                            href={`/admin/blog/blogs/edit/${blog.slug}`} 
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-primary hover:border-primary transition-all"
                          >
                            <FiArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-soft overflow-hidden">
              <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-4 bg-gray-50/50 dark:bg-gray-800/20">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Top Performing Assets</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 px-2">
                {topArticles.slice(0, 8).map((article, index) => (
                  <Link
                    key={article._id}
                    href={`/admin/blog/blogs/edit/${article.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xl font-black text-gray-100 dark:text-gray-800 group-hover:text-primary/20 transition-colors">{index + 1}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">{article.title}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-0.5">{formatNumber(article.views)} Impacts</p>
                      </div>
                    </div>
                    <FiMoreHorizontal className="text-gray-300 group-hover:text-gray-500" />
                  </Link>
                ))}
              </div>
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                <button className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-primary transition-colors">
                  Recalculate Protocol Ranks
                </button>
              </div>
            </article>
          </section>
        </>
      )}

      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 15px var(--tw-shadow-color);
        }
      `}</style>
    </div>
  );
}
