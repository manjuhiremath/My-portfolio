'use client';

import { useMemo, useState } from 'react';
import { FiLink2, FiSearch, FiTarget } from 'react-icons/fi';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';
import { calculateReadabilityScore, stripHtml } from '@/lib/seo/score';

function extractHeadings(content = '') {
  const matches = content.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || [];
  return matches.map((value) => stripHtml(value)).filter(Boolean);
}

export default function AdminSeoToolsPage() {
  const [keyword, setKeyword] = useState('');
  const [content, setContent] = useState('');

  const analysis = useMemo(() => {
    const plain = stripHtml(content);
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    const headings = extractHeadings(content);
    const readability = calculateReadabilityScore(content);
    const normalizedKeyword = keyword.trim().toLowerCase();
    const occurrences = normalizedKeyword ? plain.toLowerCase().split(normalizedKeyword).length - 1 : 0;
    const density = normalizedKeyword && words ? ((occurrences / words) * 100).toFixed(2) : '0.00';
    const recommendation = Number(density) >= 0.8 && Number(density) <= 2.5 ? 'Healthy density' : 'Adjust keyword usage';

    const internalLinks = (content.match(/href=\"\/blog\//gi) || []).length;
    return { words, headings, readability, occurrences, density, recommendation, internalLinks };
  }, [content, keyword]);

  return (
    <div className="space-y-3">
      <AdminPageHeader
        title="SEO Tools"
        description="Keyword density, heading structure, readability, and internal linking checks."
        actions={[{ label: 'Run Analysis', icon: <FiSearch className="h-3.5 w-3.5" />, variant: 'primary' }]}
      />

      <AdminActionToolbar>
        <label className="flex items-center gap-1 text-xs text-slate-600">
          <FiTarget className="h-3.5 w-3.5" />
          Focus keyword
        </label>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="e.g. nextjs seo checklist"
          className="h-8 w-56 rounded-md border border-slate-300 px-2.5 text-xs outline-none focus:border-slate-500"
        />
      </AdminActionToolbar>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Content Input</h2>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste blog HTML or content draft here."
            className="h-72 w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-500"
          />
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Analysis</h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5">
              <span className="text-slate-600">Word count</span>
              <span className="font-medium text-slate-800">{analysis.words}</span>
            </div>
            <div className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5">
              <span className="text-slate-600">Readability</span>
              <AdminStatusBadge value={`${analysis.readability}/100`} variant={analysis.readability >= 80 ? 'success' : analysis.readability >= 60 ? 'info' : 'warning'} />
            </div>
            <div className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5">
              <span className="text-slate-600">Keyword count</span>
              <span className="font-medium text-slate-800">{analysis.occurrences}</span>
            </div>
            <div className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5">
              <span className="text-slate-600">Keyword density</span>
              <span className="font-medium text-slate-800">{analysis.density}%</span>
            </div>
            <div className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5">
              <span className="text-slate-600">Internal links</span>
              <span className="font-medium text-slate-800">{analysis.internalLinks}</span>
            </div>
          </div>

          <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
            {analysis.recommendation}
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Heading Analysis</h2>
        <div className="space-y-1">
          {analysis.headings.slice(0, 10).map((heading, index) => (
            <div key={`${heading}-${index}`} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-xs">
              <span className="truncate text-slate-700">{heading}</span>
              <AdminStatusBadge value={`H${Math.min(6, index + 1)}`} variant="default" />
            </div>
          ))}
          {!analysis.headings.length ? <p className="text-xs text-slate-500">No headings detected yet.</p> : null}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Internal Link Suggestions</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {['/blog/nextjs/performance', '/blog/react/optimization', '/blog/seo/technical-audit'].map((item) => (
            <div key={item} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-xs">
              <span className="truncate text-slate-700">{item}</span>
              <FiLink2 className="h-3.5 w-3.5 text-slate-400" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

