'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminMetricCard from '@/components/admin/ui/AdminMetricCard';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/stats', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.error || 'Failed to fetch analytics');
      setStats(data.data || data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const maxViews = useMemo(() => Math.max(...(stats?.monthlyViews || []).map((item) => item.views || 0), 1), [stats?.monthlyViews]);

  return (
    <div className="space-y-3">
      <AdminPageHeader
        title="Analytics"
        description="Content performance and SEO quality distribution."
        actions={[{ label: 'Refresh', onClick: loadStats, icon: <FiRefreshCw className="h-3.5 w-3.5" />, variant: 'secondary' }]}
      />

      <AdminActionToolbar>
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50">
          <FiBarChart2 className="h-3.5 w-3.5" />
          Compare Period
        </button>
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50">
          <FiDownload className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </AdminActionToolbar>

      {loading ? (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">Loading analytics...</section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <AdminMetricCard label="Monthly Views" value={formatNumber(stats?.metrics?.monthlyViewsCurrent)} hint="Current month" tone="blue" />
            <AdminMetricCard label="Total Views" value={formatNumber(stats?.metrics?.totalViews)} hint="All time" tone="violet" />
            <AdminMetricCard label="Avg SEO Score" value={`${formatNumber(stats?.metrics?.averageSeoScore)}/100`} hint="Across all blogs" tone="amber" />
            <AdminMetricCard label="Top Articles" value={formatNumber(stats?.topArticles?.length)} hint="Tracked in dashboard" tone="emerald" />
          </section>

          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.6fr_1fr]">
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly Views Trend</h2>
              <div className="grid grid-cols-6 gap-2">
                {(stats?.monthlyViews || []).map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex h-24 items-end rounded border border-slate-200 bg-slate-50 px-1 py-1">
                      <div className="w-full rounded-sm bg-slate-800" style={{ height: `${Math.max(8, ((item.views || 0) / maxViews) * 100)}%` }} />
                    </div>
                    <p className="truncate text-[10px] text-slate-500">{item.month}</p>
                    <p className="text-[10px] font-medium text-slate-700">{formatNumber(item.views)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">SEO Score Distribution</h2>
              <div className="space-y-2">
                {(stats?.seoScoreDistribution || []).map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-xs">
                    <span className="text-slate-700">{item.key}</span>
                    <AdminStatusBadge value={`${item.count}`} variant={item.key === 'Excellent' ? 'success' : item.key === 'Good' ? 'info' : item.key === 'Needs Work' ? 'warning' : 'danger'} />
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_1fr]">
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-3 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Performing Articles</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Title</th>
                      <th className="px-3 py-2 text-left">Views</th>
                      <th className="px-3 py-2 text-left">SEO</th>
                      <th className="px-3 py-2 text-left">Published</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(stats?.topArticles || []).map((item) => (
                      <tr key={item._id} className="h-9 hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-800">{item.title}</td>
                        <td className="px-3 py-2 text-slate-600">{formatNumber(item.views)}</td>
                        <td className="px-3 py-2">
                          <AdminStatusBadge value={`${item.seoScore}/100`} variant={item.seoScore >= 80 ? 'success' : item.seoScore >= 60 ? 'info' : 'warning'} />
                        </td>
                        <td className="px-3 py-2 text-slate-500">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-3 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Keyword Rankings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Keyword</th>
                      <th className="px-3 py-2 text-left">Position</th>
                      <th className="px-3 py-2 text-left">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(stats?.keywordRankings || []).map((item) => (
                      <tr key={item.keyword} className="h-9 hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-700">{item.keyword}</td>
                        <td className="px-3 py-2 text-slate-700">#{item.position}</td>
                        <td className="px-3 py-2">
                          <AdminStatusBadge
                            value={item.change === 0 ? '0' : item.change > 0 ? `+${item.change}` : `${item.change}`}
                            variant={item.change >= 1 ? 'success' : item.change <= -1 ? 'danger' : 'default'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

