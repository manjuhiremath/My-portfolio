'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  FiFilter, FiPlus, FiRefreshCw, FiTrash2, 
  FiX, FiEdit2, FiCheck, FiFolder 
} from 'react-icons/fi';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';

function toSlug(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminCategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [newName, setNewName] = useState('');
  const [editItem, setEditingItem] = useState(null); // { id, name, slug }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (error) {
      toast.error('Failed to load category data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(c => 
      c.name?.toLowerCase().includes(q) || 
      c.slug?.toLowerCase().includes(q)
    );
  }, [categories, query]);

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          slug: toSlug(newName),
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create category');
      
      setNewName('');
      toast.success('Category created');
      await fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategory(id) {
    const name = categories.find(c => c._id === id)?.name;
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      
      toast.success('Category deleted');
      await fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleUpdateCategory(id, data) {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update category');
      
      setEditingItem(null);
      toast.success('Updated successfully');
      await fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-3">
      <AdminPageHeader
        title="Manage Categories"
        description="Organize blog content. Edit names, slugs, and view stats."
        actions={[
          { 
            label: 'Refresh', 
            onClick: fetchData, 
            icon: <FiRefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />, 
            variant: 'secondary' 
          }
        ]}
      />

      <div className="space-y-3">
        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-xs font-bold text-slate-900 flex items-center gap-2">
            <FiFolder className="text-indigo-500 h-3.5 w-3.5" />
            Quick Add
          </h3>
          <form onSubmit={handleCreateCategory} className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name..."
              className="h-8 flex-1 rounded-md border border-slate-300 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              <FiPlus className="h-3 w-3" />
              Create
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Categories Inventory</h3>
            <div className="relative">
              <FiFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-3 w-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 w-36 rounded border border-slate-300 pl-7 pr-2 text-[11px] outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 font-bold w-1/3">Category Name</th>
                  <th className="px-3 py-2 font-bold text-center">Blogs</th>
                  <th className="px-3 py-2 font-bold text-center">Views</th>
                  <th className="px-3 py-2 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat._id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-3 py-2">
                      {editItem?.id === cat._id ? (
                        <div className="flex gap-1 items-center py-1">
                          <input
                            autoFocus
                            value={editItem.name}
                            onChange={(e) => setEditingItem({ ...editItem, name: e.target.value })}
                            className="h-7 w-full rounded border border-indigo-300 px-2 text-xs outline-none"
                          />
                          <button 
                            onClick={() => handleUpdateCategory(cat._id, { name: editItem.name, slug: toSlug(editItem.name) })}
                            className="p-1 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100"
                          >
                            <FiCheck className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => setEditingItem(null)}
                            className="p-1 bg-slate-50 text-slate-600 rounded border border-slate-200 hover:bg-slate-100"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono lowercase">
                              /{cat.slug}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(cat.tags || []).slice(0, 5).map((tag) => (
                              <span 
                                key={tag._id || tag} 
                                className="inline-flex items-center rounded bg-slate-50 px-1 py-0.5 text-[8px] font-medium text-slate-500 border border-slate-100"
                              >
                                #{tag.name || tag}
                              </span>
                            ))}
                            {(cat.tags || []).length > 5 && (
                              <span className="text-[8px] text-slate-400">+{(cat.tags || []).length - 5}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-xs font-bold text-slate-600">
                        {cat.blogCount || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-xs font-bold text-indigo-600">
                        {(cat.totalViews || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setEditingItem({ id: cat._id, name: cat.name })}
                          className="p-1.5 rounded bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-slate-200"
                          title="Edit Name"
                        >
                          <FiEdit2 className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-1.5 rounded bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200"
                          title="Delete"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredCategories.length && !loading && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-[11px] text-slate-400 italic">
                      No categories found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
