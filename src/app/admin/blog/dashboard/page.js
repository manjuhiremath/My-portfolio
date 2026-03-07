'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiFilter, FiPlus, FiRefreshCw, FiZap } from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminMetricCard from '@/components/admin/ui/AdminMetricCard';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function getSeoVariant(score) {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'danger';
}

export default function AdminDashboardPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard/stats', {
          signal: controller.signal,
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
          throw new Error(data.error || 'Failed to fetch dashboard stats');
        }
        setPayload(data.data || data);
      } catch (error) {
        if (error.name === 'AbortError') return;
        toast.error(error.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    return () => controller.abort();
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
    <div className="space-y-3">
      <AdminPageHeader
        title="Dashboard"
        description="Compact workspace for SEO content operations."
        actions={[
          {
            label: 'Generate Blog',
            href: '/admin/blogs/generate',
            icon: <FiZap className="h-3.5 w-3.5" />,
            variant: 'primary',
          },
          {
            label: 'Create Blog',
            href: '/admin/blogs/create',
            icon: <FiPlus className="h-3.5 w-3.5" />,
            variant: 'secondary',
          },
        ]}
      />

      <AdminActionToolbar>
        <div className="relative">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search recent blogs"
            className="h-8 w-52 rounded-md border border-slate-300 px-2.5 text-xs outline-none focus:border-slate-500"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-slate-500"
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50">
          <FiFilter className="h-3.5 w-3.5" />
          Filters
        </button>
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50">
          <FiDownload className="h-3.5 w-3.5" />
          Export
        </button>
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50">
          <FiRefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </AdminActionToolbar>

      {loading ? (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">Loading dashboard...</section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-2 xl:grid-cols-5">
            <AdminMetricCard label="Total Blogs" value={formatNumber(metrics?.totalBlogs)} hint={`${formatNumber(metrics?.blogsLast30Days)} in 30 days`} tone="blue" />
            <AdminMetricCard label="Published" value={formatNumber(metrics?.publishedBlogs)} hint={`${formatNumber(metrics?.draftBlogs)} drafts`} tone="emerald" />
            <AdminMetricCard label="Total Views" value={formatNumber(metrics?.totalViews)} hint="All-time page views" tone="violet" />
            <AdminMetricCard label="Avg SEO Score" value={`${formatNumber(metrics?.averageSeoScore)}/100`} hint="Calculated from SEO fields" tone="amber" />
            <AdminMetricCard label="Categories" value={formatNumber(metrics?.totalCategories)} hint="Taxonomy coverage" />
          </section>

          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_1fr]">
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly Views</h2>
                <Link href="/admin/analytics" className="text-xs font-medium text-slate-700 hover:text-slate-900">
                  Full analytics
                </Link>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {monthlyViews.map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex h-20 items-end rounded border border-slate-200 bg-slate-50 px-1.5 py-1">
                      <div
                        className="w-full rounded-sm bg-slate-800 transition-all"
                        style={{ height: `${Math.max(8, ((item.views || 0) / maxMonthlyViews) * 100)}%` }}
                      />
                    </div>
                    <p className="truncate text-[10px] text-slate-500">{item.month}</p>
                    <p className="text-[10px] font-medium text-slate-700">{formatNumber(item.views)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">SEO Distribution</h2>
              <div className="space-y-1.5">
                {seoDistribution.map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700">{item.key}</span>
                      <span className="text-slate-500">{item.count}</span>
                    </div>
                    <div className="h-1.5 rounded bg-slate-100">
                      <div
                        className="h-1.5 rounded bg-slate-800"
                        style={{ width: `${Math.max(6, ((item.count || 0) / maxSeoDistribution) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-3 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Blogs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Title</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">SEO</th>
                      <th className="px-3 py-2 text-left">Views</th>
                      <th className="px-3 py-2 text-left">Updated</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecentBlogs.slice(0, 10).map((blog) => (
                      <tr key={blog._id} className="h-9 hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <p className="max-w-[320px] truncate font-medium text-slate-800">{blog.title}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {blog.category || 'Uncategorized'}
                          {blog.subcategory ? ` / ${blog.subcategory}` : ''}
                        </td>
                        <td className="px-3 py-2">
                          <AdminStatusBadge value={`${blog.seoScore}/100`} variant={getSeoVariant(blog.seoScore)} />
                        </td>
                        <td className="px-3 py-2 text-slate-600">{formatNumber(blog.views)}</td>
                        <td className="px-3 py-2 text-slate-500">{formatDate(blog.updatedAt)}</td>
                        <td className="px-3 py-2">
                          <AdminStatusBadge value={blog.published ? 'Published' : 'Draft'} variant={blog.published ? 'success' : 'warning'} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link href={`/admin/blogs/edit/${blog.slug}`} className="text-xs font-medium text-slate-700 hover:text-slate-900">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-3 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Articles</h2>
              </div>
              <div className="space-y-2 px-3 py-2">
                {topArticles.slice(0, 6).map((article, index) => (
                  <Link
                    key={article._id}
                    href={`/admin/blogs/edit/${article.slug}`}
                    className="flex items-start justify-between rounded-md border border-slate-200 px-2 py-1.5 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-800">{index + 1}. {article.title}</p>
                      <p className="text-[11px] text-slate-500">{formatNumber(article.views)} views</p>
                    </div>
                    <AdminStatusBadge value={`${article.seoScore}`} variant={getSeoVariant(article.seoScore)} />
                  </Link>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
