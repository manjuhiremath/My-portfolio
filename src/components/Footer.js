'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiBookmark, FiTrendingUp, FiTag, FiArrowRight } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [popularBlogs, setPopularBlogs] = useState([]);

  useEffect(() => {
    async function fetchFooterData() {
      try {
        const [catRes, tagRes, blogRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
          fetch('/api/blogs?published=true&limit=100'),
        ]);

        // Helper to safely parse JSON
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
        setCategories(cats.filter(c => !c.parent).slice(0, 6));

        const catMap = {};
        cats.forEach(c => {
          catMap[c._id] = c.name;
        });

        const tags = Array.isArray(tagData) ? tagData : [];
        const tagMap = {};
        tags.forEach(t => {
          tagMap[t._id] = t.name;
        });

        const blogs = (Array.isArray(blogData) ? blogData : blogData?.blogs) || [];

        // Popular blogs by views with mapped categories
        const sorted = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0));
        const mappedPopularBlogs = sorted.slice(0, 5).map(b => {
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

        // Popular tags
        const tagCounts = {};
        blogs.forEach(b => {
          if (!b) return;
          (b.tags || []).forEach(tag => {
            const tagName = tag?.name || tagMap[tag] || tag;
            if (tagName && typeof tagName === 'string') {
              tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
            }
          });
        });
        const sortedTags = Object.keys(tagCounts)
          .sort((a, b) => tagCounts[b] - tagCounts[a])
          .slice(0, 8);
        setPopularTags(sortedTags);
      } catch (error) {
        console.error('Failed to load footer data:', error);
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

  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1rem] shadow-xl ring-1 ring-white/10">
                <Image src="/logo.png" alt="Logo" width={48} height={48} className="h-full w-full object-contain bg-white p-1" />
              </div>
              <span className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors tracking-tighter">
                THE <span className="text-orange-500 italic">MANIFESTO.</span>
              </span>
            </Link>
            <p className="text-base text-slate-400 max-w-sm leading-relaxed font-medium">
              Architecting the future through code and design. A weekly journal exploring high-performance engineering and modern aesthetics.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-1.017-2.178-1.652-3.594-1.652-2.719 0-4.923 2.204-4.923 4.923 0 .385.043.76.127 1.121-4.092-.205-7.719-2.165-10.148-5.144-.424.722-.666 1.561-.666 2.457 0 1.708 1.07 3.215 2.696 4.301-.994-.031-1.93-.304-2.747-.758v.062c0 2.385 1.697 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.317 0-.626-.03-.927-.086.627 1.956 2.444 3.379 4.6 3.419-1.684 1.32-3.812 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/></svg>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-8 px-1">Archive</h4>
            <ul className="space-y-4">
              {categories.map((cat) => (
                <li key={cat._id || cat.name}>
                  <Link
                    href={`/blog/${slugify(cat.name)}`}
                    className="text-sm font-bold text-slate-400 hover:text-white transition-all hover:translate-x-1 inline-flex items-center gap-2"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-8 px-1">Topics</h4>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-orange-500 hover:border-orange-500/50 transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Blogs */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-8 px-1">Curated</h4>
            <ul className="space-y-6">
              {popularBlogs.slice(0, 3).map((blog) => (
                <li key={blog._id}>
                  <Link
                    href={`/blog/${slugify(blog.categoryName || blog.category)}/${blog.slug}`}
                    className="group block"
                  >
                    <h5 className="text-sm font-black text-slate-300 group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
                      {blog.title}
                    </h5>
                    <p className="mt-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      {(blog.views || 0).toLocaleString()} Views
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-900 mt-24 pt-12 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
              © {currentYear} THE MANIFESTO. Engineering Excellence.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/blog" className="hover:text-white transition-colors">Magazine</Link>
            <Link href="/about" className="hover:text-white transition-colors">Origins</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Legal</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Signal</Link>
            <Link href="/" className="text-orange-500 hover:text-white transition-colors">Portfolio</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}