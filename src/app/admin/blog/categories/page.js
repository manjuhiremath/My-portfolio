'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiFilter, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';

function toSlug(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadCategories() {
    try {
      setLoading(true);
      const response = await fetch('/api/categories', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to fetch categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const parents = useMemo(() => categories.filter((item) => !item.parent), [categories]);
  const categoryMap = useMemo(() => new Map(categories.map((item) => [String(item._id), item])), [categories]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return categories.filter((item) => {
      if (!normalized) return true;
      return item.name?.toLowerCase().includes(normalized) || item.slug?.toLowerCase().includes(normalized);
    });
  }, [categories, query]);

  async function handleCreateCategory(event) {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: toSlug(name),
          parent: parent || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to create category');

      setName('');
      setParent('');
      await loadCategories();
      toast.success('Category created');
    } catch (error) {
      toast.error(error.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategory(target) {
    const confirmed = window.confirm(`Delete "${target.name}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/categories/${target._id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete category');
      setCategories((rows) => rows.filter((row) => row._id !== target._id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    }
  }

  return (
    <div className="space-y-3">
      <AdminPageHeader
        title="Categories"
        description="Manage blog taxonomy with compact parent and subcategory controls."
        actions={[{ label: 'Refresh', onClick: loadCategories, icon: <FiRefreshCw className="h-3.5 w-3.5" />, variant: 'secondary' }]}
      />

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search categories"
          className="h-8 w-52 rounded-md border border-slate-300 px-2.5 text-xs outline-none focus:border-slate-500"
        />
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs text-slate-700 hover:bg-slate-50">
          <FiFilter className="h-3.5 w-3.5" />
          Filter
        </button>
      </AdminActionToolbar>

      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <form onSubmit={handleCreateCategory} className="grid grid-cols-1 gap-2 md:grid-cols-[1.2fr_1fr_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Category name"
            className="h-8 rounded-md border border-slate-300 px-2.5 text-xs outline-none focus:border-slate-500"
            required
          />
          <select
            value={parent}
            onChange={(event) => setParent(event.target.value)}
            className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-slate-500"
          >
            <option value="">Top level</option>
            {parents.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiPlus className="h-3.5 w-3.5" />
            Add Category
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Slug</th>
                  <th className="px-3 py-2 text-left">Parent</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const parentCategory = item.parent ? categoryMap.get(String(item.parent)) : null;
                  return (
                    <tr key={item._id} className="h-9 hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                      <td className="px-3 py-2 text-slate-500">{item.slug}</td>
                      <td className="px-3 py-2 text-slate-600">{parentCategory?.name || '-'}</td>
                      <td className="px-3 py-2">
                        <AdminStatusBadge value={item.parent ? 'Subcategory' : 'Primary'} variant={item.parent ? 'info' : 'violet'} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(item)}
                          className="inline-flex h-7 items-center gap-1 rounded border border-rose-200 px-2 text-[11px] text-rose-700 hover:bg-rose-50"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!filtered.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-xs text-slate-500">
                      No categories found.
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
