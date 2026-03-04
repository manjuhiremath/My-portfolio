'use client';

import { useState, useEffect } from 'react';
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

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', parent: '', color: '#6366f1' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    try {
      const dataToSubmit = {
        name: newCategory.name.trim(),
        slug: newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        parent: newCategory.parent || null,
        color: newCategory.color,
      };

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (res.ok) {
        setNewCategory({ name: '', parent: '', color: '#6366f1' });
        setShowForm(false);
        toast.success('Category added successfully');
        fetchCategories();
      } else {
        const errorData = await res.json();
        const message = errorData.message || 'Failed to add category';
        setError(message);
        toast.error(message);
      }
    } catch (error) {
      const message = 'An error occurred while adding the category';
      setError(message);
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category? This may affect existing blogs.')) {
      toast.warning('Delete cancelled');
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        setError('Failed to delete category');
        toast.error('Failed to delete category');
      }
    } catch (error) {
      setError('An error occurred while deleting the category');
      toast.error('An error occurred while deleting the category');
    }
  };

  const organizeCategories = (cats) => {
    const topLevel = cats.filter(cat => !cat.parent);
    return topLevel.map(parent => ({
      ...parent,
      children: cats.filter(cat => cat.parent === parent._id)
    }));
  };

  const organizedCategories = organizeCategories(categories);
  const topLevelCategories = categories.filter(cat => !cat.parent);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-[#18181B] font-space-grotesk">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={`${archivo.variable} ${spaceGrotesk.variable}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-archivo font-bold text-[#18181B]">Manage Categories</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Add Category Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#2563EB] text-white font-space-grotesk py-3 px-6 rounded-md hover:bg-[#1d4ed8] transition-colors duration-200 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Cancel' : 'Add New Category'}
          </button>
        </div>

        {/* Add Category Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm mb-8">
            <h2 className="text-xl font-archivo font-medium text-[#18181B] mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                  placeholder="e.g., Technology, Design"
                />
              </div>

              <div>
                <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                  Parent Category
                </label>
                <select
                  value={newCategory.parent}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, parent: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                >
                  <option value="">None (Top Level)</option>
                  {topLevelCategories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                  Category Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded-md border border-[#3F3F46]/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-1.5 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={adding}
                  className="w-full bg-[#2563EB] text-white font-space-grotesk py-2 px-4 rounded-md hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                >
                  {adding ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizedCategories.map(category => (
            <div 
              key={category._id} 
              className="bg-white rounded-lg border border-[#3F3F46]/20 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4 border-b border-[#3F3F46]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color || '#6366f1' }}
                    ></span>
                    <span className="font-archivo font-semibold text-[#18181B] text-lg">
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {category.children && category.children.length > 0 ? (
                <div className="p-4 bg-gray-50">
                  <p className="text-xs font-medium text-[#3F3F46] mb-2 uppercase tracking-wide">
                    Subcategories ({category.children.length})
                  </p>
                  <div className="space-y-2">
                    {category.children.map(child => (
                      <div key={child._id} className="flex items-center justify-between bg-white p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: child.color || '#6366f1' }}
                          ></span>
                          <span className="text-sm font-space-grotesk text-[#18181B]">
                            {child.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(child._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50">
                  <p className="text-xs text-[#3F3F46]">No subcategories</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {organizedCategories.length === 0 && (
          <div className="bg-white p-8 rounded-lg border border-[#3F3F46]/20 shadow-sm text-center">
            <p className="text-[#3F3F46] font-space-grotesk text-lg">No categories found. Add your first category!</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm">
          <h3 className="text-lg font-archivo font-medium text-[#18181B] mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#2563EB]/5 rounded-lg">
              <p className="text-2xl font-bold text-[#2563EB]">{topLevelCategories.length}</p>
              <p className="text-sm text-[#3F3F46]">Main Categories</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{categories.length - topLevelCategories.length}</p>
              <p className="text-sm text-[#3F3F46]">Subcategories</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              <p className="text-sm text-[#3F3F46]">Total Categories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
