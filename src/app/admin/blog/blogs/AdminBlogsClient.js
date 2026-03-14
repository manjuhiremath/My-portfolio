'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowDown,
  FiArrowUp,
  FiFilter,
  FiFolderPlus,
  FiMoreHorizontal,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiZap,
  FiTrash2,
  FiExternalLink,
} from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';
import { calculateBlogSeoScore } from '@/lib/seo/score';

const PAGE_SIZE = 12;

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function getSeoVariant(score) {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'danger';
}

function sortRows(rows, sortBy, sortDirection) {
  const multiplier = sortDirection === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    if (sortBy === 'title') return left.title.localeCompare(right.title) * multiplier;
    if (sortBy === 'seoScore') return ((left.seoScore || 0) - (right.seoScore || 0)) * multiplier;
    if (sortBy === 'views') return ((left.views || 0) - (right.views || 0)) * multiplier;
    if (sortBy === 'status') return (Number(left.published) - Number(right.published)) * multiplier;
    const leftDate = new Date(left.publishedAt || left.createdAt || 0).getTime();
    const rightDate = new Date(right.publishedAt || right.createdAt || 0).getTime();
    return (leftDate - rightDate) * multiplier;
  });
}

export default function AdminBlogsClient() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        const [blogsRes, categoriesRes] = await Promise.all([
          fetch('/api/blogs?limit=300&published=all', { signal: controller.signal }),
          fetch('/api/categories', { signal: controller.signal }),
        ]);

        const blogsJson = await blogsRes.json();
        const categoriesJson = await categoriesRes.json();

        if (!blogsRes.ok || blogsJson.success === false) {
          throw new Error(blogsJson.error || 'Failed to fetch blogs');
        }
        if (!categoriesRes.ok) {
          throw new Error(categoriesJson.error || 'Failed to fetch categories');
        }

        const rows = (blogsJson.blogs || []).map((blog) => ({
          ...blog,
          seoScore: blog.seoScore && blog.seoScore > 0 ? blog.seoScore : calculateBlogSeoScore(blog),
        }));

        setBlogs(rows);
        setCategories(Array.isArray(categoriesJson) ? categoriesJson : []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Load data error:', error);
        toast.error(error.message || 'Failed to load blogs');
      } finally {
        setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, []);

  const topLevelCategories = useMemo(() => categories.filter((item) => !item.parent), [categories]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = blogs.filter((blog) => {
      const matchesQuery =
        !normalizedQuery ||
        blog.title?.toLowerCase().includes(normalizedQuery) ||
        blog.slug?.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        status === 'all' ||
        (status === 'published' && blog.published) ||
        (status === 'draft' && !blog.published);
      const matchesCategory = category === 'all' || 
        blog.category?.name === category || 
        blog.category === category ||
        (typeof blog.category === 'object' && blog.category?._id === category);
      return matchesQuery && matchesStatus && matchesCategory;
    });

    return sortRows(rows, sortBy, sortDirection);
  }, [blogs, category, query, sortBy, sortDirection, status]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, status, category, sortBy, sortDirection]);

  async function refresh() {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs?limit=300&published=all');
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Failed to refresh blogs');
      }
      setBlogs((data.blogs || []).map((blog) => ({ ...blog, seoScore: calculateBlogSeoScore(blog) })));
      toast.success('Blogs refreshed');
    } catch (error) {
      toast.error(error.message || 'Failed to refresh blogs');
    } finally {
      setLoading(false);
    }
  }

  async function removeBlog(target) {
    const confirmed = window.confirm(`Delete "${target.title}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/blogs/${target._id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete blog');
      setBlogs((rows) => rows.filter((row) => row._id !== target._id));
      toast.success('Blog deleted');
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setActiveAction(null);
    }
  }

  function previewBlog(target) {
    const categoryName = target.category?.name || target.category || 'uncategorized';
    // Use a simple slugify logic if utility not imported, or handle string directly
    const categorySlug = String(categoryName)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
      
    const url = `/blog/${categorySlug}/${target.slug}`;
    window.open(url, '_blank');
  }

  async function togglePublish(target) {
    try {
      const response = await fetch(`/api/blogs/${target.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !target.published }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update blog status');

      setBlogs((rows) =>
        rows.map((row) =>
          row._id === target._id
            ? {
                ...row,
                ...data,
                seoScore: calculateBlogSeoScore({ ...row, ...data }),
              }
            : row
        )
      );
      toast.success(!target.published ? 'Blog published' : 'Moved to draft');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setActiveAction(null);
    }
  }

  function changeSort(nextSortBy) {
    if (sortBy === nextSortBy) {
      setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(nextSortBy);
    setSortDirection('desc');
  }

  return (
    <div className="space-y-3">
      <AdminPageHeader
        title="Blogs"
        description="Compact blog operations table with quick SEO controls."
        actions={[
          { label: 'Generate AI Blog', href: '/admin/blog/blogs/generate', icon: <FiZap className="h-3.5 w-3.5" />, variant: 'secondary' },
          { label: 'Create Blog', href: '/admin/blog/blogs/create', icon: <FiPlus className="h-3.5 w-3.5" />, variant: 'primary' },
        ]}
      />

      <AdminActionToolbar>
        <label className="relative">
          <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -trangray-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or slug"
            className="h-8 w-56 rounded-md border border-gray-300 pl-8 pr-2 text-xs outline-none focus:border-gray-500"
          />
        </label>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-8 rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-gray-500"
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-8 rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-gray-500"
        >
          <option value="all">All categories</option>
          {topLevelCategories.map((item) => (
            <option key={item._id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-300 px-2.5 text-xs text-gray-700 hover:bg-gray-50">
          <FiFilter className="h-3.5 w-3.5" />
          Advanced Filters
        </button>

        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-300 px-2.5 text-xs text-gray-700 hover:bg-gray-50">
          <FiFolderPlus className="h-3.5 w-3.5" />
          Import Content
        </button>

        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-300 px-2.5 text-xs text-gray-700 hover:bg-gray-50">
          Bulk Actions
        </button>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-300 px-2.5 text-xs text-gray-700 hover:bg-gray-50"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </AdminActionToolbar>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-3 py-2 text-[11px] text-gray-500">
          Showing {pagedRows.length} of {filteredRows.length} blogs
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading blogs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <button type="button" onClick={() => changeSort('title')} className="inline-flex items-center gap-1 font-medium">
                      Title
                      {sortBy === 'title' ? (sortDirection === 'asc' ? <FiArrowUp className="h-3 w-3" /> : <FiArrowDown className="h-3 w-3" />) : null}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">
                    <button type="button" onClick={() => changeSort('seoScore')} className="inline-flex items-center gap-1 font-medium">
                      SEO Score
                      {sortBy === 'seoScore' ? (sortDirection === 'asc' ? <FiArrowUp className="h-3 w-3" /> : <FiArrowDown className="h-3 w-3" />) : null}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left">
                    <button type="button" onClick={() => changeSort('views')} className="inline-flex items-center gap-1 font-medium">
                      Views
                      {sortBy === 'views' ? (sortDirection === 'asc' ? <FiArrowUp className="h-3 w-3" /> : <FiArrowDown className="h-3 w-3" />) : null}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left">
                    <button type="button" onClick={() => changeSort('updated')} className="inline-flex items-center gap-1 font-medium">
                      Published Date
                      {sortBy === 'updated' ? (sortDirection === 'asc' ? <FiArrowUp className="h-3 w-3" /> : <FiArrowDown className="h-3 w-3" />) : null}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left">
                    <button type="button" onClick={() => changeSort('status')} className="inline-flex items-center gap-1 font-medium">
                      Status
                      {sortBy === 'status' ? (sortDirection === 'asc' ? <FiArrowUp className="h-3 w-3" /> : <FiArrowDown className="h-3 w-3" />) : null}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedRows.map((blog) => (
                  <tr key={blog._id} className="h-9 hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <p className="max-w-[320px] truncate font-medium text-gray-800">{blog.title}</p>
                      <p className="truncate text-[11px] text-gray-500">{blog.slug}</p>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {typeof blog.category === 'object' ? (blog.category?.name || 'Uncategorized') : 'Uncategorized'}
                    </td>
                    <td className="px-3 py-2">
                      <AdminStatusBadge value={`${blog.seoScore}/100`} variant={getSeoVariant(blog.seoScore)} />
                    </td>
                    <td className="px-3 py-2 text-gray-600">{formatNumber(blog.views)}</td>
                    <td className="px-3 py-2 text-gray-600">{formatDate(blog.publishedAt || blog.createdAt)}</td>
                    <td className="px-3 py-2">
                      <AdminStatusBadge value={blog.published ? 'Published' : 'Draft'} variant={blog.published ? 'success' : 'warning'} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="ml-auto flex w-fit items-center gap-1">
                        <button
                          type="button"
                          onClick={() => previewBlog(blog)}
                          className="inline-flex h-7 items-center rounded border border-gray-300 px-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <FiExternalLink className="mr-1 h-3 w-3" />
                          Preview
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveAction((value) => (value === blog._id ? null : blog._id))}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <FiMoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          {activeAction === blog._id ? (
                            <div className="absolute right-0 top-8 z-10 w-36 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                              <Link
                                href={`/admin/blog/blogs/edit/${blog.slug}`}
                                className="flex h-7 w-full items-center rounded px-2 text-left text-[11px] text-gray-700 hover:bg-gray-100"
                              >
                                Quick Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => togglePublish(blog)}
                                className="flex h-7 w-full items-center rounded px-2 text-left text-[11px] text-gray-700 hover:bg-gray-100"
                              >
                                {blog.published ? 'Move to draft' : 'Publish now'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBlog(blog)}
                                className="flex h-7 w-full items-center gap-1 rounded px-2 text-left text-[11px] text-rose-600 hover:bg-rose-50"
                              >
                                <FiTrash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                {!pagedRows.length ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-xs text-gray-500">
                      No blogs found for current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
          <p className="text-[11px] text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              className="inline-flex h-7 items-center rounded border border-gray-300 px-2 text-[11px] text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages}
              className="inline-flex h-7 items-center rounded border border-gray-300 px-2 text-[11px] text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
