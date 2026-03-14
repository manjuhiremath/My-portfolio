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
    const names = initialCategories
      .filter(c => !c.parent)
      .map(c => c.name);
    // Filter to only categories that actually have blogs in them to keep it clean
    return [...new Set(names)].filter(name => 
      mappedBlogs.some(b => 
        b.category?.toLowerCase() === name.toLowerCase() ||
        slugify(b.category) === slugify(name)
      )
    );
  }, [initialCategories, mappedBlogs]);

  const categoryBlogs = useMemo(() => {
    if (activeFilter === 'all' || query.trim()) return [];
    return mappedBlogs.filter(b => 
      b.category?.toLowerCase() === activeFilter.toLowerCase() ||
      slugify(b.category) === slugify(activeFilter)
    );
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
        activeFilter === 'all' || 
        categoryName?.toLowerCase() === activeFilter.toLowerCase() ||
        slugify(categoryName) === slugify(activeFilter);
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
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 lg:px-6 lg:py-8">

        {/* {mappedBlogs.length > 0 && <div className="mb-6"><BannerAd /></div>} */}
        
        {isEditorialView ? (
          <div className="space-y-8 lg:space-y-10">
            <section>
              <FeaturedHero
                blog={featuredBlog}
                categoryColor={getCategoryColor(initialCategories, featuredBlog?.category)}
              />
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-8">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="h-4 w-0.5 bg-orange-500 rounded-full" />
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
                      .slice(0, 8)
                    }
                    title="Latest Feed"
                  />
                </section>

                <section>
                  <EditorPicks blogs={editorPicks} />
                </section>
              </div>

              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-24 space-y-8">
                  <TrendingSidebar
                    trendingBlogs={trendingBlogs}
                    recentBlogs={recentBlogs}
                    popularTags={popularTags}
                  />
                  <SidebarAd />
                  
                </div>
              </aside>
            </div>
          </div>
        ) : isCategoryEditorialView ? (
          <div className="space-y-6">
            <header className="border-b border-gray-100 dark:border-gray-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-orange-500 mb-1 px-1">Archive</p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">
                  {activeFilter}
                </h1>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold flex items-center gap-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <FiX className="w-3 h-3" /> Clear
                </button>
              </div>
            </header>

            {categoryFeatured ? (
              <>
                <FeaturedHero
                  blog={categoryFeatured}
                  categoryColor={getCategoryColor(initialCategories, activeFilter)}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-8 space-y-6">
                    {categoryTrending.length > 0 && (
                      <TopStories
                        blogs={categoryTrending.slice(0, 4)}
                        getCategoryColor={(cat) => getCategoryColor(initialCategories, cat)}
                      />
                    )}
                    {categoryLatest.length > 0 && (
                      <LatestBlogsGrid blogs={categoryLatest} title="Recent" />
                    )}
                  </div>
                  <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-20 space-y-4">
                      <TrendingSidebar
                        trendingBlogs={categoryTrending}
                        recentBlogs={categoryBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)}
                        popularTags={[...new Set(categoryBlogs.flatMap(b => b.tags))].slice(0, 10)}
                      />
                    </div>
                  </aside>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-sm">
                  <FiSearch className="h-6 w-6 text-gray-300" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">No articles found</h3>
                <p className="mt-1 text-[10px] text-gray-700 dark:text-gray-400 max-w-xs mx-auto font-medium">We haven&apos;t published any articles in the {activeFilter} category yet.</p>
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="mt-6 px-6 py-2 rounded-xl bg-orange-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform text-[10px]"
                >
                  Browse All
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Search Results</h2>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-medium">{filteredBlogs.length} articles</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Popular</option>
                </select>
                <button 
                  onClick={() => {setQuery(''); setActiveFilter('all');}}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  categoryColor={getCategoryColor(initialCategories, blog.category)}
                />
              ))}
            </div>
            
            {filteredBlogs.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-sm">
                  <FiSearch className="h-6 w-6 text-gray-300" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">No matches found</h3>
                <p className="mt-1 text-[10px] text-gray-700 dark:text-gray-400 max-w-xs mx-auto font-medium">Try different keywords or browse our categories instead.</p>
                <button 
                  onClick={() => setQuery('')}
                  className="mt-6 px-6 py-2 rounded-xl bg-orange-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform text-[10px]"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}

        {/* Browse Categories - Always show at bottom for easy navigation */}
        {!query.trim() && (
          <section className="border-t border-gray-100 dark:border-gray-800 pt-12 mt-5 space-y-5">
            <div className="text-center space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500">Collections</p>
              <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Browse Categories</h2>
            </div>
            
            <div className="space-y-8">
              {topLevelCategories.map((category) => (
                <CategorySection
                  key={category}
                  category={category}
                  blogs={mappedBlogs.filter(b => 
                    b.category?.toLowerCase() === category.toLowerCase() ||
                    slugify(b.category) === slugify(category)
                  )}
                  categoryColor={getCategoryColor(initialCategories, category)}
                />
              ))}
            </div>
          </section>
        )}
        <div className="mt-12"><MultiplexAd /></div>
      </main>
    </div>
  );
}
