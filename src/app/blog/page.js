'use client';

import { Suspense, useEffect, useMemo, useState, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';
import BlogCard from '@/components/blog/BlogCard';
import BannerAd from '@/components/ads/BannerAd';
import SidebarAd from '@/components/ads/SidebarAd';
import MultiplexAd from '@/components/ads/MultiplexAd';

// Lazy load editorial components for code splitting - reduces initial JS bundle
const FeaturedHero = lazy(() => import('@/components/blog/editorial/FeaturedHero'));
const TopStories = lazy(() => import('@/components/blog/editorial/TopStories'));
const TrendingSidebar = lazy(() => import('@/components/blog/editorial/TrendingSidebar'));
const CategorySection = lazy(() => import('@/components/blog/editorial/CategorySection'));
const EditorPicks = lazy(() => import('@/components/blog/editorial/EditorPicks'));
const LatestBlogsGrid = lazy(() => import('@/components/blog/editorial/LatestBlogsGrid'));

function getCategoryColor(categories, categoryName) {
  const category = categories.find((item) => 
    item.name === categoryName || 
    item.slug === categoryName || 
    item._id === categoryName
  );
  return category?.color || '#6366f1';
}

function BlogContent() {
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    setActiveFilter(categoryFromUrl || 'all');
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const [blogsResponse, categoriesResponse, tagsResponse] = await Promise.all([
          fetch('/api/blogs?published=true&limit=300', {
            signal: controller.signal,
          }),
          fetch('/api/categories', {
            signal: controller.signal,
          }),
          fetch('/api/tags', {
            signal: controller.signal,
          }),
        ]);

        const blogsData = await blogsResponse.json();
        const categoriesData = await categoriesResponse.json();
        const tagsData = await tagsResponse.json();

        const blogRows = Array.isArray(blogsData) ? blogsData : blogsData.blogs || [];
        setBlogs(blogRows);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setTagsList(Array.isArray(tagsData) ? tagsData : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load blog content:', error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, []);

  const tagMap = useMemo(() => {
    const map = {};
    tagsList.forEach(t => {
      map[t._id] = t.name;
    });
    return map;
  }, [tagsList]);

  const catMap = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      map[c._id] = c.name;
      map[c.slug] = c.name;
    });
    return map;
  }, [categories]);

  const mappedBlogs = useMemo(() => {
    return blogs.map(blog => {
      // Resolve category name
      const categoryName = blog.category?.name || catMap[blog.category] || blog.category || 'Uncategorized';
      
      // Resolve tag names
      const resolvedTags = (blog.tags || []).map(t => t?.name || tagMap[t] || t);
      
      return {
        ...blog,
        category: categoryName,
        tags: resolvedTags
      };
    });
  }, [blogs, catMap, tagMap]);

  const topLevelCategories = useMemo(
    () => categories.filter((item) => !item.parent).map((item) => item.name),
    [categories]
  );

  // ─── "All Posts" editorial data ───
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

  // ─── Category-specific editorial data (Issues 7, 8, 9) ───
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

  // ─── Search/filter view data ───
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

    return rows.sort((left, right) => {
      const leftDate = new Date(left.createdAt || 0).getTime();
      const rightDate = new Date(right.createdAt || 0).getTime();
      return rightDate - leftDate;
    });
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

  if (loading) {
    return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-orange-500" />
              <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-orange-100/30" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-black text-slate-800 uppercase tracking-[0.3em]">Loading</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assembling Stories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-12 lg:px-8">
        <BannerAd />
        {isEditorialView ? (
          /* ─── ALL POSTS EDITORIAL VIEW ─── */
          <div className="space-y-10 lg:space-y-14">
            {/* Section 1: Featured Hero */}
              <section aria-label="Featured article">
              <Suspense fallback={<div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />}>
                <FeaturedHero
                  blog={featuredBlog}
                  categoryColor={getCategoryColor(categories, featuredBlog?.category?.name || featuredBlog?.category)}
                />
              </Suspense>
            </section>

            {/* Section 2: Top Stories & Sidebar */}
            <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-12">
              {/* Main Content: 8 Columns */}
              <div className="lg:col-span-8 space-y-10 lg:space-y-14">
                <Suspense fallback={<div className="space-y-4"><div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /><div className="grid grid-cols-2 gap-4"><div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /><div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /></div></div>}>
                  <TopStories
                    blogs={topStories}
                    getCategoryColor={(cat) => getCategoryColor(categories, cat)}
                  />
                </Suspense>

                <Suspense fallback={<div className="grid grid-cols-3 gap-4"><div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /><div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /><div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /></div>}>
                  <LatestBlogsGrid
                    blogs={[...mappedBlogs]
                      .filter(b => b._id !== featuredBlog?._id && !topStories.some(t => t._id === b._id))
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 6)
                    }
                    title="Latest Articles"
                  />
                </Suspense>

                <Suspense fallback={<div className="grid grid-cols-3 gap-4"><div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /><div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /><div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /></div>}>
                  <EditorPicks blogs={editorPicks} />
                </Suspense>
              </div>

              {/* Sidebar: 4 Columns */}
              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-28 space-y-8">
                  <SidebarAd />
                  <Suspense fallback={<div className="h-96 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />}>
                    <TrendingSidebar
                      trendingBlogs={trendingBlogs}
                      recentBlogs={recentBlogs}
                      popularTags={popularTags}
                    />
                  </Suspense>
                </div>
              </aside>
            </div>

            {/* Section 3: Category Sections */}
            <section className="border-t border-slate-200 dark:border-slate-700 pt-10 lg:pt-14 space-y-10 lg:space-y-14">
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase" style={{ fontFamily: 'var(--font-display), serif' }}>Browse by Category</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">Explore articles organized by topic</p>
              </div>
              {topLevelCategories.map((category) => (
                <Suspense key={category} fallback={<div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />}>
                  <CategorySection
                    category={category}
                    blogs={mappedBlogs.filter(b => b.category === category)}
                    categoryColor={getCategoryColor(categories, category)}
                  />
                </Suspense>
              ))}
            </section>
          </div>
        ) : isCategoryEditorialView ? (
          /* ─── CATEGORY EDITORIAL VIEW (Issues 7, 8, 9) ─── */
          <div className="space-y-10 lg:space-y-14">
            {/* Category Header */}
            <header className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Category</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {activeFilter}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                {categoryBlogs.length} {categoryBlogs.length === 1 ? 'article' : 'articles'} in this category
              </p>
            </header>

            {/* Featured Article for this category (Issue 8) */}
            {categoryFeatured && (
              <section aria-label="Featured article">
                <FeaturedHero
                  blog={categoryFeatured}
                  categoryColor={getCategoryColor(categories, activeFilter)}
                />
              </section>
            )}

            <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-10 lg:space-y-14">
                {/* Trending Now for this category (Issue 9) */}
                {categoryTrending.length > 0 && (
                  <TopStories
                    blogs={categoryTrending.slice(0, 4)}
                    getCategoryColor={(cat) => getCategoryColor(categories, cat)}
                  />
                )}

                {/* Latest Articles for this category (Issue 7) */}
                {categoryLatest.length > 0 && (
                  <LatestBlogsGrid
                    blogs={categoryLatest}
                    title="Latest Articles"
                  />
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-28 space-y-8">
                  <TrendingSidebar
                    trendingBlogs={categoryTrending}
                    recentBlogs={categoryBlogs
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 5)}
                    popularTags={
                      [...new Set(categoryBlogs.flatMap(b => (b.tags || []).map(t => t?.name || t)))].slice(0, 10)
                    }
                  />
                </div>
              </aside>
            </div>

            {/* All remaining articles in grid */}
            {categoryBlogs.length > (1 + categoryTrending.length + categoryLatest.length) && (
              <section className="border-t border-slate-200 dark:border-slate-700 pt-8">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase mb-5">All {activeFilter} Articles</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryBlogs
                    .filter(b =>
                      b._id !== categoryFeatured?._id &&
                      !categoryTrending.some(t => t._id === b._id) &&
                      !categoryLatest.some(l => l._id === b._id)
                    )
                    .map((blog) => (
                      <BlogCard
                        key={blog._id}
                        blog={blog}
                        categoryColor={getCategoryColor(categories, blog.category?.name || blog.category)}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* ─── SEARCH/FILTER VIEW ─── */
          <div className="space-y-8">
            <header className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
                    Search Results
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    &quot;{query}&quot;
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'} found
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all dark:text-white"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                  </select>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white dark:text-slate-900 transition-all hover:bg-orange-600"
                  >
                    <FiX className="h-4 w-4" /> Clear
                  </button>
                </div>
              </div>
            </header>

            {filteredBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 py-20 text-center">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-6">
                  <FiSearch className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">No articles found</h3>
                <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400 font-medium text-sm">
                  We couldn&apos;t find any articles matching your search. Try different keywords or browse all articles.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-700"
                >
                  View All Articles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    categoryColor={getCategoryColor(categories, blog.category?.name || blog.category)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <MultiplexAd />
      </main>
    </div>
  );
}

function BlogPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 dark:border-slate-700 border-t-orange-500" />
            <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-orange-100/30 dark:bg-orange-900/20" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.3em]">Loading</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogPageFallback />}>
      <BlogContent />
    </Suspense>
  );
}