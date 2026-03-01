'use client';

import { useState, useEffect } from 'react';
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

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setCategories(data);
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
        fetchCategories();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to add category');
      }
    } catch (error) {
      setError('An error occurred while adding the category');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category? This may affect existing blogs.')) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      } else {
        setError('Failed to delete category');
      }
    } catch (error) {
      setError('An error occurred while deleting the category');
    }
  };

  // Organize categories hierarchically
  const organizeCategories = (cats) => {
    const topLevel = cats.filter(cat => !cat.parent);
    const withChildren = topLevel.map(parent => ({
      ...parent,
      children: cats.filter(cat => cat.parent === parent._id)
    }));
    return withChildren;
  };

  const organizedCategories = organizeCategories(categories);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-[#18181B] font-space-grotesk">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={`${archivo.variable} ${spaceGrotesk.variable} min-h-screen bg-[#FAFAFA] p-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-archivo font-bold text-[#18181B]">Manage Categories</h1>
          <a
            href="/admin/dashboard"
            className="text-[#2563EB] hover:text-[#1d4ed8] font-space-grotesk cursor-pointer transition-colors duration-200"
          >
            ← Back to Dashboard
          </a>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Category Form */}
          <div className="bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm">
            <h2 className="text-xl font-archivo font-medium text-[#18181B] mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                  placeholder="e.g., Technology, Design"
                />
              </div>

              <div>
                <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                  Parent Category (optional)
                </label>
                <select
                  value={newCategory.parent}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, parent: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-archivo font-medium text-[#18181B] mb-2">
                  Category Color
                </label>
                <div className="flex items-center gap-3">
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
                    className="flex-1 px-3 py-2 border border-[#3F3F46]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent font-space-grotesk"
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-[#2563EB] text-white font-space-grotesk py-2 px-4 rounded-md hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
              >
                {adding ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white p-6 rounded-lg border border-[#3F3F46]/20 shadow-sm">
            <h2 className="text-xl font-archivo font-medium text-[#18181B] mb-4">Categories</h2>
            {organizedCategories.length === 0 ? (
              <p className="text-[#3F3F46] font-space-grotesk">No categories found. Add your first category!</p>
            ) : (
              <div className="space-y-3">
                {organizedCategories.map(category => (
                  <div key={category._id} className="border border-[#3F3F46]/10 rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color || '#6366f1' }}
                        ></span>
                        <span className="font-archivo font-medium text-[#18181B]">{category.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800 font-space-grotesk text-sm cursor-pointer transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                    {category.children && category.children.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {category.children.map(child => (
                          <div key={child._id} className="flex justify-between items-center text-sm">
                            <span className="text-[#3F3F46] font-space-grotesk">└ {child.name}</span>
                            <button
                              onClick={() => handleDeleteCategory(child._id)}
                              className="text-red-600 hover:text-red-800 font-space-grotesk text-xs cursor-pointer transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}