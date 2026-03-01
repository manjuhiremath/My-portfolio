'use client';

import { useEffect, useState } from 'react';
import { Archivo, Space_Grotesk } from 'next/font/google';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-archivo',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    published: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/blogs');
        const blogs = await res.json();
        const total = blogs.length;
        const drafts = blogs.filter(blog => !blog.published).length;
        const published = blogs.filter(blog => blog.published).length;
        setStats({ total, drafts, published });
      } catch (error) {
        console.error('Failed to fetch blog stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-[#18181B] font-space-grotesk">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${archivo.variable} ${spaceGrotesk.variable} min-h-screen bg-[#FAFAFA] p-8`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-archivo font-bold text-[#18181B] mb-8">Blog Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm">
            <h2 className="text-xl font-archivo font-medium text-[#18181B] mb-2">Total Posts</h2>
            <p className="text-3xl font-space-grotesk font-bold text-[#2563EB]">{stats.total}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm">
            <h2 className="text-xl font-archivo font-medium text-[#18181B] mb-2">Draft Posts</h2>
            <p className="text-3xl font-space-grotesk font-bold text-[#3F3F46]">{stats.drafts}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm">
            <h2 className="text-xl font-archivo font-medium text-[#18181B] mb-2">Published Posts</h2>
            <p className="text-3xl font-space-grotesk font-bold text-[#2563EB]">{stats.published}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm">
            <h3 className="text-lg font-archivo font-medium text-[#18181B] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/blogs/create"
                className="block w-full bg-[#2563EB] text-white font-space-grotesk py-3 px-4 rounded-md text-center hover:bg-[#1d4ed8] transition-colors duration-200 cursor-pointer"
              >
                Create New Blog
              </a>
              <a
                href="/admin/blogs"
                className="block w-full bg-[#3F3F46] text-white font-space-grotesk py-3 px-4 rounded-md text-center hover:bg-[#2a2a33] transition-colors duration-200 cursor-pointer"
              >
                Manage Blogs
              </a>
              <a
                href="/admin/categories"
                className="block w-full bg-[#3F3F46] text-white font-space-grotesk py-3 px-4 rounded-md text-center hover:bg-[#2a2a33] transition-colors duration-200 cursor-pointer"
              >
                Manage Categories
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm">
            <h3 className="text-lg font-archivo font-medium text-[#18181B] mb-4">Recent Activity</h3>
            <p className="text-[#3F3F46] font-space-grotesk">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}