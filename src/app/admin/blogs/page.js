'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-[#18181B] font-space-grotesk">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className={`${archivo.variable} ${spaceGrotesk.variable} min-h-screen bg-[#FAFAFA] p-8`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-archivo font-bold text-[#18181B]">Manage Blogs</h1>
          <Link
            href="/admin/blogs/create"
            className="bg-[#2563EB] text-white font-space-grotesk py-3 px-6 rounded-md hover:bg-[#1d4ed8] transition-colors duration-200 cursor-pointer"
          >
            Create New Blog
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-[#3F3F46]/20 shadow-sm text-center">
            <p className="text-[#3F3F46] font-space-grotesk text-lg">No blogs found. Create your first blog post!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#3F3F46]/20 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#3F3F46]/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-archivo font-medium text-[#18181B] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-archivo font-medium text-[#18181B] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-archivo font-medium text-[#18181B] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-archivo font-medium text-[#18181B] uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-archivo font-medium text-[#18181B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3F3F46]/10">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-[#3F3F46]/5 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-space-grotesk font-medium text-[#18181B]">
                        {blog.title}
                      </div>
                      <div className="text-sm text-[#3F3F46]">
                        /{blog.category}/{blog.subcategory}/{blog.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-space-grotesk text-[#18181B]">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          blog.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-space-grotesk text-[#3F3F46]">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/blogs/edit/${blog._id}`}
                        className="text-[#2563EB] hover:text-[#1d4ed8] font-space-grotesk text-sm cursor-pointer transition-colors duration-200"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/admin/dashboard"
            className="text-[#2563EB] hover:text-[#1d4ed8] font-space-grotesk cursor-pointer transition-colors duration-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}