'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { FiDownload, FiImage, FiPlus, FiRefreshCw, FiUploadCloud, FiTrash2, FiCopy, FiExternalLink, FiFolderPlus } from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';
import Image from 'next/image';

function toMediaItems(blogs = []) {
  const items = [];
  
  blogs.forEach((blog) => {
    // Add featured image
    if (blog.featuredImage) {
      items.push({
        id: `${blog._id}-featured`,
        title: blog.title,
        slug: blog.slug,
        url: blog.featuredImage,
        updatedAt: blog.updatedAt || blog.createdAt,
        sizeLabel: 'Web optimized',
        type: 'Featured',
      });
    }
    
    // Add section images
    if (Array.isArray(blog.sectionImages)) {
      blog.sectionImages.forEach((img, idx) => {
        if (img) {
          items.push({
            id: `${blog._id}-section-${idx}`,
            title: blog.title,
            slug: blog.slug,
            url: img,
            updatedAt: blog.updatedAt || blog.createdAt,
            sizeLabel: 'Section asset',
            type: 'Section',
          });
        }
      });
    }
  });
  
  return items;
}

export default function AdminMediaPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function loadMedia() {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs?limit=300&published=all');
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      toast.success('File uploaded successfully to Cloudinary');
      
      // Copy URL to clipboard
      navigator.clipboard.writeText(data.url);
      toast.info('Image URL copied to clipboard');
      
      // Refresh list
      loadMedia();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard');
  };

  const handleExportData = () => {
    const exportData = mediaItems.map(item => ({
      filename: item.url.split('/').pop(),
      url: item.url,
      linkedArticle: item.title,
      articleSlug: item.slug,
      type: item.type,
      updatedAt: item.updatedAt
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `media-library-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${exportData.length} assets`);
  };

  const handleNewFolder = () => {
    toast.info('Cloudinary folder creation - Use Cloudinary dashboard for folder management');
  };

  const mediaItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const allItems = toMediaItems(blogs);
    
    // De-duplicate by URL
    const uniqueItems = [];
    const urls = new Set();
    
    allItems.forEach(item => {
      if (!urls.has(item.url)) {
        urls.add(item.url);
        uniqueItems.push(item);
      }
    });

    return uniqueItems.filter((item) => {
      if (!normalized) return true;
      return (
        item.title?.toLowerCase().includes(normalized) || 
        item.slug?.toLowerCase().includes(normalized) ||
        item.url?.toLowerCase().includes(normalized)
      );
    });
  }, [blogs, query]);

  return (
    <div className="space-y-3">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileUpload}
      />
      
      <AdminPageHeader
        title="Media Library"
        description="Manage featured images and visual assets across all blog posts."
        actions={[
          { 
            label: uploading ? 'Uploading...' : 'Upload Asset', 
            onClick: () => fileInputRef.current?.click(),
            icon: <FiUploadCloud className="h-3.5 w-3.5" />, 
            variant: 'primary',
            disabled: uploading
          },
          { label: 'Refresh', onClick: loadMedia, icon: <FiRefreshCw className="h-3.5 w-3.5" />, variant: 'secondary' },
        ]}
      />

      <AdminActionToolbar>
        <div className="relative">
          <FiImage className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assets or articles..."
            className="h-8 w-64 rounded-md border border-slate-300 pl-8 pr-2.5 text-xs outline-none focus:border-slate-500 transition-all"
          />
        </div>
        <div className="h-4 w-px bg-slate-200 mx-1" />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <FiPlus className="h-3.5 w-3.5 text-indigo-500" />
          Quick Upload
        </button>
        <button 
          onClick={handleNewFolder}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <FiFolderPlus className="h-3.5 w-3.5 text-indigo-500" />
          New Folder
        </button>
        <button 
          onClick={handleExportData}
          type="button" 
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50"
        >
          <FiDownload className="h-3.5 w-3.5" />
          Export Data
        </button>
      </AdminActionToolbar>

      {uploading && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 flex items-center gap-3 animate-pulse">
          <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/2 animate-[progress_2s_ease-in-out_infinite]" />
          </div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Uploading to Cloudinary...</span>
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500 mb-2" />
            <p className="text-xs text-slate-500 font-medium">Scanning assets library...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.05em] font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left w-16">Preview</th>
                  <th className="px-4 py-3 text-left">Asset Details</th>
                  <th className="px-4 py-3 text-left">Linked Article</th>
                  <th className="px-4 py-3 text-left">Context</th>
                  <th className="px-4 py-3 text-left">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mediaItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2">
                      <div className="relative h-10 w-10 overflow-hidden rounded border border-slate-200 bg-slate-50">
                        <Image
                          src={item.url}
                          alt={item.title}
                          fill
                          sizes="40px"
                          className="object-cover transition-transform group-hover:scale-110"
                          unoptimized={true}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="font-semibold text-slate-800 truncate" title={item.url.split('/').pop()}>
                          {item.url.split('/').pop() || 'Unnamed Asset'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate font-mono">{item.url}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col max-w-[180px]">
                        <span className="text-slate-700 truncate font-medium">{item.title}</span>
                        <span className="text-[10px] text-slate-400">slug: {item.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <AdminStatusBadge 
                        value={item.type} 
                        variant={item.type === 'Featured' ? 'indigo' : 'info'} 
                      />
                    </td>
                    <td className="px-4 py-2 text-slate-500 font-medium">
                      {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => copyToClipboard(item.url)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Copy URL"
                        >
                          <FiCopy className="h-3.5 w-3.5" />
                        </button>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="View Original"
                        >
                          <FiExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {!mediaItems.length ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                          <FiImage className="h-6 w-6 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">No visual assets discovered</p>
                          <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
                            We couldn&apos;t find any images linked to your blogs or in your library.
                          </p>
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full transition-colors"
                        >
                          Upload first asset
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
      
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

