'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiImage, FiPlus, FiRefreshCw, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';

function toMediaItems(blogs = []) {
  return blogs
    .filter((blog) => blog.featuredImage)
    .map((blog) => ({
      id: blog._id,
      title: blog.title,
      slug: blog.slug,
      url: blog.featuredImage,
      updatedAt: blog.updatedAt || blog.createdAt,
      sizeLabel: 'Web optimized',
      type: 'Featured',
    }));
}

export default function AdminMediaPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  async function loadMedia() {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs?limit=300&published=all', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.error || 'Failed to fetch media');
      setBlogs(data.blogs || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  const mediaItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return toMediaItems(blogs).filter((item) => {
      if (!normalized) return true;
      return item.title?.toLowerCase().includes(normalized) || item.slug?.toLowerCase().includes(normalized);
    });
  }, [blogs, query]);

  return (
    <div className="space-y-3">
      <AdminPageHeader
        title="Media"
        description="Media library for featured images and embedded visual assets."
        actions={[
          { label: 'Upload', icon: <FiUploadCloud className="h-3.5 w-3.5" />, variant: 'primary' },
          { label: 'Refresh', onClick: loadMedia, icon: <FiRefreshCw className="h-3.5 w-3.5" />, variant: 'secondary' },
        ]}
      />

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search media"
          className="h-8 w-52 rounded-md border border-slate-300 px-2.5 text-xs outline-none focus:border-slate-500"
        />
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50">
          <FiPlus className="h-3.5 w-3.5" />
          New Folder
        </button>
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50">
          <FiDownload className="h-3.5 w-3.5" />
          Export Assets
        </button>
      </AdminActionToolbar>

      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <FiUploadCloud className="h-4 w-4" />
          Drop files here to upload, or click upload to send assets to Cloudinary.
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading media...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Asset</th>
                  <th className="px-3 py-2 text-left">Article</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Updated</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mediaItems.map((item) => (
                  <tr key={item.id} className="h-9 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <FiImage className="h-3.5 w-3.5 text-slate-400" />
                        <span className="max-w-[220px] truncate">{item.url}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{item.title}</td>
                    <td className="px-3 py-2">
                      <AdminStatusBadge value={item.type} variant="info" />
                    </td>
                    <td className="px-3 py-2 text-slate-500">{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-right">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-slate-700 hover:text-slate-900">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
                {!mediaItems.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-xs text-slate-500">
                      No media found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

