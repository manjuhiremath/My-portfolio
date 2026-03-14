'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [mostViewedBlogs, setMostViewedBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFooterData() {
      try {
        const [catRes, tagRes, blogRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
          fetch('/api/blogs?published=true&limit=100'),
        ]);

        const cats = await catRes.json();
        const allTags = await tagRes.json();
        const blogData = await blogRes.json();
        const blogs = blogData.blogs || [];

        setCategories(Array.isArray(cats) ? cats : []);
        setTags(Array.isArray(allTags) ? allTags : []);

        // Sort for different sections
        const sortedLatest = [...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
        const sortedMostViewed = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
        // Trending: mix of recency and views
        const sortedTrending = [...blogs].sort((a, b) => {
          const scoreA = (a.views || 0) * (new Date(a.createdAt).getTime() / 10**12);
          const scoreB = (b.views || 0) * (new Date(b.createdAt).getTime() / 10**12);
          return scoreB - scoreA;
        }).slice(0, 4);

        setLatestBlogs(sortedLatest);
        setMostViewedBlogs(sortedMostViewed);
        setTrendingBlogs(sortedTrending);

      } catch (error) {
        console.error('Failed to load footer data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFooterData();
  }, []);

  function slugify(text = '') {
    if (!text) return '';
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  const quickLinks = [
    { name: 'Library', href: '/blog' },
    { name: 'Origins', href: '/about' },
    { name: 'Protocol', href: '/contact' },
    { name: 'Security', href: '/privacy-policy' },
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-900 pt-5 pb-5 transition-colors duration-500 font-body">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Main Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5 lg:gap-12 pb-5 border-b border-gray-900/50">
          
          {/* Categories Grid */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Taxonomy</h4>
            <div className="grid grid-cols-3 gap-y-1 gap-x-2">
              {categories.filter((cat) => cat.blogCount > 5 ).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/blog?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-center justify-between text-xs font-bold text-gray-500 hover:text-white transition-all"
                >
                  <span className="group-hover:trangray-x-1 transition-transform">{cat.name}</span>
                  <span className="text-[9px] font-black text-gray-700 tabular-nums">/{cat.blogCount || 0}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column: Latest */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Latest Entries</h4>
            <div className="space-y-4">
              {latestBlogs.map((blog) => (
                <Link key={blog._id} href={`/blog/${slugify(blog.category?.name || blog.category)}/${blog.slug}`} className="group block space-y-1">
                  <h5 className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h5>
                  <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Column: Most Viewed */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Peak Impact</h4>
            <div className="space-y-4">
              {mostViewedBlogs.map((blog) => (
                <Link key={blog._id} href={`/blog/${slugify(blog.category?.name || blog.category)}/${blog.slug}`} className="group block space-y-1">
                  <h5 className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors line-clamp-2 leading-snug font-display">
                    {blog.title}
                  </h5>
                  <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase tracking-widest opacity-60">
                    <span>{(blog.views || 0).toLocaleString()} Views</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Trending Now</h4>
            <div className="space-y-4">
              {trendingBlogs.map((blog) => (
                <Link key={blog._id} href={`/blog/${slugify(blog.category?.name || blog.category)}/${blog.slug}`} className="group block space-y-1">
                  <h5 className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors line-clamp-2 leading-snug italic">
                    {blog.title}
                  </h5>
                  <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
                    {blog.category?.name || blog.category}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Global Tags - Dense Pool */}
        <div className="py-2 border-b border-gray-900/50">
          <h4 className="text-[12px] font-black text-primary uppercase tracking-[0.4em] ">Metadata Index</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {tags.filter((tag) => tag.blogCount > 2).map((tag) => (
              <Link
                key={tag._id}
                href={`/blog/tag/${encodeURIComponent(tag.name)}`}
                className="group flex items-center gap-0.5 text-[12px] font-bold text-gray-600 hover:text-primary transition-all"
              >
                <span className="text-gray-500 group-hover:text-primary transition-colors">#</span>
                <span className="uppercase tracking-widest">{tag.name}</span>
                <span className="text-[10px] font-black text-gray-500 tabular-nums">[{tag.blogCount || 0}]</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.3em]">
          <div className="flex items-center gap-6 text-gray-700">
            <span className="text-gray-800">© {currentYear}</span>
            <span className="h-1 w-1 rounded-full bg-gray-900" />
            <span>MANJUHIREMATH</span>
          </div>
          
          <nav className="flex items-center gap-8">
            {quickLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-gray-600 hover:text-white transition-colors">{link.name}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
