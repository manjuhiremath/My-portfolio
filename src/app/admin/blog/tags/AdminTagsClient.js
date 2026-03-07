'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  FiFilter, FiPlus, FiRefreshCw, FiTrash2, 
  FiTag, FiX, FiEdit2, FiCheck, FiLayers 
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

export default function AdminTagsClient() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [newName, setNewName] = useState('');
  const [editItem, setEditingItem] = useState(null); // { id, name, slug }

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tags');
      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const filteredTags = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tags;
    return tags.filter(t => 
      t.name?.toLowerCase().includes(q) || 
      t.slug?.toLowerCase().includes(q)
    );
  }, [tags, query]);

  async function handleCreateTag(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          slug: toSlug(newName),
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create tag');
      
      setNewName('');
      toast.success('Tag created');
      await fetchTags();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTag(id) {
    const name = tags.find(t => t._id === id)?.name;
    if (!window.confirm(`Are you sure you want to delete tag "#${name}"? This will remove it from all categories and blogs.`)) return;

    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete tag');
      
      toast.success('Tag deleted');
      await fetchTags();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleUpdateTag(id, data) {
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update tag');
      
      setEditingItem(null);
      toast.success('Updated successfully');
      await fetchTags();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleRemoveCategoryFromTag(tagId, categoryId) {
    const tag = tags.find(t => t._id === tagId);
    if (!tag) return;
    
    const newCategories = (tag.categories || [])
      .map(c => c._id || c)
      .filter(id => String(id) !== String(categoryId));
      
    try {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: newCategories }),
      });
      if (!res.ok) throw new Error('Failed to remove association');
      
      toast.success('Association removed');
      await fetchTags();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-3">
      <AdminPageHeader
        title="Manage Tags"
        description="Global tag pool. Edit names, slugs, and view usage stats."
        actions={[
          { 
            label: 'Refresh', 
            onClick: fetchTags, 
            icon: <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />, 
            variant: 'secondary' 
          }
        ]}
      />

      <div className="space-y-3">
        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-xs font-bold text-slate-900 flex items-center gap-2">
            <FiTag className="text-orange-500 h-3.5 w-3.5" />
            Quick Add Tag
          </h3>
          <form onSubmit={handleCreateTag} className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tag name (e.g. JavaScript, AI)..."
              className="h-8 flex-1 rounded-md border border-slate-300 px-3 text-xs outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
            >
              <FiPlus className="h-3 w-3" />
              Create
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tags Inventory</h3>
            <div className="relative">
              <FiFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-3 w-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 w-36 rounded border border-slate-300 pl-7 pr-2 text-[11px] outline-none focus:border-orange-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 font-bold w-1/3">Tag Name</th>
                  <th className="px-3 py-2 font-bold text-center">Blogs</th>
                  <th className="px-3 py-2 font-bold text-center">Views</th>
                  <th className="px-4 py-2 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTags.map((tag) => (
                  <tr key={tag._id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-3 py-2">
                      {editItem?.id === tag._id ? (
                        <div className="flex gap-1 items-center py-1">
                          <input
                            autoFocus
                            value={editItem.name}
                            onChange={(e) => setEditingItem({ ...editItem, name: e.target.value })}
                            className="h-7 w-full rounded border border-orange-300 px-2 text-xs outline-none"
                          />
                          <button 
                            onClick={() => handleUpdateTag(tag._id, { name: editItem.name, slug: toSlug(editItem.name) })}
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
                            <p className="text-xs font-bold text-slate-800">#{tag.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono lowercase">
                              /{tag.slug}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(tag.categories || []).length > 0 ? (
                              tag.categories.map((cat) => (
                                <span 
                                  key={cat._id || cat} 
                                  className="inline-flex items-center gap-0.5 rounded bg-orange-50 px-1.5 py-0.5 text-[8px] font-medium text-orange-600 border border-orange-100 group/cat"
                                >
                                  <FiLayers className="h-2 w-2" />
                                  {cat.name || cat}
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleRemoveCategoryFromTag(tag._id, cat._id || cat);
                                    }}
                                    className="text-orange-300 hover:text-rose-500 ml-0.5"
                                  >
                                    <FiX className="h-2 w-2" />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-[8px] text-slate-400 italic">Standalone Tag</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-xs font-bold text-slate-600">
                        {tag.blogCount || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-xs font-bold text-orange-600">
                        {(tag.totalViews || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setEditingItem({ id: tag._id, name: tag.name })}
                          className="p-1.5 rounded bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-slate-200"
                          title="Edit Tag"
                        >
                          <FiEdit2 className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTag(tag._id)}
                          className="p-1.5 rounded bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200"
                          title="Delete Tag"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredTags.length && !loading && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-[11px] text-slate-400 italic">
                      No tags found matching your search.
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
