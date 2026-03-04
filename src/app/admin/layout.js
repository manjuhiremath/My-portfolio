'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  },
  {
    name: 'Blogs',
    href: '/admin/blogs',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2',
  },
  {
    name: 'Create Blog',
    href: '/admin/blogs/create',
    icon: 'M12 4v16m8-8H4',
  },
  {
    name: 'AI Generator',
    href: '/admin/blogs/generate',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  },
  {
    name: 'AI Models',
    href: '/admin/ai-models',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  }
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 text-[13px] leading-snug">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '6px',
            border: '1px solid #dbe2ea',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '13px',
          },
        }}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[220px] border-r border-slate-700/80 bg-slate-900 text-slate-200 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-12 items-center border-b border-slate-700/80 px-3">
          <Link href="/admin/dashboard" className="text-sm font-semibold tracking-tight text-slate-100">
            Control Panel
          </Link>
        </div>

        <nav className="px-2 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors duration-150 ${
                      isActive
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <svg className="h-[17px] w-[17px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                    </svg>
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-700/80 p-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-300 transition-colors duration-150 hover:bg-slate-800 hover:text-slate-100"
          >
            <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>View Site</span>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[220px]">
        <header className="sticky top-0 z-20 h-12 border-b border-slate-200 bg-white">
          <div className="flex h-full items-center gap-3 px-4">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors duration-150 hover:bg-slate-50 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-500">Admin / Dashboard</p>
            </div>

            <div className="hidden min-w-[280px] max-w-[420px] flex-1 items-center md:flex">
              <div className="relative w-full">
                <svg
                  className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 text-[13px] text-slate-700 outline-none transition duration-150 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <button
              type="button"
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors duration-150 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"
                />
              </svg>
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
              AD
            </div>
          </div>
        </header>

        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
