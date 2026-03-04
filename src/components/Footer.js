'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-semibold text-slate-800 group-hover:text-slate-600 transition-colors">
                Manjunath M
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 max-w-sm">
              Full-stack developer and tech enthusiast sharing insights on technology, design, and business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/blog/technology" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/blog/design" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  Design
                </Link>
              </li>
              <li>
                <Link href="/blog/business" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog/technology/web-development" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/blog/technology/ai" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link href="/blog/design/ui-ux" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link href="/blog/business/startup" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  Startup
                </Link>
              </li>
              <li>
                <Link href="/blog/personal-development/productivity" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  Productivity
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} Manjunath M. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}