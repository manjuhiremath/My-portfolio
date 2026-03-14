'use client';

import { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { toast } from 'sonner';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    autoInternalLinks: true,
    enableSeoScoring: true,
    publishWorkflow: 'review',
    timezone: 'Asia/Kolkata',
    defaultCategory: 'General',
  });

  function saveSettings() {
    toast.success('Settings saved');
  }

  return (
    <div className="space-y-3">
      <AdminPageHeader
        title="Settings"
        description="Workspace and SEO workflow settings."
        actions={[{ label: 'Save', onClick: saveSettings, icon: <FiSave className="h-3.5 w-3.5" />, variant: 'primary' }]}
      />

      <AdminActionToolbar>
        <AdminStatusBadge value="Environment: Production" variant="success" />
        <AdminStatusBadge value="API: Connected" variant="info" />
      </AdminActionToolbar>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <article className="space-y-3 rounded-lg border border-gray-200 bg-white p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Content Workflow</h2>

          <label className="flex items-center justify-between rounded border border-gray-200 px-2 py-2 text-xs">
            <span className="text-gray-700">Enable auto internal links</span>
            <input
              type="checkbox"
              checked={settings.autoInternalLinks}
              onChange={(event) => setSettings((state) => ({ ...state, autoInternalLinks: event.target.checked }))}
            />
          </label>

          <label className="flex items-center justify-between rounded border border-gray-200 px-2 py-2 text-xs">
            <span className="text-gray-700">Enable SEO scoring</span>
            <input
              type="checkbox"
              checked={settings.enableSeoScoring}
              onChange={(event) => setSettings((state) => ({ ...state, enableSeoScoring: event.target.checked }))}
            />
          </label>

          <label className="block text-xs text-gray-600">
            Publish workflow
            <select
              value={settings.publishWorkflow}
              onChange={(event) => setSettings((state) => ({ ...state, publishWorkflow: event.target.value }))}
              className="mt-1 h-8 w-full rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-gray-500"
            >
              <option value="review">Review required</option>
              <option value="direct">Direct publish</option>
              <option value="scheduled">Scheduled only</option>
            </select>
          </label>
        </article>

        <article className="space-y-3 rounded-lg border border-gray-200 bg-white p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Defaults</h2>

          <label className="block text-xs text-gray-600">
            Timezone
            <input
              value={settings.timezone}
              onChange={(event) => setSettings((state) => ({ ...state, timezone: event.target.value }))}
              className="mt-1 h-8 w-full rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-gray-500"
            />
          </label>

          <label className="block text-xs text-gray-600">
            Default category
            <input
              value={settings.defaultCategory}
              onChange={(event) => setSettings((state) => ({ ...state, defaultCategory: event.target.value }))}
              className="mt-1 h-8 w-full rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-gray-500"
            />
          </label>
        </article>
      </section>
    </div>
  );
}

