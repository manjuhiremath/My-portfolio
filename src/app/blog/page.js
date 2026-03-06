'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FiSearch, FiTrendingUp } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import BlogCard from '@/components/blog/BlogCard';

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => <div className="h-20" />,
});

function getCategoryColor(categories, categoryName) {
  const category = categories.find((item) => item.name === categoryName);
  return category?.color || '#6366f1';
}

function slugify(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function BlogContent() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get('category');
    if (categoryFromUrl) setActiveFilter(categoryFromUrl);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const [blogsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/blogs?published=true&limit=300', {
            signal: controller.signal,
            cache: 'no-store',
          }),
          fetch('/api/categories', {
            signal: controller.signal,
            cache: 'no-store',
          }),
        ]);

        const blogsData = await blogsResponse.json();
        const categoriesData = await categoriesResponse.json();

        const blogRows = Array.isArray(blogsData) ? blogsData : blogsData.blogs || [];
        setBlogs(blogRows);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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

  const topLevelCategories = useMemo(
    () => categories.filter((item) => !item.parent).map((item) => item.name),
    [categories]
  );

  const featuredBlogs = useMemo(
    () => [...blogs].sort((left, right) => (right.views || 0) - (left.views || 0)).slice(0, 3),
    [blogs]
  );

  const filteredBlogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = blogs.filter((blog) => {
      const matchesCategory =
        activeFilter === 'all' || blog.category?.toLowerCase() === activeFilter.toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        blog.title?.toLowerCase().includes(normalizedQuery) ||
        blog.excerpt?.toLowerCase().includes(normalizedQuery) ||
        blog.tags?.some((tag) => String(tag).toLowerCase().includes(normalizedQuery));
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
  }, [activeFilter, blogs, query, sortBy]);

  function handleFilter(category) {
    setActiveFilter(category);
    const url = category === 'all' ? '/blog' : `/blog?category=${encodeURIComponent(category)}`;
    window.history.pushState({}, '', url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-secondary">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
              <FiTrendingUp className="h-3.5 w-3.5" />
              Fresh insights
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Blog for Developers, Designers and Founders
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Tutorials, case studies, and practical SEO content systems. Quickly find articles by topic,
              subtopic, or keyword.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, excerpt, or tag"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
              />
            </label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
            >
              <option value="newest">Newest first</option>
              <option value="popular">Most viewed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {featuredBlogs.map((blog) => {
              const categorySlug = slugify(blog.category);
              const subcategorySlug = slugify(blog.subcategory);
              const href = subcategorySlug
                ? `/blog/${categorySlug}/${subcategorySlug}/${blog.slug}`
                : `/blog/${categorySlug}/${blog.slug}`;

              return (
              <Link
                key={blog._id}
                href={href}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100"
              >
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Trending</p>
                <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{blog.title}</h2>
                <p className="mt-2 text-[11px] text-slate-500">{(blog.views || 0).toLocaleString()} views</p>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-secondary">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Blog</span>
        </nav>

        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {['all', ...topLevelCategories].map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => handleFilter(category)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === category
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {category === 'all' ? 'All posts' : category}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredBlogs.length} post{filteredBlogs.length === 1 ? '' : 's'}
          </span>
          <span>{activeFilter === 'all' ? 'All categories' : activeFilter}</span>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-600">No blog posts match your current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                categoryColor={getCategoryColor(categories, blog.category)}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function BlogPageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-secondary">Loading...</div>
      <Footer />
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
