'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import {
  FiBarChart2,
  FiBookOpen,
  FiChevronRight,
  FiGrid,
  FiImage,
  FiLayers,
  FiMenu,
  FiPenTool,
  FiSearch,
  FiSettings,
  FiTarget,
  FiTag,
  FiX,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/blog/dashboard', icon: FiGrid },
  { label: 'Blogs', href: '/admin/blog/blogs', icon: FiBookOpen },
  { label: 'Categories', href: '/admin/blog/categories', icon: FiLayers },
  { label: 'Tags', href: '/admin/blog/tags', icon: FiTag },
  { label: 'Media', href: '/admin/blog/media', icon: FiImage },
  { label: 'SEO Tools', href: '/admin/blog/seo-tools', icon: FiTarget },
  { label: 'Analytics', href: '/admin/blog/analytics', icon: FiBarChart2 },
  { label: 'AI Writer', href: '/admin/blog/ai-writer', icon: FiPenTool },
  { label: 'Settings', href: '/admin/blog/settings', icon: FiSettings },
];

function getCurrentItem(pathname) {
  return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentItem = useMemo(() => getCurrentItem(pathname), [pathname]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            border: '1px solid #dbe2ea',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '12px',
          },
        }}
      />

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[224px] border-r border-slate-800 bg-slate-950 text-slate-200 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-11 items-center border-b border-slate-800 px-3">
          <Link href="/admin/blog/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-[11px] font-bold text-emerald-300">
              SEO
            </span>
            <span>Content Ops</span>
          </Link>
        </div>

        <nav className="px-2 py-2">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="lg:pl-[224px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-11 items-center gap-2 px-3 md:px-4">
            <button
              type="button"
              aria-label="Open sidebar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen((state) => !state)}
            >
              {sidebarOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
            </button>

            <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
              <span>Admin</span>
              <FiChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-slate-700">{currentItem?.label || 'Workspace'}</span>
            </div>

            <div className="relative ml-auto hidden w-full max-w-xs md:block">
              <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search"
                className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 text-xs outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            <Link
              href="/admin/blog/blogs/create"
              className="inline-flex h-8 items-center rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800"
            >
              Create Blog
            </Link>
          </div>
        </header>

        <main className="min-h-[calc(100vh-44px)] p-3 md:p-4">{children}</main>
      </div>
    </div>
  );
}

