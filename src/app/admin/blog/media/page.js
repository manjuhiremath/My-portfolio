'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { 
  FiDownload, 
  FiImage, 
  FiPlus, 
  FiRefreshCw, 
  FiUploadCloud, 
  FiTrash2, 
  FiCopy, 
  FiExternalLink, 
  FiFolderPlus,
  FiX,
  FiInfo,
  FiFileText,
  FiCalendar,
  FiType,
  FiLink as FiLinkIcon
} from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const fileInputRef = useRef(null);

  async function loadMedia() {
    try {
      setLoading(true);
      
      // Fetch both blog-linked media and standalone uploads
      const [blogsRes, mediaRes] = await Promise.all([
        fetch('/api/blogs?limit=500&published=all'),
        fetch('/api/media')
      ]);

      const blogsData = await blogsRes.json();
      const mediaData = await mediaRes.json();

      if (!blogsRes.ok) throw new Error(blogsData.error || 'Failed to fetch blogs');
      if (!mediaRes.ok) throw new Error(mediaData.error || 'Failed to fetch standalone media');

      setBlogs(blogsData.blogs || []);
      setUploadedAssets(mediaData.assets || []);
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

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.asset) {
        setUploadedAssets(prev => [data.asset, ...prev]);
      }

      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAsset = async (item) => {
    if (item.slug) {
      toast.error('Deletion restricted: Asset is currently linked to an active manifesto.');
      return;
    }

    if (!item.public_id) {
      toast.error('Cannot delete: Missing public ID');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this asset from Cloudinary and your library?')) {
      return;
    }

    try {
      const res = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: item.public_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      toast.success('Asset purged successfully');
      
      // Remove from UI
      setUploadedAssets(prev => prev.filter(i => i.url !== item.url));
      setBlogs(prev => prev.map(blog => ({
        ...blog,
        sectionImages: blog.sectionImages?.filter(url => url !== item.url),
        featuredImage: blog.featuredImage === item.url ? null : blog.featuredImage
      })));
      
      if (selectedItem?.url === item.url) {
        setSelectedItem(null);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard');
  };

  const mediaItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const allItems = [...uploadedAssets, ...toMediaItems(blogs)];

    // De-duplicate by URL
    const uniqueItems = [];
    const urls = new Set();

    // Sort all items by updatedAt descending before de-duplication
    // to ensure the freshest metadata is kept
    allItems.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

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
  }, [blogs, uploadedAssets, query]);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />

      <AdminPageHeader
        title="Media Assets"
        description="Browse and manage all visual content indexed across the Digital Manifesto."
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
          <FiImage className="absolute left-2.5 top-1/2 -trangray-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search gallery..."
            className="h-8 w-64 rounded-lg border border-gray-200 pl-8 pr-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white dark:bg-gray-900 dark:border-gray-800"
          />
        </div>
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-2" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Showing {mediaItems.length} Assets
        </p>
      </AdminActionToolbar>

      <div className="flex gap-6 items-start">
        {/* Gallery Grid */}
        <section className={`flex-1 transition-all duration-500 ${selectedItem ? 'w-2/3' : 'w-full'}`}>
          {loading ? (
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3">
              {mediaItems.map((item) => (
                <motion.button
                  key={item.id}
                  layoutId={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 group
                    ${selectedItem?.id === item.id 
                      ? 'border-indigo-500 ring-4 ring-indigo-500/10 z-10 scale-105 shadow-xl' 
                      : 'border-white dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'
                    } bg-gray-50 dark:bg-gray-800`}
                >
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  
                  {item.type === 'Featured' && (
                    <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-glow shadow-indigo-500/50" />
                  )}
                </motion.button>
              ))}
              
              {!mediaItems.length && (
                <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <FiImage className="mx-auto h-10 w-10 text-gray-300 mb-4" />
                  <p className="text-sm font-bold text-gray-900 dark:text-white">No assets discovered</p>
                  <p className="text-xs text-gray-500 mt-1">Try a different search or upload a new image.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Info Sidebar */}
        <AnimatePresence>
          {selectedItem && (
            <motion.aside
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '380px' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="sticky top-24 flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <FiInfo className="text-indigo-500 h-4 w-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Asset Details</h3>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Large Preview */}
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-gray-50">
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>

                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <FiFileText className="h-3 w-3" /> File Name
                    </label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white break-all">
                      {selectedItem.url.split('/').pop() || 'Untitled Asset'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <FiLinkIcon className="h-3 w-3" /> Public URL
                    </label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={selectedItem.url} 
                        className="flex-1 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 text-[10px] font-mono text-gray-500"
                      />
                      <button 
                        onClick={() => copyToClipboard(selectedItem.url)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      >
                        <FiCopy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <FiType className="h-3 w-3" /> Asset Type
                      </label>
                      <AdminStatusBadge
                        value={selectedItem.type}
                        variant={selectedItem.type === 'Featured' ? 'indigo' : 'info'}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <FiCalendar className="h-3 w-3" /> Indexed On
                      </label>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {new Date(selectedItem.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedItem.slug && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <FiExternalLink className="h-3 w-3" /> Linked Article
                      </label>
                      <Link 
                        href={`/blog/${selectedItem.slug}`}
                        className="group block"
                      >
                        <p className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 group-hover:underline transition-all">
                          {selectedItem.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">slug: {selectedItem.slug}</p>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-6 grid grid-cols-2 gap-3">
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <FiExternalLink className="h-3.5 w-3.5" />
                    Open Original
                  </a>
                  <button
                    onClick={() => handleDeleteAsset(selectedItem)}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                    Purge Asset
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 10px var(--tw-shadow-color);
        }
      `}</style>
    </div>
  );
}
