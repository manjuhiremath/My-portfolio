'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';
import BlogCard from '@/components/blog/BlogCard';
import BannerAd from '@/components/ads/BannerAd';
import SidebarAd from '@/components/ads/SidebarAd';
import MultiplexAd from '@/components/ads/MultiplexAd';

import FeaturedHero from '@/components/blog/editorial/FeaturedHero';
import TopStories from '@/components/blog/editorial/TopStories';
import TrendingSidebar from '@/components/blog/editorial/TrendingSidebar';
import CategorySection from '@/components/blog/editorial/CategorySection';
import EditorPicks from '@/components/blog/editorial/EditorPicks';
import LatestBlogsGrid from '@/components/blog/editorial/LatestBlogsGrid';

function getCategoryColor(categories, categoryName) {
  const category = categories.find((item) => 
    item.name === categoryName || 
    item.slug === categoryName || 
    item._id === categoryName
  );
  return category?.color || '#6366f1';
}

function slugify(text = '') {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogClient({ initialBlogs = [], initialCategories = [], initialTags = [] }) {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(searchParams.get('category') || 'all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setActiveFilter(searchParams.get('category') || 'all');
  }, [searchParams]);

  const tagMap = useMemo(() => {
    const map = {};
    initialTags.forEach(t => {
      map[t._id] = t.name;
    });
    return map;
  }, [initialTags]);

  const catMap = useMemo(() => {
    const map = {};
    initialCategories.forEach(c => {
      map[c._id] = c.name;
      map[c.slug] = c.name;
    });
    return map;
  }, [initialCategories]);

  const mappedBlogs = useMemo(() => {
    return initialBlogs.map(blog => {
      const categoryName = blog.category?.name || catMap[blog.category] || blog.category || 'Uncategorized';
      const resolvedTags = (blog.tags || []).map(t => t?.name || tagMap[t] || t);
      return {
        ...blog,
        category: categoryName,
        tags: resolvedTags
      };
    });
  }, [initialBlogs, catMap, tagMap]);



  // Editorial Data
  const featuredBlog = useMemo(
    () => [...mappedBlogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0],
    [mappedBlogs]
  );

  const topStories = useMemo(
    () => [...mappedBlogs]
      .filter(b => b._id !== featuredBlog?._id)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4),
    [mappedBlogs, featuredBlog]
  );

  const trendingBlogs = useMemo(
    () => [...mappedBlogs]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5),
    [mappedBlogs]
  );

  const recentBlogs = useMemo(
    () => [...mappedBlogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [mappedBlogs]
  );

  const editorPicks = useMemo(
    () => [...mappedBlogs]
      .filter(b => b.views > 100)
      .sort((a, b) => 0.5 - Math.random())
      .slice(0, 3),
    [mappedBlogs]
  );

  const popularTags = useMemo(() => {
    const tags = mappedBlogs.flatMap(b => b.tags || []);
    const counts = tags.reduce((acc, tag) => {
      if (tag && typeof tag === 'string') {
        acc[tag] = (acc[tag] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 10);
  }, [mappedBlogs]);

  const topLevelCategories = useMemo(() => {
    return initialCategories
      .filter(c => !c.parent)
      .map(c => c.name);
  }, [initialCategories]);

  const categoryBlogs = useMemo(() => {
    if (activeFilter === 'all' || query.trim()) return [];
    return mappedBlogs.filter(b => b.category?.toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter, mappedBlogs, query]);

  const categoryFeatured = useMemo(
    () => categoryBlogs.length ? [...categoryBlogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0] : null,
    [categoryBlogs]
  );

  const categoryTrending = useMemo(
    () => [...categoryBlogs]
      .filter(b => b._id !== categoryFeatured?._id)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5),
    [categoryBlogs, categoryFeatured]
  );

  const categoryLatest = useMemo(
    () => [...categoryBlogs]
      .filter(b => b._id !== categoryFeatured?._id && !categoryTrending.some(t => t._id === b._id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6),
    [categoryBlogs, categoryFeatured, categoryTrending]
  );

  const filteredBlogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = mappedBlogs.filter((blog) => {
      const categoryName = blog.category;
      const matchesCategory =
        activeFilter === 'all' || categoryName?.toLowerCase() === activeFilter.toLowerCase();
      const tagNames = blog.tags || [];
      const matchesQuery =
        !normalizedQuery ||
        blog.title?.toLowerCase().includes(normalizedQuery) ||
        blog.excerpt?.toLowerCase().includes(normalizedQuery) ||
        tagNames.some((tag) => String(tag).toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });

    if (sortBy === 'popular') {
      return rows.sort((left, right) => (right.views || 0) - (left.views || 0));
    }
    return rows.sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
  }, [activeFilter, mappedBlogs, query, sortBy]);

  const isEditorialView = activeFilter === 'all' && !query.trim();
  const isCategoryEditorialView = activeFilter !== 'all' && !query.trim();


  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-500">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-[1440px] px-6 py-12 lg:px-12">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Fresh Perspectives Weekly</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
            The Digital <span className="text-orange-500 italic">Manifesto.</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Deep dives into engineering, architectural patterns, and the future of technology. Curated insights for the modern builder.
          </p>
        </header>

        {mappedBlogs.length > 0 && <div className="mb-12"><BannerAd /></div>}
        
        {isEditorialView ? (
          <div className="space-y-24 lg:space-y-32">
            <section>
              <FeaturedHero
                blog={featuredBlog}
                categoryColor={getCategoryColor(initialCategories, featuredBlog?.category)}
              />
            </section>

            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-24">
                <section>
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-4">
                      <span className="h-8 w-1.5 bg-orange-500 rounded-full" />
                      Top Stories
                    </h2>
                  </div>
                  <TopStories
                    blogs={topStories}
                    getCategoryColor={(cat) => getCategoryColor(initialCategories, cat)}
                  />
                </section>

                <section>
                  <LatestBlogsGrid
                    blogs={[...mappedBlogs]
                      .filter(b => b._id !== featuredBlog?._id && !topStories.some(t => t._id === b._id))
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 6)
                    }
                    title="Latest Feed"
                  />
                </section>

                <section>
                  <EditorPicks blogs={editorPicks} />
                </section>
              </div>

              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-32 space-y-12">
                  <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Search Knowledge</h3>
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="Topics, keywords..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm group-hover:shadow-md"
                      />
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>

                  <SidebarAd />
                  
                  <TrendingSidebar
                    trendingBlogs={trendingBlogs}
                    recentBlogs={recentBlogs}
                    popularTags={popularTags}
                  />
                </div>
              </aside>
            </div>

            <section className="border-t border-slate-100 dark:border-slate-800 pt-24 space-y-24">
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Curated Collections</p>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Browse Categories</h2>
              </div>
              
              <div className="space-y-32">
                {topLevelCategories.map((category) => (
                  <CategorySection
                    key={category}
                    category={category}
                    blogs={mappedBlogs.filter(b => b.category === category)}
                    categoryColor={getCategoryColor(initialCategories, category)}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : isCategoryEditorialView ? (
          <div className="space-y-24">
            <header className="border-b border-slate-100 dark:border-slate-800 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4 px-1">Archive Explorer</p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white capitalize">
                  {activeFilter}
                </h1>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  <FiX className="w-4 h-4" /> Clear Filter
                </button>
              </div>
            </header>

            {categoryFeatured && (
              <FeaturedHero
                blog={categoryFeatured}
                categoryColor={getCategoryColor(initialCategories, activeFilter)}
              />
            )}

            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-24">
                {categoryTrending.length > 0 && (
                  <TopStories
                    blogs={categoryTrending.slice(0, 4)}
                    getCategoryColor={(cat) => getCategoryColor(initialCategories, cat)}
                  />
                )}
                {categoryLatest.length > 0 && (
                  <LatestBlogsGrid blogs={categoryLatest} title="Recent Additions" />
                )}
              </div>
              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-32 space-y-12">
                  <TrendingSidebar
                    trendingBlogs={categoryTrending}
                    recentBlogs={categoryBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)}
                    popularTags={[...new Set(categoryBlogs.flatMap(b => b.tags))].slice(0, 10)}
                  />
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="space-y-12 pt-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Search Results</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Found {filteredBlogs.length} articles matching your criteria</p>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                </select>
                <button 
                  onClick={() => {setQuery(''); setActiveFilter('all');}}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-3 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  categoryColor={getCategoryColor(initialCategories, blog.category)}
                />
              ))}
            </div>
            
            {filteredBlogs.length === 0 && (
              <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm">
                  <FiSearch className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">No matches found</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">Try different keywords or browse our categories instead.</p>
                <button 
                  onClick={() => setQuery('')}
                  className="mt-8 px-8 py-3 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        )}
        <div className="mt-32"><MultiplexAd /></div>
      </main>
    </div>
  );
}
