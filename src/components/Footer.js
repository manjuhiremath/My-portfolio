'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    <footer className="bg-slate-900 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                <FiBookmark className="h-4 w-4" />
              </div>
              <span className="font-bold text-white group-hover:text-orange-400 transition-colors">
                Dev<span className="text-orange-500">Blog</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-400 max-w-xs leading-relaxed">
              Full-stack developer and tech enthusiast sharing insights on technology, design, and business.
            </p>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="h-4 w-4 text-orange-500" />
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Categories</h4>
            </div>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat._id || cat.name}>
                  <Link
                    href={`/blog/${slugify(cat.name)}`}
                    className="text-sm text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1 group"
                  >
                    <FiArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiTag className="h-4 w-4 text-orange-500" />
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Tags</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-orange-500/20 hover:text-orange-400 transition-all border border-slate-700"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Blogs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiBookmark className="h-4 w-4 text-orange-500" />
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Popular</h4>
            </div>
            <ul className="space-y-3">
              {popularBlogs.map((blog) => (
                <li key={blog._id}>
                  <Link
                    href={`/blog/${slugify(blog.categoryName || blog.category)}/${blog.slug}`}
                    className="text-sm text-slate-400 hover:text-orange-400 transition-colors line-clamp-2 leading-snug"
                  >
                    {blog.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} Manjunath M. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/blog" className="hover:text-orange-400 transition-colors">Blog</Link>
            <span className="h-3 w-px bg-slate-700" />
            <Link href="/" className="hover:text-orange-400 transition-colors">Portfolio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}