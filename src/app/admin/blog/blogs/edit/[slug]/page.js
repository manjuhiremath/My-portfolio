'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Archivo, Space_Grotesk } from 'next/font/google';
import { fixUnsplashUrl } from '@/lib/utils';

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

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

function generateTableHTML(rows, cols) {
  let html = '<table class="table-auto w-full border-collapse border border-gray-300 mb-4">\n';
  for (let r = 0; r < rows; r++) {
    html += '  <tr>\n';
    for (let c = 0; c < cols; c++) {
      const tag = r === 0 ? 'th' : 'td';
      html += `    <${tag} class="border border-gray-300 p-2">${r === 0 ? 'Header' : 'Cell'}</${tag}>\n`;
    }
    html += '  </tr>\n';
  }
  html += '</table><p><br></p>';
  return html;
}

function SearchableDropdown({ label, value, onChange, options, placeholder, disabled, onCreateNew, createLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCreateOption = searchTerm && !filteredOptions.some(opt =>
    opt.name.toLowerCase() === searchTerm.toLowerCase()
  );

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    onCreateNew(searchTerm);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
          {label}
        </label>
      )}
      <div
        className={`w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-space-grotesk bg-white cursor-pointer flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-[#18181B] text-sm' : 'text-[#3F3F46] text-sm'}>
          {value || placeholder}
        </span>
        <svg className={`w-4 h-4 text-[#3F3F46] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#3F3F46]/20 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-[#3F3F46]/10">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="py-1">
            {filteredOptions.length === 0 && !showCreateOption ? (
              <div className="px-4 py-3 text-sm text-[#3F3F46] text-center">
                No options found
              </div>
            ) : (
              <>
                {filteredOptions.map((option) => (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => handleSelect(option.name)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2563EB]/10 transition-colors ${
                      value === option.name ? 'bg-[#2563EB]/10 text-[#2563EB] font-medium' : 'text-[#18181B]'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
                {showCreateOption && onCreateNew && (
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="w-full px-4 py-3 text-left text-sm text-[#2563EB] hover:bg-[#2563EB]/10 border-t border-[#3F3F46]/10 font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {createLabel || `Create "${searchTerm}"`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditBlog() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const quillRef = useRef(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    featuredImage: '',
    excerpt: '',
    content: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [categories, setCategories] = useState([]);
  const [createModal, setCreateModal] = useState({ isOpen: false, type: '', name: '', loading: false });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const cats = await res.json();
        setCategories(cats);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  }, []);

  // Fetch categories and blog data on mount
  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        if (res.ok) {
          const blog = await res.json();
          
          // Handle category - could be object (populated) or ObjectId (legacy)
          let categoryValue = '';
          if (blog.category) {
            if (typeof blog.category === 'object' && blog.category.name) {
              categoryValue = blog.category.name;
            } else if (typeof blog.category === 'string') {
              categoryValue = blog.category;
            }
          }
          
          // Handle tags - could be array of objects (populated) or array of strings/ObjectIds (legacy)
          let tagsValue = '';
          if (blog.tags && Array.isArray(blog.tags)) {
            tagsValue = blog.tags.map(t => {
              if (typeof t === 'object' && t.name) return t.name;
              return t;
            }).join(', ');
          }
          
          setFormData({
            title: blog.title || '',
            slug: blog.slug || '',
            category: categoryValue,
            featuredImage: blog.featuredImage || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            tags: tagsValue,
            seoTitle: blog.seoTitle || '',
            seoDescription: blog.seoDescription || '',
            published: blog.published || false,
          });
        } else {
          setError('Blog not found');
        }
      } catch (error) {
        setError('Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
    if (slug) {
      fetchBlog();
    }
  }, [slug, fetchCategories]);

  const handleCreateCategory = async (name) => {
    setCreateModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        }),
      });

      if (!res.ok) throw new Error('Failed to create category');

      const newCategory = await res.json();
      await fetchCategories();

      setFormData(prev => ({ ...prev, category: newCategory.name }));

      setCreateModal({ isOpen: false, type: '', name: '', loading: false });
    } catch (err) {
      console.error('Failed to create category:', err);
      setCreateModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openCreateModal = (name) => {
    setCreateModal({ isOpen: true, type: 'category', name, loading: false });
  };

  const parentCategories = categories.filter(c => !c.parent);

  // Auto-generate slug from title (only if slug is empty)
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, formData.slug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const insertTable = () => {
    const tableHTML = generateTableHTML(tableRows, tableCols);
    const newContent = formData.content + tableHTML;
    setFormData(prev => ({ ...prev, content: newContent }));
    setShowTableModal(false);
  };

  const handleImageUploadInContent = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        const imgTag = `<p><img src="${data.url}" alt="Image" class="img-responsive" /></p><p><br></p>`;
        setFormData(prev => ({ ...prev, content: prev.content + imgTag }));
      } else {
        const errorData = await res.json();
        setUploadError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, featuredImage: data.url }));
      } else {
        const errorData = await res.json();
        setUploadError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      const res = await fetch(`/api/blogs/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (res.ok) {
        router.push('/admin/blog/blogs');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to update blog');
      }
    } catch (error) {
      setError('An error occurred while updating the blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/admin/blog/blogs');
      } else {
        setError('Failed to delete blog');
      }
    } catch (error) {
      setError('An error occurred while deleting the blog');
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    table: {
      rows: 10,
      cols: 5,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-indigo-500" />
          <div className="text-[#18181B] dark:text-gray-400 font-space-grotesk text-sm font-bold uppercase tracking-widest">Loading blog...</div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-red-600 font-space-grotesk">{error}</div>
      </div>
    );
  }

  return (
    <div className={`${archivo.variable} ${spaceGrotesk.variable}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-archivo font-bold text-[#18181B]">Edit Blog</h1>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 font-space-grotesk cursor-pointer transition-colors duration-200"
          >
            Delete Blog
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-[#3F3F46]/20 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
              />
            </div>

            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
              />
            </div>

            <div>
              <SearchableDropdown
                label="Category *"
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                options={parentCategories}
                placeholder="Select or create category"
                onCreateNew={(name) => openCreateModal(name)}
              />
            </div>

            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Featured Image URL
              </label>
              <div className="space-y-3">
                <input
                  type="url"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.featuredImage && (
                  <div className="mt-2">
                    <Image
                      src={fixUnsplashUrl(formData.featuredImage)}
                      alt="Featured preview"
                      width={256}
                      height={128}
                      unoptimized
                      loading="lazy"
                      className="h-32 w-auto rounded-md border border-[#3F3F46]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 font-space-grotesk cursor-pointer"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
              Content *
            </label>
            <div className="border border-[#3F3F46]/20 rounded-md mb-2">
              <ReactQuill
                ref={quillRef}
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                theme="snow"
                className="font-space-grotesk"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowTableModal(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-[#18181B] rounded-md transition-colors cursor-pointer font-space-grotesk"
              >
                + Insert Table
              </button>
              <label className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-[#18181B] rounded-md transition-colors cursor-pointer font-space-grotesk">
                + Insert Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadInContent}
                  className="hidden"
                />
              </label>
              {uploading && <span className="text-sm text-[#2563EB] py-1.5">Uploading...</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
              />
            </div>

            <div>
              <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                SEO Description
              </label>
              <input
                type="text"
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="h-4 w-4 text-[#2563EB] focus:ring-[#2563EB] border-[#3F3F46]/20 rounded"
            />
            <label className="ml-2 block text-sm font-space-grotesk text-[#18181B]">
              Published
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-[#3F3F46]/10">
            <button
              type="button"
              onClick={() => router.push('/admin/blog/blogs')}
              className="px-6 py-2 border border-[#3F3F46]/20 text-[#18181B] rounded-md hover:bg-[#3F3F46]/5 transition-colors duration-200 cursor-pointer font-space-grotesk"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer font-space-grotesk"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Table Modal */}
        {showTableModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-archivo font-semibold text-[#18181B] mb-4">Insert Table</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#18181B] mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#18181B] mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 text-[#18181B] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={insertTable}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {createModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-[#18181B] mb-2">
                Create New Category
              </h3>
              <p className="text-sm text-[#3F3F46] mb-4">
                Create &quot;<span className="font-medium text-[#18181B]">{createModal.name}</span>&quot; as a new category.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setCreateModal({ isOpen: false, type: '', name: '', loading: false })}
                  className="flex-1 py-2 px-4 border border-[#3F3F46]/20 text-[#18181B] rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={createModal.loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreateCategory(createModal.name)}
                  disabled={createModal.loading}
                  className="flex-1 py-2 px-4 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {createModal.loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>Create Category</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
