'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

        const EXCLUDED_CATEGORIES = ['Content', 'Content Strategy'];
        const filteredCats = Array.isArray(catsData)
          ? catsData.filter(c => !c.parent && !EXCLUDED_CATEGORIES.includes(c.name))
          : [];

        setCategories(filteredCats);
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
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 transition-all duration-500">
      <div className="mx-auto max-w-[1440px]">
        {/* Top bar with brand - Compact */}
        <div className="hidden md:flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 px-4 py-2">
          <Link href="/blog" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10 bg-white p-0.5">
              <Image src="/logo.png" alt="Manifesto" width={28} height={28} className="h-full w-full object-contain" />
            </div>
            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase font-display">
              THE <span className="text-primary italic">MANIFESTO.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-1">
              <FiTrendingUp className="w-2.5 h-2.5 text-primary" />
              <span>{totalBlogs} ARTICLES</span>
            </div>
            <span className="h-3 w-px bg-slate-100 dark:bg-slate-800" />
            <div className="flex items-center gap-1">
              <FiClock className="w-2.5 h-2.5 text-primary" />
              <span>UPDATING DAILY</span>
            </div>
          </div>
        </div>

        {/* Category Navigation - Compact */}
        <div className="flex items-center justify-between px-2 py-2">
          <nav
            className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Manifesto categories"
          >
            <button
              onClick={() => handleFilter('all')}
              className={`whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-all ${activeFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
                }`}
            >
              ALL
            </button>
            {categories.slice(0, 10).map((cat) => (
              <button
                type="button"
                key={cat._id || cat.name}
                onClick={() => handleFilter(cat.name)}
                className={`whitespace-nowrap rounded-lg px-2 py-1 text-[9px] font-semibold uppercase tracking-wide transition-all ${activeFilter === cat.name
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800/50 text-gray-600 dark:text-gray-600 hover:bg-slate-400 dark:hover:bg-slate-800 hover:text-primary'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-3">
            <ThemeToggle />

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
              aria-label="Toggle search"
            >
              {isSearchOpen ? <FiX className="h-3.5 w-3.5" /> : <FiSearch className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar - Compact */}
        {isSearchOpen && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-3 lg:px-6 animate-in slide-in-from-top duration-300">
            <div className="mx-auto max-w-3xl">
              <form onSubmit={handleSearch} className="relative group">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, topics, or tags..."
                  className="h-9 w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 pl-10 pr-4 text-xs dark:text-white font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5 shadow-inner"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
