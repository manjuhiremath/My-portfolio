'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [stats, setStats] = useState({ totalBlogs: 0, totalViews: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFooterData() {
      try {
        const [catRes, tagRes, blogRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
          fetch('/api/blogs?published=true&limit=100'),
        ]);

        const safeJson = async (res) => {
          if (!res.ok) return null;
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await res.json();
          }
          return null;
        };

        const catData = await safeJson(catRes);
        const tagData = await safeJson(tagRes);
        const blogData = await safeJson(blogRes);

        const cats = Array.isArray(catData) ? catData : [];
        setCategories(cats);

        const allTags = Array.isArray(tagData) ? tagData : [];
        setTags(allTags);

        const blogs = (Array.isArray(blogData) ? blogData : blogData?.blogs) || [];
        
        const totalBlogs = blogs.length;
        const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
        setStats({ totalBlogs, totalViews });

        const catMap = {};
        cats.forEach(c => {
          catMap[c._id] = c.name;
        });

        const tagMap = {};
        allTags.forEach(t => {
          tagMap[t._id] = t.name;
        });

        const sorted = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0));
        const mappedPopularBlogs = sorted.slice(0, 6).map(b => {
          if (!b) return null;
          const rawCat = b.category?.name || b.category;
          let categoryName = rawCat || 'Uncategorized';
          if (catMap[rawCat]) categoryName = catMap[rawCat];
          
          return {
            ...b,
            categoryName: categoryName
          };
        }).filter(Boolean);
        setPopularBlogs(mappedPopularBlogs);
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
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const quickLinks = [
    { name: 'Magazine', href: '/blog' },
    { name: 'Origins', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
  ];

  const trendingTopics = tags
    .sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0))
    .slice(0, 12);

  return (
    <footer className="bg-gray-950 border-t border-gray-900 pt-20 pb-12 mt-32 transition-colors duration-500">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Top Section: Brand & Primary Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-gray-900/50">
          
          {/* Column 1: Brand & Identity */}
          <div className="md:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 bg-white p-1.5 transition-transform duration-500 group-hover:rotate-12">
                <Image src="/logo.png" alt="Manifesto" width={48} height={48} className="h-full w-full object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase font-display leading-none">
                THE <span className="text-primary italic">MANIFESTO.</span>
              </span>
            </Link>
            
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm font-medium">
              A high-performance editorial journal exploring the strategic architecture of the digital era. Analyzing technical excellence and modern engineering patterns.
            </p>

            <div className="flex items-center gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-1.017-2.178-1.652-3.594-1.652-2.719 0-4.923 2.204-4.923 4.923 0 .385.043.76.127 1.121-4.092-.205-7.719-2.165-10.148-5.144-.424.722-.666 1.561-.666 2.457 0 1.708 1.07 3.215 2.696 4.301-.994-.031-1.93-.304-2.747-.758v.062c0 2.385 1.697 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.317 0-.626-.03-.927-.086.627 1.956 2.444 3.379 4.6 3.419-1.684 1.32-3.812 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/></svg></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all duration-300 shadow-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
              <Link href="/rss" className="h-10 w-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Column 2: Architecture (Categories) */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Architecture</h4>
            <ul className="space-y-3">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/blog?category=${encodeURIComponent(cat.name)}`}
                    className="text-xs font-bold text-gray-700 hover:text-white hover:trangray-x-1 transition-all inline-block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Insights (Popular) */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Core Insights</h4>
            <ul className="space-y-4">
              {popularBlogs.slice(0, 3).map((blog) => (
                <li key={blog._id}>
                  <Link
                    href={`/blog/${slugify(blog.categoryName || blog.category)}/${blog.slug}`}
                    className="group block space-y-1"
                  >
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{blog.categoryName}</p>
                    <h5 className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h5>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: System (Stats & Links) */}
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">System</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs font-bold text-gray-700 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-lg font-black text-white tabular-nums leading-none">{isLoading ? '...' : stats.totalBlogs}</p>
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Entries</p>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-white tabular-nums leading-none">{isLoading ? '...' : (stats.totalViews / 1000).toFixed(1) + 'K'}</p>
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Impact</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Taxonomy / Tags */}
        <div className="py-12 border-b border-gray-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Global Taxonomy</h4>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{tags.length} unique identifiers indexed</p>
            </div>
            <Link href="/blog" className="text-[10px] font-black text-gray-400 hover:text-primary uppercase tracking-[0.3em] transition-colors border-b border-gray-800 pb-1">
              Access Full Library →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 30).map((tag) => (
              <Link
                key={tag._id}
                href={`/blog/tag/${encodeURIComponent(tag.name)}`}
                className="rounded-xl border border-gray-900 bg-gray-950/50 px-4 py-2 text-[9px] font-black text-gray-700 hover:text-primary hover:border-primary/30 hover:bg-gray-900 transition-all shadow-inner"
              >
                #{tag.name.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section: Legal & Copyright */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="flex items-center gap-6 text-gray-600">
            <span className="text-gray-800">© {currentYear}</span>
            <span className="text-gray-400">THE DIGITAL MANIFESTO</span>
            <span className="h-1 w-1 rounded-full bg-gray-800" />
            <span className="text-gray-700">Ver 2.6.0_STABLE</span>
          </div>
          
          <nav className="flex items-center gap-8">
            <Link href="/privacy-policy" className="text-gray-600 hover:text-white transition-colors">Security</Link>
            <Link href="/contact" className="text-gray-600 hover:text-white transition-colors">Protocol</Link>
            <Link href="/" className="text-primary hover:text-white transition-all hover:scale-110">Terminal</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
