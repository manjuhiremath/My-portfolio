'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

const statusColors = {
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-amber-50 text-amber-700',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        toast.error(data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!stats) return [];
    return [
      { 
        label: 'Total Blogs', 
        value: stats.metrics.totalBlogs.toLocaleString(), 
        change: `+${stats.metrics.blogsLast7Days} this week`, 
        tone: 'text-emerald-600' 
      },
      { 
        label: 'Published', 
        value: stats.metrics.publishedBlogs.toLocaleString(), 
        change: `${Math.round((stats.metrics.publishedBlogs / stats.metrics.totalBlogs) * 100) || 0}% of total`, 
        tone: 'text-blue-600' 
      },
      { 
        label: 'Drafts', 
        value: stats.metrics.draftBlogs.toLocaleString(), 
        change: 'Awaiting publish', 
        tone: 'text-amber-600' 
      },
      { 
        label: 'Categories', 
        value: stats.metrics.totalCategories.toLocaleString(), 
        change: 'Active categories', 
        tone: 'text-purple-600' 
      },
    ];
  }, [stats]);

  const chartData = useMemo(() => {
    if (!stats?.dailyCounts) return [];
    // Fill in missing days with 0
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = stats.dailyCounts.find(d => d._id === dateStr);
      data.push(dayData?.count || 0);
    }
    return data;
  }, [stats]);

  const chartPath = useMemo(() => {
    if (chartData.length === 0) return '';
    const max = Math.max(...chartData, 1);
    return chartData.map((point, index) => {
      const x = (index / (chartData.length - 1 || 1)) * 100;
      const y = 100 - ((point / max) * 100);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [chartData]);

  const filteredRows = useMemo(() => {
    if (!stats?.recentBlogs) return [];
    return stats.recentBlogs.filter((row) => {
      const matchesQuery = 
        row.title?.toLowerCase().includes(query.toLowerCase()) ||
        row.slug?.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'All' || 
        (statusFilter === 'Published' && row.published) ||
        (statusFilter === 'Draft' && !row.published);
      return matchesQuery && matchesStatus;
    });
  }, [stats, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const topCategories = useMemo(() => {
    if (!stats?.blogsByCategory) return [];
    return stats.blogsByCategory.slice(0, 4);
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your blog content and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs/create"
            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            + New Blog
          </Link>
          <Link
            href="/admin/blogs/generate"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            AI Generate
          </Link>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
              <span className={`text-xs font-medium ${metric.tone}`}>{metric.change}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Charts & Categories */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Activity Chart */}
        <article className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">7-Day Activity</h2>
            <span className="text-xs text-slate-500">Blogs created per day</span>
          </div>
          <div className="h-[200px] rounded-lg border border-slate-100 bg-slate-50 p-3">
            {chartData.length > 0 ? (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${chartPath} L 100 100 L 0 100 Z`}
                  fill="url(#chartGradient)"
                />
                <path d={chartPath} fill="none" stroke="#4f46e5" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No data available
              </div>
            )}
          </div>
        </article>

        {/* Top Categories */}
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Top Categories</h2>
          <div className="space-y-3">
            {topCategories.length > 0 ? (
              topCategories.map((cat, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 truncate">{cat._id || 'Uncategorized'}</span>
                    <span className="text-slate-500">{cat.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div 
                      className="h-2 rounded-full bg-indigo-500 transition-all" 
                      style={{ width: `${(cat.count / (topCategories[0]?.count || 1)) * 100}%` }} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No category data</p>
            )}
          </div>
        </article>
      </section>

      {/* Recent Blogs Table */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Recent Blogs</h2>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search blogs..."
              className="h-9 w-[200px] rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option>All</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pagedRows.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link 
                      href={`/admin/blogs/edit/${row.slug}`}
                      className="font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.category}{row.subcategory ? ` / ${row.subcategory}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row.published ? 'published' : 'draft']}`}>
                      {row.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blogs/edit/${row.slug}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRows.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {pagedRows.length} of {filteredRows.length} blogs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-sm text-slate-600">
                Page {page} / {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="h-8 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          href="/admin/blogs"
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3V9M7 16h10M7 8h10M7 4h10" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">All Blogs</p>
            <p className="text-xs text-slate-500">Manage your content</p>
          </div>
        </Link>

        <Link 
          href="/admin/ai-models"
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">AI Models</p>
            <p className="text-xs text-slate-500">Configure models</p>
          </div>
        </Link>

        <Link 
          href="/admin/categories"
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">Categories</p>
            <p className="text-xs text-slate-500">Organize content</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
