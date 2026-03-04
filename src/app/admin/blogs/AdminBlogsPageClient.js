'use client';

import dynamic from 'next/dynamic';

const AdminBlogsClient = dynamic(() => import('./AdminBlogsClient'), {
  ssr: false,
  loading: () => (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white p-8 rounded-lg border border-[#3F3F46]/20 shadow-sm text-center">
        <p className="text-[#3F3F46]">Loading blogs...</p>
      </div>
    </div>
  ),
});

export default function AdminBlogsPageClient() {
  return <AdminBlogsClient />;
}
