'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch, FiX, FiTrendingUp, FiClock, FiBookmark } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function BlogNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) setActiveFilter(categoryFromUrl);
    else setActiveFilter('all');
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catsRes, blogsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/blogs?published=true&limit=1')
        ]);
        
        const catsData = await catsRes.json();
        const blogsData = await blogsRes.json();
        
        setCategories(Array.isArray(catsData) ? catsData.filter(c => !c.parent) : []);
        setTotalBlogs(blogsData.pagination?.total || blogsData.total || 0);
      } catch (error) {
        console.error('Failed to load nav data:', error);
      }
    }
    fetchData();
  }, []);

  function handleFilter(category) {
    if (category === 'all') {
      router.push('/blog');
    } else {
      router.push(`/blog?category=${encodeURIComponent(category)}`);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/blog?query=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm">
      <div className="mx-auto max-w-7xl">
        {/* Top bar with brand */}
        <div className="hidden md:flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 lg:px-8 py-2">
          <Link href="/blog" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm">
              <FiBookmark className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Dev<span className="text-orange-600">Blog</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="hidden lg:flex items-center gap-1.5">
              <FiTrendingUp className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-medium">{totalBlogs} Articles</span>
            </span>
            <span className="h-4 w-px bg-slate-200" />
            <span className="hidden lg:flex items-center gap-1.5">
              <FiClock className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-medium">Updated Daily</span>
            </span>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex items-center justify-between px-4 lg:px-8 py-3">
          <nav className="hide-scrollbar flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Blog categories">
            <button
              onClick={() => handleFilter('all')}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Posts
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                type="button"
                key={cat.name}
                onClick={() => handleFilter(cat.name)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                  activeFilter === cat.name
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          <ThemeToggle />

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-orange-500 hover:text-white"
            aria-label="Toggle search"
          >
            {isSearchOpen ? <FiX className="h-5 w-5" /> : <FiSearch className="h-5 w-5" />}
          </button>
        </div>

        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-4 py-4 lg:px-8 animate-in slide-in-from-top duration-200">
            <div className="mx-auto max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <FiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, topics, or tags..."
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-4 text-sm dark:text-white font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                  />
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
