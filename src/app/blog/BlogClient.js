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

  const topLevelCategories = useMemo(
    () => [...new Set(initialCategories.filter((item) => !item.parent).map((item) => item.name))],
    [initialCategories]
  );

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

  function handleFilter(category) {
    setActiveFilter(category);
    const url = category === 'all' ? '/blog' : `/blog?category=${encodeURIComponent(category)}`;
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearFilters() {
    setActiveFilter('all');
    setQuery('');
    window.history.pushState({}, '', '/blog');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
      {/* Sticky Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => handleFilter('all')}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {topLevelCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleFilter(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeFilter === category
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all dark:text-white"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <FiX className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-12 lg:px-8">
        {mappedBlogs.length > 0 && <BannerAd />}
        
        {isEditorialView ? (
          <div className="space-y-10 lg:space-y-14">
            <FeaturedHero
              blog={featuredBlog}
              categoryColor={getCategoryColor(initialCategories, featuredBlog?.category)}
            />

            <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-10 lg:space-y-14">
                <TopStories
                  blogs={topStories}
                  getCategoryColor={(cat) => getCategoryColor(initialCategories, cat)}
                />
                <LatestBlogsGrid
                  blogs={[...mappedBlogs]
                    .filter(b => b._id !== featuredBlog?._id && !topStories.some(t => t._id === b._id))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 6)
                  }
                  title="Latest Articles"
                />
                <EditorPicks blogs={editorPicks} />
              </div>

              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-28 space-y-8">
                  <SidebarAd />
                  <TrendingSidebar
                    trendingBlogs={trendingBlogs}
                    recentBlogs={recentBlogs}
                    popularTags={popularTags}
                  />
                </div>
              </aside>
            </div>

            <section className="border-t border-slate-200 dark:border-slate-700 pt-10 lg:pt-14 space-y-10 lg:space-y-14">
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Browse by Category</h2>
              </div>
              {topLevelCategories.map((category) => (
                <CategorySection
                  key={category}
                  category={category}
                  blogs={mappedBlogs.filter(b => b.category === category)}
                  categoryColor={getCategoryColor(initialCategories, category)}
                />
              ))}
            </section>
          </div>
        ) : isCategoryEditorialView ? (
          <div className="space-y-10 lg:space-y-14">
            <header className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white capitalize">
                {activeFilter}
              </h1>
            </header>

            {categoryFeatured && (
              <FeaturedHero
                blog={categoryFeatured}
                categoryColor={getCategoryColor(initialCategories, activeFilter)}
              />
            )}

            <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-10 lg:space-y-14">
                {categoryTrending.length > 0 && (
                  <TopStories
                    blogs={categoryTrending.slice(0, 4)}
                    getCategoryColor={(cat) => getCategoryColor(initialCategories, cat)}
                  />
                )}
                {categoryLatest.length > 0 && (
                  <LatestBlogsGrid blogs={categoryLatest} title="Latest Articles" />
                )}
              </div>
              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-28 space-y-8">
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
          <div className="space-y-8">
            {/* Search Results logic... */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  categoryColor={getCategoryColor(initialCategories, blog.category)}
                />
              ))}
            </div>
          </div>
        )}
        <MultiplexAd />
      </main>
    </div>
  );
}
