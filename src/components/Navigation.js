'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        const topLevel = data.filter(cat => !cat.parent).slice(0, 5);
        setCategories(topLevel);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
           
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/blog"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
            >
              Blog
            </Link>
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/blog/${category.slug}`}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1.5"
              >
                {category.name}
                {category.color && (
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <div className="w-5 h-5 relative">
                <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-200 ${isMobileMenuOpen ? 'rotate-45 top-2' : 'top-1'}`}></span>
                <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-200 top-2 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-200 ${isMobileMenuOpen ? '-rotate-45 top-2' : 'top-3'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-white border-t border-gray-100`}>
        <div className="px-4 py-4 space-y-1">
          <Link
            href="/blog"
            className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Blog
          </Link>
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/blog/${category.slug}`}
              className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                {category.name}
                {category.color && (
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}