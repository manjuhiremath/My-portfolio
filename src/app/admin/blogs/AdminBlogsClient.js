'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Archivo, Space_Grotesk } from 'next/font/google';
import { toast } from 'sonner';

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
  const [categories, setCategories] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    published: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }

  async function fetchBlogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', filters.page);
      params.set('limit', filters.limit);
      if (filters.published) params.set('published', filters.published);
      if (filters.category) params.set('category', filters.category);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const res = await fetch(`/api/blogs?${params.toString()}`);
      const data = await res.json();
      
      setBlogs(data.blogs || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(name, value) {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this blog?')) {
      toast.warning('Delete cancelled');
      return;
    }
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting the blog');
    }
  }

  const topLevelCategories = Array.isArray(categories)
    ? categories.filter(cat => !cat.parent)
    : [];

  const serialStart = (pagination.page - 1) * pagination.limit + 1;

  // Helper function to generate blog URL
  function getBlogUrl(blog) {
    const catSlug = blog.category?.toLowerCase().replace(/\s+/g, '-');
    const subSlug = blog.subcategory?.toLowerCase().replace(/\s+/g, '-');

    if (catSlug && subSlug) {
      return `/blog/${catSlug}/${subSlug}/${blog.slug}`;
    } else if (catSlug) {
      return `/blog/${catSlug}/${blog.slug}`;
    }
    return `/blog/${blog.slug}`;
  }

  function openPreview(url) {
    const previewTab = window.open(url, '_blank');
    if (!previewTab) {
      toast.warning('Please allow popups to open preview in a new tab');
    }
  }

  return (
    <div className={`${archivo.variable} ${spaceGrotesk.variable}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3 md:mb-3">
          <h1 className="text-2xl md:text-3xl font-archivo font-bold text-[#18181B]">Manage Blogs</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/blogs/generate"
              className="bg-[#7c3aed] text-white font-space-grotesk py-1 md:py-2 px-3 md:px-6 rounded-md hover:bg-[#6d28d9] transition-colors duration-200 cursor-pointer text-sm"
            >
              AI Generator
            </Link>
            <Link
              href="/admin/blogs/create"
              className="bg-[#2563EB] text-white font-space-grotesk py-1 md:py-2 px-3 md:px-6 rounded-md hover:bg-[#1d4ed8] transition-colors duration-200 cursor-pointer text-sm"
            >
              Create New
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-2 rounded-lg border border-[#3F3F46]/20 shadow-sm mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1">Status</label>
              <select
                value={filters.published}
                onChange={(e) => handleFilterChange('published', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
              >
                <option value="">All</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
              >
                <option value="">All Categories</option>
                {topLevelCategories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  page: 1,
                  limit: 10,
                  published: '',
                  category: '',
                  startDate: '',
                  endDate: ''
                })}
                className="w-full px-4 py-2 bg-gray-100 text-[#18181B] rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <p className="text-sm text-[#3F3F46] font-space-grotesk">
            Showing {blogs.length > 0 ? serialStart : 0} - {serialStart + blogs.length - 1} of {pagination.total} blogs
          </p>
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            className="px-3 py-1 border border-[#3F3F46]/20 rounded-md text-sm"
          >
            <option value="5">5/page</option>
            <option value="10">10/page</option>
            <option value="25">25/page</option>
            <option value="50">50/page</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-lg border border-[#3F3F46]/20 shadow-sm text-center">
            <p className="text-[#3F3F46] font-space-grotesk">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-[#3F3F46]/20 shadow-sm text-center">
            <p className="text-[#3F3F46] font-space-grotesk text-lg">No blogs found. Create your first blog post!</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {blogs.map((blog) => (
                <div key={blog._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{blog.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{blog.category} / {blog.subcategory}</p>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${
                        blog.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {blog.views?.toLocaleString() || 0}
                      </div>
                      <span>Published: {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}</span>
                      <span>Updated: {blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openPreview(getBlogUrl(blog))}
                          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <Link
                          href={`/admin/blogs/edit/${blog.slug}`}
                          className="p-2 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-t-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase border-b border-r border-slate-200">Title</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase border-b border-r border-slate-200">Slug</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase border-b border-r border-slate-200">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase border-b border-r border-slate-200">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase border-b border-r border-slate-200">Views</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase border-b border-r border-slate-200">Published</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase border-b border-r border-slate-200">Updated</th>
                    <th className="px-3 py-2 text-center bg-slate-100 text-xs font-semibold text-slate-600 uppercase border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 border-r border-slate-100">
                        <div className="text-sm font-semibold text-slate-900">{blog.title}</div>
                        <div className="text-xs text-slate-500">{blog.subcategory}</div>
                      </td>
                      <td className="px-3 py-2 border-r border-slate-100">
                        <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{blog.slug}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">{blog.category}</td>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          blog.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {blog.views?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500 border-r border-slate-100">
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500 border-r border-slate-100">
                        {blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : new Date(blog.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right bg-slate-100 border-l border-slate-500 text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openPreview(getBlogUrl(blog))}
                            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <Link
                            href={`/admin/blogs/edit/${blog.slug}`}
                            className="p-2 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-0 border border-gray-300 p-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-[#3F3F46]/20 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-[#3F3F46]/20 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Prev
                </button>
                {[...Array(pagination.totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          pageNum === pagination.page
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'border-[#3F3F46]/20 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                    return <span key={pageNum} className="px-1">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-[#3F3F46]/20 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-[#3F3F46]/20 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
