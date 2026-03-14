'use client';

import { useEffect, useMemo, useState } from 'react';
import { 
  FiBarChart2, 
  FiDownload, 
  FiRefreshCw, 
  FiTrendingUp, 
  FiTrendingDown,
  FiBookOpen, 
  FiEye, 
  FiTarget, 
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiZap,
  FiLink,
  FiImage as FiImageIcon,
  FiEdit3,
  FiLayout,
  FiMousePointer,
  FiCpu,
  FiPlus,
  FiRefreshCw as FiRefreshIcon
} from 'react-icons/fi';
import { toast } from 'sonner';
import AdminMetricCard from '@/components/admin/ui/AdminMetricCard';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';
import Link from 'next/link';

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

// Compact Chart Components using pure CSS/Tailwind for zero-dependency high-density look
// since Recharts isn't in the project yet and I want to avoid adding new deps if possible
// or implement a very clean fallback.

const MiniBarChart = ({ data, max, color = 'bg-gray-800' }) => (
  <div className="flex items-end gap-1 h-32 w-full">
    {data.map((item, i) => (
      <div key={i} className="flex-1 group relative">
        <div 
          className={`w-full rounded-t-sm transition-all duration-300 ${color} opacity-80 group-hover:opacity-100`}
          style={{ height: `${Math.max(4, ((item.views || item.count || 0) / max) * 100)}%` }}
        />
        <div className="absolute bottom-full left-1/2 -trangray-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
            {item.month || item._id}: {formatNumber(item.views || item.count)}
          </div>
        </div>
      </div>
    ))}
  </div>
);

const HorizontalBar = ({ label, value, max, color = 'bg-indigo-500' }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-medium text-gray-600">
      <span className="truncate max-w-[180px]">{label}</span>
      <span>{formatNumber(value)}</span>
    </div>
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('views');
  const [sortOrder, setSortOrder] = useState('desc');
  const [seoFilter, setSeoFilter] = useState('all');

  async function loadStats() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/stats');
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

  const maxMonthlyViews = useMemo(() => 
    Math.max(...(stats?.monthlyViews || []).map((item) => item.views || 0), 1), 
  [stats?.monthlyViews]);

  const maxCategoryViews = useMemo(() => 
    Math.max(...(stats?.blogsByCategory || []).map((item) => item.views || 0), 1), 
  [stats?.blogsByCategory]);

  const topBlogs = useMemo(() => {
    if (!stats?.topArticles) return [];
    let filtered = stats.topArticles.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (seoFilter !== 'all') {
      filtered = filtered.filter(b => {
        const score = b.seoScore || 0;
        if (seoFilter === 'excellent') return score >= 90;
        if (seoFilter === 'good') return score >= 70 && score < 90;
        if (seoFilter === 'average') return score >= 50 && score < 70;
        if (seoFilter === 'poor') return score < 50;
        return true;
      });
    }
    
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'views') { aVal = a.views || 0; bVal = b.views || 0; }
      else if (sortBy === 'seo') { aVal = a.seoScore || 0; bVal = b.seoScore || 0; }
      else if (sortBy === 'title') { aVal = a.title || ''; bVal = b.title || ''; }
      else if (sortBy === 'date') { aVal = new Date(a.publishedAt || a.createdAt || 0); bVal = new Date(b.publishedAt || b.createdAt || 0); }
      else { aVal = a.views || 0; bVal = b.views || 0; }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return filtered.slice(0, 15);
  }, [stats?.topArticles, searchQuery, sortBy, sortOrder, seoFilter]);

  const aiInsights = useMemo(() => {
    if (!stats) return [];
    const insights = [];
    
    if (stats.metrics?.viewsTrend > 0) {
      insights.push({
        text: `Traffic is up ${stats.metrics.viewsTrend}% this month. Great job!`,
        type: 'success',
        icon: FiTrendingUp
      });
    } else if (stats.metrics?.viewsTrend < 0) {
      insights.push({
        text: `Traffic is down ${Math.abs(stats.metrics.viewsTrend)}% this month. Consider promoting your content.`,
        type: 'warning',
        icon: FiTrendingDown
      });
    }
    
    if (stats.metrics?.health?.missingMeta > 0) {
      insights.push({
        text: `${stats.metrics.health.missingMeta} blogs are missing SEO meta descriptions.`,
        type: 'warning',
        icon: FiAlertCircle
      });
    }
    
    if (stats.metrics?.health?.missingImages > 0) {
      insights.push({
        text: `${stats.metrics.health.missingImages} blogs need featured images.`,
        type: 'warning',
        icon: FiImageIcon
      });
    }
    
    if (stats.topArticles?.[0]) {
      const topShare = Math.round((stats.topArticles[0].views / (stats.metrics.totalViews || 1)) * 100);
      insights.push({
        text: `"${stats.topArticles[0].title.slice(0, 25)}..." drives ${topShare}% of traffic.`,
        type: 'info',
        icon: FiZap
      });
    }
    
    if (stats.metrics?.highSeoCount > 0) {
      const highSeoPercent = Math.round((stats.metrics.highSeoCount / stats.metrics.totalBlogs) * 100);
      insights.push({
        text: `${highSeoPercent}% of blogs have excellent SEO scores.`,
        type: 'success',
        icon: FiCheckCircle
      });
    }

    return insights;
  }, [stats]);

  const handleOptimizeLowSeo = () => {
    toast.info('Filtering blogs with SEO score below 70...');
    setSeoFilter('average');
  };

  const handleGenerateIdeas = () => {
    toast.success('Redirecting to AI blog generator...');
  };

  const handleFixLinks = () => {
    toast.info('Finding blogs without internal links...');
  };

  const handleGenerateImages = () => {
    toast.info('Finding blogs missing featured images...');
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      <AdminPageHeader
        title="Content Analytics"
        description="Real-time performance metrics and SEO health diagnostics."
        actions={[
          { label: 'Generate Insights', icon: <FiZap className="h-3.5 w-3.5" />, variant: 'primary', onClick: loadStats },
          { label: 'Refresh', onClick: loadStats, icon: <FiRefreshCw className="h-3.5 w-3.5" />, variant: 'secondary' }
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
          <p className="text-sm text-gray-700 font-medium">Assembling your data engine...</p>
        </div>
      ) : (
        <>
          {/* SECTION 1: KPI CARDS */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <AdminMetricCard 
              label="Total Blogs" 
              value={formatNumber(stats.metrics?.totalBlogs)} 
              hint={`${stats.metrics?.publishedBlogs} Published`}
            />
            <AdminMetricCard 
              label="Total Views" 
              value={formatNumber(stats.metrics?.totalViews)} 
              hint="Lifetime reach"
            />
            <AdminMetricCard 
              label="Monthly Views" 
              value={formatNumber(stats.metrics?.monthlyViewsCurrent)} 
              trend={stats.metrics?.viewsTrend}
            />
            <AdminMetricCard 
              label="Avg SEO Score" 
              value={`${stats.metrics?.averageSeoScore}/100`} 
              hint="Content optimization"
            />
            <AdminMetricCard 
              label="Top Keywords" 
              value={formatNumber(stats.metrics?.keywordsCount)} 
              hint="Ranking terms"
            />
            <AdminMetricCard 
              label="High SEO (>90)" 
              value={formatNumber(stats.metrics?.highSeoCount)} 
              hint="Perfect scores"
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* SECTION 2: TRAFFIC & PERFORMANCE */}
            <section className="lg:col-span-2 space-y-4">
              <article className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Traffic Momentum</h3>
                    <p className="text-[11px] text-gray-700">Monthly view distribution over the last year</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="h-6 px-2 text-[10px] font-bold bg-gray-100 text-gray-600 rounded">12M</button>
                    <button className="h-6 px-2 text-[10px] font-bold text-gray-400 hover:bg-gray-50 rounded transition-colors">6M</button>
                  </div>
                </div>
                <MiniBarChart data={stats.monthlyViews} max={maxMonthlyViews} color="bg-indigo-600" />
                <div className="mt-4 flex justify-between text-[10px] text-gray-400 font-medium px-1">
                  <span>{stats.monthlyViews[0]?.month}</span>
                  <span>{stats.monthlyViews[Math.floor(stats.monthlyViews.length/2)]?.month}</span>
                  <span>{stats.monthlyViews[stats.monthlyViews.length-1]?.month}</span>
                </div>
              </article>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <article className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiLayout className="text-indigo-500" />
                    Top Categories by Views
                  </h3>
                  <div className="space-y-4">
                    {stats.blogsByCategory.slice(0, 5).map((cat, i) => (
                      <HorizontalBar 
                        key={i} 
                        label={cat._id || 'Uncategorized'} 
                        value={cat.views} 
                        max={maxCategoryViews}
                        color={['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'][i % 5]}
                      />
                    ))}
                  </div>
                </article>

                <article className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiMousePointer className="text-emerald-500" />
                    User Engagement
                  </h3>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative h-32 w-32">
                      {/* CSS-only Donut chart for SEO distribution */}
                      <div className="absolute inset-0 rounded-full border-[12px] border-gray-100" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{stats.metrics.averageSeoScore}</span>
                        <span className="text-[8px] text-gray-400 uppercase font-bold">Avg Score</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {stats.seoScoreDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-50 bg-gray-50/50">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-700 font-bold uppercase">{item.key}</span>
                          <span className="text-xs font-bold text-gray-800">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>

            {/* SECTION 3: SEO HEALTH & INSIGHTS */}
            <aside className="space-y-4">
              <article className="bg-indigo-900 rounded-xl p-5 text-white shadow-lg shadow-indigo-200">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <FiZap className="text-amber-400" />
                  AI Performance Insights
                </h3>
                <div className="space-y-3">
                  {aiInsights.map((insight, i) => (
                    <div key={i} className="flex gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
                      <div className="mt-0.5">
                        <insight.icon className="h-4 w-4 text-amber-300" />
                      </div>
                      <p className="text-xs leading-relaxed font-medium">{insight.text}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-indigo-900 rounded-lg hover:bg-indigo-50 transition-colors">
                  Run Full Audit
                </button>
              </article>

              <article className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FiAlertCircle className="text-rose-500" />
                  SEO Health Checklist
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <FiEdit3 className="text-gray-400 h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium text-gray-600">Missing Meta</span>
                    </div>
                    <span className="text-xs font-bold text-rose-600">{stats.metrics.health.missingMeta}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <FiImageIcon className="text-gray-400 h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium text-gray-600">Missing Images</span>
                    </div>
                    <span className="text-xs font-bold text-rose-600">{stats.metrics.health.missingImages}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <FiLink className="text-gray-400 h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium text-gray-600">No Internal Links</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">{stats.metrics.health.missingInternalLinks}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleOptimizeLowSeo} className="py-2 text-[9px] font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                      <FiTarget className="h-3 w-3" />
                      Fix SEO
                    </button>
                    <button onClick={handleGenerateIdeas} className="py-2 text-[9px] font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                      <FiPlus className="h-3 w-3" />
                      Generate Ideas
                    </button>
                    <button onClick={handleFixLinks} className="py-2 text-[9px] font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                      <FiLink className="h-3 w-3" />
                      Fix Links
                    </button>
                    <button onClick={handleGenerateImages} className="py-2 text-[9px] font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                      <FiImageIcon className="h-3 w-3" />
                      Add Images
                    </button>
                  </div>
                </div>
              </article>
            </aside>
          </div>

          {/* SECTION 4 & 5: PERFORMANCE TABLES */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Top Performing Content</h3>
                <div className="flex items-center gap-2">
                  <select 
                    value={seoFilter}
                    onChange={e => setSeoFilter(e.target.value)}
                    className="h-7 px-2 bg-gray-50 border border-gray-200 rounded-md text-[10px] outline-none focus:border-indigo-500"
                  >
                    <option value="all">All SEO</option>
                    <option value="excellent">Excellent (90+)</option>
                    <option value="good">Good (70-89)</option>
                    <option value="average">Average (50-69)</option>
                    <option value="poor">Poor (&lt;50)</option>
                  </select>
                  <div className="relative">
                    <FiSearch className="absolute left-2.5 top-1/2 -trangray-y-1/2 h-3 w-3 text-gray-400" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Filter articles..."
                      className="h-7 pl-8 pr-2.5 bg-gray-50 border border-gray-200 rounded-md text-[10px] outline-none focus:border-indigo-500 transition-all w-40"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th 
                        className="px-5 py-3 text-left cursor-pointer hover:text-indigo-600"
                        onClick={() => { setSortBy('title'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                      >
                        Article {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-5 py-3 text-left cursor-pointer hover:text-indigo-600"
                        onClick={() => { setSortBy('views'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                      >
                        Views {sortBy === 'views' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-5 py-3 text-left cursor-pointer hover:text-indigo-600"
                        onClick={() => { setSortBy('seo'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                      >
                        SEO {sortBy === 'seo' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-5 py-3 text-left cursor-pointer hover:text-indigo-600"
                        onClick={() => { setSortBy('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                      >
                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topBlogs.map((item) => (
                      <tr key={item._id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-800 line-clamp-1">{item.title}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.category}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-gray-700">{formatNumber(item.views)}</td>
                        <td className="px-5 py-3">
                          <AdminStatusBadge 
                            value={item.seoScore} 
                            variant={item.seoScore >= 80 ? 'success' : item.seoScore >= 60 ? 'info' : 'warning'} 
                          />
                        </td>
                        <td className="px-5 py-3 text-gray-700 font-medium text-[10px]">
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
                <Link href="/admin/blog/blogs" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                  View All Content
                </Link>
              </div>
            </article>

            <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Keyword Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left">Keyword</th>
                      <th className="px-5 py-3 text-left">Pos</th>
                      <th className="px-5 py-3 text-left">Intent</th>
                      <th className="px-5 py-3 text-right">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.keywordRankings.map((item) => (
                      <tr key={item.keyword} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-800">{item.keyword}</span>
                            <span className="text-[9px] text-gray-400 font-mono truncate max-w-[150px]">{item.articleTitle}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-gray-700">#{item.position}</td>
                        <td className="px-5 py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            item.intent === 'Informational' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-violet-50 text-violet-600 border border-violet-100'
                          }`}>
                            {item.intent}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className={`flex items-center justify-end gap-0.5 font-bold ${item.change > 0 ? 'text-emerald-600' : item.change < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                            {item.change > 0 ? <FiArrowUp className="h-2.5 w-2.5" /> : item.change < 0 ? <FiArrowDown className="h-2.5 w-2.5" /> : null}
                            {Math.abs(item.change)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
                <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                  Explore All Keywords
                </button>
              </div>
            </article>
          </div>
        </>
      )}
    </div>
  );
}
