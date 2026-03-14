'use client';

import { useMemo, useState } from 'react';
import { 
  FiLink2, 
  FiSearch, 
  FiTarget, 
  FiDownload, 
  FiImage, 
  FiFileText, 
  FiGlobe, 
  FiAlertCircle,
  FiZap,
  FiBarChart2,
  FiCopy,
  FiExternalLink
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';
import { calculateReadabilityScore, stripHtml } from '@/lib/seo/score';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminSeoToolsPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  
  // Data state
  const [scrapedData, setScrapedData] = useState(null);
  const [content, setContent] = useState('');

  const handleScrape = async () => {
    if (!scrapeUrl) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      setIsScraping(true);
      setScrapeError('');
      
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scrape target origin');
      }

      setScrapedData(data);
      setContent(data.textContent);
      toast.success('Source data indexed successfully');
      
    } catch (error) {
      setScrapeError(error.message);
      toast.error(error.message);
    } finally {
      setIsScraping(false);
    }
  };

  const handleAutoCreateBlog = () => {
    if (!scrapedData) return;
    
    const draftData = {
      title: scrapedData.title || '',
      excerpt: scrapedData.description || '',
      content: scrapedData.html || scrapedData.textContent || '',
      tags: scrapedData.keywords ? scrapedData.keywords.split(',').map(k => k.trim()) : [],
      featuredImage: scrapedData.images?.length > 0 ? scrapedData.images[0].src : ''
    };
    
    localStorage.setItem('blogDraftContent', JSON.stringify(draftData));
    toast.success('Draft prepared. Redirecting to editor...');
    router.push('/admin/blog/blogs/create?source=scrape');
  };

  const analysis = useMemo(() => {
    const plain = stripHtml(content);
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    
    const headings = scrapedData?.headings ? 
      Object.values(scrapedData.headings).flat() : 
      (content.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || []).map(v => stripHtml(v));
      
    const readability = calculateReadabilityScore(content);
    const normalizedKeyword = keyword.trim().toLowerCase();
    const occurrences = normalizedKeyword ? plain.toLowerCase().split(normalizedKeyword).length - 1 : 0;
    const density = normalizedKeyword && words ? ((occurrences / words) * 100).toFixed(2) : '0.00';
    const recommendation = Number(density) >= 0.8 && Number(density) <= 2.5 ? 'Healthy Density' : 'Density Adjustment Required';

    const internalLinks = (content.match(/href=\"/gi) || []).length;
    
    return { words, headings, readability, occurrences, density, recommendation, internalLinks };
  }, [content, keyword, scrapedData]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Asset URL copied');
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      <AdminPageHeader
        title="SEO Intelligence Tools"
        description="Extract technical insights, analyze semantic density, and automate manifesto drafting."
        actions={[
          { 
            label: 'Generate Manifesto from Source', 
            icon: <FiZap className="h-3.5 w-3.5" />, 
            variant: 'primary',
            onClick: handleAutoCreateBlog,
            disabled: !scrapedData
          }
        ]}
      />

      {/* Website Scraper Section */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft">
        <h2 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
          <FiGlobe className="text-indigo-500" />
          Target Origin Scraper
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="https://example.com/technical-manifesto"
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-white"
          />
          <button
            onClick={handleScrape}
            disabled={isScraping}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50"
          >
            {isScraping ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                Indexing...
              </>
            ) : (
              <>
                <FiDownload className="h-4 w-4" />
                Index Source
              </>
            )}
          </button>
        </div>
        {scrapeError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30"
          >
            <FiAlertCircle />
            <span>Protocol Error: {scrapeError}</span>
          </motion.div>
        )}
      </section>

      {/* Scraped Meta Info */}
      <AnimatePresence>
        {scrapedData && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-soft">
              <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Page Title</h3>
              <p className="text-sm text-slate-900 dark:text-slate-200 font-bold leading-relaxed">{scrapedData.title || 'N/A'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-soft xl:col-span-2">
              <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{scrapedData.description || 'N/A'}</p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SEO Analysis Section */}
      <AdminActionToolbar>
        <div className="flex items-center gap-3">
          <FiTarget className="h-4 w-4 text-indigo-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Semantic Focus Keyword</span>
        </div>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="e.g. distributed-ledger-protocol"
          className="h-8 w-64 rounded-lg border border-slate-200 dark:border-slate-800 px-3 text-xs outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 dark:text-white transition-all"
        />
      </AdminActionToolbar>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft">
          <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Content Analysis Node</h2>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Input technical documentation or raw HTML for strategic audit..."
            className="h-[500px] w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 p-4 text-sm leading-relaxed outline-none focus:border-indigo-500 transition-all font-medium dark:text-slate-300"
          />
        </article>

        <div className="space-y-4">
          <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft">
            <h2 className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
              <FiBarChart2 className="text-indigo-500" />
              Strategic SEO Audit
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lexical Count</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{analysis.words} Words</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Readability Rating</span>
                <AdminStatusBadge value={`${analysis.readability}/100`} variant={analysis.readability >= 80 ? 'success' : analysis.readability >= 60 ? 'info' : 'warning'} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Keyword Density</span>
                <span className={`text-sm font-black ${Number(analysis.density) > 2.5 || Number(analysis.density) < 0.5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {analysis.density}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Semantic Links</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{analysis.internalLinks} Nodes</span>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] text-center ${
              analysis.recommendation.includes('Healthy') 
                ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' 
                : 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400'
            }`}>
              {analysis.recommendation}
            </div>
          </article>

          {/* Heading Analysis */}
          <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft">
            <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Hierarchical Structure</h2>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {scrapedData?.headings ? (
                Object.entries(scrapedData.headings).map(([tag, texts]) => (
                  texts.map((text, i) => (
                    <div key={`${tag}-${i}`} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 text-[11px] font-bold bg-slate-50/50 dark:bg-slate-800/20">
                      <span className="truncate text-slate-600 dark:text-slate-400 pr-4">{text}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${tag === 'h1' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{tag}</span>
                    </div>
                  ))
                ))
              ) : (
                analysis.headings.slice(0, 15).map((heading, index) => (
                  <div key={`${heading}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 text-[11px] font-bold bg-slate-50/50 dark:bg-slate-800/20">
                    <span className="truncate text-slate-600 dark:text-slate-400 pr-4">{heading}</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">H?</span>
                  </div>
                ))
              )}
              {!analysis.headings.length && !scrapedData?.headings && (
                <p className="text-[10px] text-slate-400 italic text-center py-4">No hierarchical nodes detected.</p>
              )}
            </div>
          </article>
        </div>
      </section>

      {/* Image Extractor */}
      <AnimatePresence>
        {scrapedData && scrapedData.images && scrapedData.images.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
              <FiImage className="text-indigo-500" />
              Indexed Visual Assets ({scrapedData.images.length})
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {scrapedData.images.map((img, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img.src} 
                    alt={img.alt || `Extracted asset ${i+1}`} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm">
                    <button 
                      onClick={() => copyToClipboard(img.src)}
                      className="mb-2 p-2 rounded-full bg-white text-indigo-600 hover:scale-110 transition-transform shadow-lg"
                      title="Copy URL"
                    >
                      <FiCopy className="h-4 w-4" />
                    </button>
                    <a 
                      href={img.src} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/20 text-white hover:scale-110 transition-transform"
                      title="View Original"
                    >
                      <FiExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  {img.alt && (
                    <div className="absolute bottom-0 left-0 right-0 truncate bg-slate-900/90 px-2 py-1.5 text-[8px] font-black uppercase tracking-widest text-white/70">
                      {img.alt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
}
