'use client';

import { useMemo, useState } from 'react';
import { FiLink2, FiSearch, FiTarget, FiDownload, FiImage, FiFileText, FiGlobe, FiAlertCircle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import AdminActionToolbar from '@/components/admin/ui/AdminActionToolbar';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/ui/AdminStatusBadge';
import { calculateReadabilityScore, stripHtml } from '@/lib/seo/score';

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
      setScrapeError('Please enter a URL to scrape');
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
        throw new Error(data.error || 'Failed to scrape URL');
      }

      setScrapedData(data);
      setContent(data.textContent); // Set the text content for analysis
      
    } catch (error) {
      setScrapeError(error.message);
    } finally {
      setIsScraping(false);
    }
  };

  const handleAutoCreateBlog = () => {
    if (!scrapedData) return;
    
    // Store in localStorage to pass to the create page
    const draftData = {
      title: scrapedData.title || '',
      excerpt: scrapedData.description || '',
      content: scrapedData.html || scrapedData.textContent || '', // prefer html if available for formatting
      tags: scrapedData.keywords ? scrapedData.keywords.split(',').map(k => k.trim()) : [],
      // Grab the first image as featured image if available
      featuredImage: scrapedData.images?.length > 0 ? scrapedData.images[0].src : ''
    };
    
    localStorage.setItem('blogDraftContent', JSON.stringify(draftData));
    router.push('/admin/blog/blogs/create?source=scrape');
  };

  const analysis = useMemo(() => {
    const plain = stripHtml(content);
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    
    // If we have scraped headings, use those, otherwise try to extract from content
    const headings = scrapedData?.headings ? 
      Object.values(scrapedData.headings).flat() : 
      (content.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || []).map(v => stripHtml(v));
      
    const readability = calculateReadabilityScore(content);
    const normalizedKeyword = keyword.trim().toLowerCase();
    const occurrences = normalizedKeyword ? plain.toLowerCase().split(normalizedKeyword).length - 1 : 0;
    const density = normalizedKeyword && words ? ((occurrences / words) * 100).toFixed(2) : '0.00';
    const recommendation = Number(density) >= 0.8 && Number(density) <= 2.5 ? 'Healthy density' : 'Adjust keyword usage';

    const internalLinks = scrapedData?.links?.length || (content.match(/href=\"/gi) || []).length;
    
    return { words, headings, readability, occurrences, density, recommendation, internalLinks };
  }, [content, keyword, scrapedData]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="SEO & Scraping Tools"
        description="Scrape websites, analyze keyword density, extract images, and auto-create blogs."
        actions={[
          { 
            label: 'Auto-Create Blog from Scrape', 
            icon: <FiFileText className="h-3.5 w-3.5" />, 
            variant: 'primary',
            onClick: handleAutoCreateBlog,
            disabled: !scrapedData
          }
        ]}
      />

      {/* Website Scraper Section */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <FiGlobe className="text-orange-500" />
          Website Scraper
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
          />
          <button
            onClick={handleScrape}
            disabled={isScraping}
            className="flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {isScraping ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                Scraping...
              </>
            ) : (
              <>
                <FiDownload className="h-4 w-4" />
                Scrape Website
              </>
            )}
          </button>
        </div>
        {scrapeError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <FiAlertCircle />
            <span>{scrapeError}</span>
          </div>
        )}
      </section>

      {/* Scraped Meta Info */}
      {scrapedData && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Page Title</h3>
            <p className="text-sm text-slate-800 font-medium">{scrapedData.title || 'N/A'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 xl:col-span-2">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Meta Description</h3>
            <p className="text-sm text-slate-800">{scrapedData.description || 'N/A'}</p>
          </div>
        </section>
      )}

      {/* SEO Analysis Section */}
      <AdminActionToolbar>
        <label className="flex items-center gap-1 text-xs font-medium text-slate-700">
          <FiTarget className="h-4 w-4 text-orange-500" />
          Focus Keyword for Analysis
        </label>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="e.g. nextjs seo checklist"
          className="h-9 w-64 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
        />
      </AdminActionToolbar>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Content Input (Auto-filled from scrape)</h2>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste blog HTML or content draft here, or scrape a website above."
            className="h-96 w-full rounded-md border border-slate-300 p-3 text-sm leading-relaxed outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
          />
        </article>

        <div className="space-y-4">
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-slate-800">SEO Analysis</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-slate-600">Word count</span>
                <span className="font-semibold text-slate-900">{analysis.words}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-slate-600">Readability Score</span>
                <AdminStatusBadge value={`${analysis.readability}/100`} variant={analysis.readability >= 80 ? 'success' : analysis.readability >= 60 ? 'info' : 'warning'} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-slate-600">Keyword occurrences</span>
                <span className="font-semibold text-slate-900">{analysis.occurrences}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-slate-600">Keyword density</span>
                <span className={`font-semibold ${Number(analysis.density) > 2.5 ? 'text-red-600' : 'text-slate-900'}`}>{analysis.density}%</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-slate-600">Total links</span>
                <span className="font-semibold text-slate-900">{analysis.internalLinks}</span>
              </div>
            </div>

            <div className={`mt-4 rounded-md border p-3 text-xs font-medium ${
              analysis.recommendation.includes('Healthy') 
                ? 'border-green-200 bg-green-50 text-green-700' 
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
              {analysis.recommendation}
            </div>
          </article>

          {/* Heading Analysis */}
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Heading Structure</h2>
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {scrapedData?.headings ? (
                // Group headings if we have scraped data
                Object.entries(scrapedData.headings).map(([tag, texts]) => (
                  texts.map((text, i) => (
                    <div key={`${tag}-${i}`} className="flex items-center justify-between rounded border border-slate-100 px-2 py-1.5 text-xs">
                      <span className="truncate text-slate-600 pr-2">{text}</span>
                      <AdminStatusBadge value={tag.toUpperCase()} variant={tag === 'h1' ? 'primary' : 'default'} />
                    </div>
                  ))
                ))
              ) : (
                // Fallback to basic extraction
                analysis.headings.slice(0, 15).map((heading, index) => (
                  <div key={`${heading}-${index}`} className="flex items-center justify-between rounded border border-slate-100 px-2 py-1.5 text-xs">
                    <span className="truncate text-slate-600 pr-2">{heading}</span>
                    <AdminStatusBadge value={`H?`} variant="default" />
                  </div>
                ))
              )}
              {!analysis.headings.length && !scrapedData?.headings && (
                <p className="text-xs text-slate-500 italic">No headings detected.</p>
              )}
            </div>
          </article>
        </div>
      </section>

      {/* Image Extractor */}
      {scrapedData && scrapedData.images && scrapedData.images.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
            <FiImage className="text-orange-500" />
            Extracted Images ({scrapedData.images.length})
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {scrapedData.images.map((img, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <div className="aspect-square w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img.src} 
                    alt={img.alt || `Extracted image ${i+1}`} 
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/placeholder-image.svg'; // Fallback
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <a 
                    href={img.src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mb-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/40"
                  >
                    View
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(img.src);
                      alert('Image URL copied to clipboard!');
                    }}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-900 hover:bg-slate-100"
                  >
                    Copy URL
                  </button>
                </div>
                {img.alt && (
                  <div className="absolute bottom-0 left-0 right-0 truncate bg-black/70 px-2 py-1 text-[10px] text-white">
                    {img.alt}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
