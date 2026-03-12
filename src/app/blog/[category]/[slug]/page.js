import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import ViewTracker from '@/components/blog/ViewTracker';
import TableOfContents from '@/components/blog/TableOfContents';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import ArticleAd from '@/components/ads/ArticleAd';
import SidebarAd from '@/components/ads/SidebarAd';
import MultiplexAd from '@/components/ads/MultiplexAd';
import { FiClock, FiEye, FiTwitter, FiLinkedin, FiLink } from 'react-icons/fi';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import MobileBlogLayout from '@/components/blog/MobileBlogLayout';

export const revalidate = 3600;

function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeHtmlEntities(text = '') {
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&mdash;': '\u2014',
    '&ndash;': '\u2013',
    '&copy;': '\u00A9',
    '&reg;': '\u00AE',
    '&trade;': '\u2122',
    '&hellip;': '\u2026',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
  };
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char);
  }
  return decoded;
}

function stripHtml(text = '') {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatInlineMarkdown(text = '') {
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  return formatted;
}

function processInlineMarkdownInHtml(html = '') {
  return html
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function formatPlainTextToHtml(content = '') {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';

  const decoded = decodeHtmlEntities(normalized);
  const lines = decoded.split('\n');
  const html = [];
  let inUl = false;
  let inOl = false;
  let inPre = false;
  const codeBuffer = [];

  const closeLists = () => {
    if (inUl) { html.push('</ul>'); inUl = false; }
    if (inOl) { html.push('</ol>'); inOl = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      if (inPre) codeBuffer.push('');
      continue;
    }

    if (/^```/.test(trimmed)) {
      closeLists();
      if (!inPre) {
        inPre = true;
        codeBuffer.length = 0;
      } else {
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        inPre = false;
      }
      continue;
    }

    if (inPre) {
      codeBuffer.push(line);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (!inUl) {
        if (inOl) { html.push('</ol>'); inOl = false; }
        html.push('<ul>');
        inUl = true;
      }
      html.push(`<li>${formatInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inOl) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${formatInlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    closeLists();

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = formatInlineMarkdown(headingMatch[2]);
      html.push(`<h${level}>${headingText}</h${level}>`);
      continue;
    }

    const blockquoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      html.push(`<blockquote><p>${formatInlineMarkdown(blockquoteMatch[1])}</p></blockquote>`);
      continue;
    }

    html.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
  }

  closeLists();
  if (inPre) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  return html.join('\n');
}

function stripCodeFenceWrappers(content = '') {
  let c = content.trim();
  c = c.replace(/^```(?:html)?\s*\n?/i, '');
  c = c.replace(/\n?```\s*$/i, '');
  return c.trim();
}

function getRenderableContent(content = '') {
  let cleaned = stripCodeFenceWrappers(content);
  cleaned = decodeHtmlEntities(cleaned);
  const looksLikeHtml = /<([a-z][\w-]*)(\s[^>]*)?>/.test(cleaned);
  if (looksLikeHtml) return processInlineMarkdownInHtml(cleaned);
  return formatPlainTextToHtml(cleaned);
}

function addHeadingIds(htmlContent = '') {
  const headings = [];
  const html = htmlContent.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_, level, attrs, inner) => {
    const text = stripHtml(inner);
    if (!text) return `<h${level}${attrs}>${inner}</h${level}>`;
    const id = `${slugify(text)}-${headings.length + 1}`;
    headings.push({ id, level: Number(level), text });
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
  return { html, headings };
}

function injectSectionImages(htmlContent = '', sectionImages = []) {
  if (!sectionImages || sectionImages.length === 0) return htmlContent;
  let imageIndex = 0;
  return htmlContent.replace(/<\/h2>/gi, (match) => {
    if (imageIndex < sectionImages.length) {
      const imgUrl = sectionImages[imageIndex];
      imageIndex++;
      if (imgUrl) {
        return `${match}\n<figure class="blog-section-image my-4"><img src="${imgUrl}" alt="Section illustration" class="w-full rounded-lg" loading="lazy" />\n</figure>`;
      }
    }
    return match;
  });
}

function calculateReadingTime(content = '') {
  const plain = stripHtml(content);
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 220));
}

function stripDuplicateFaq(content = '', hasFaqArray = false) {
  if (!hasFaqArray) return content;
  const faqPatterns = [
    /<h2>Frequently Asked Questions<\/h2>[\s\S]*$/i,
    /<h3>Frequently Asked Questions<\/h3>[\s\S]*$/i,
    /<h2[^>]*>FAQ(?:s)?<\/h2>[\s\S]*$/i
  ];
  let cleaned = content;
  for (const pattern of faqPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '');
      break;
    }
  }
  return cleaned;
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    await connectDB();
    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) return { title: 'Not Found' };
    let categoryName = 'uncategorized';
    if (blog.category) {
      const catValue = blog.category.toString();
      if (/^[0-9a-fA-F]{24}$/.test(catValue)) {
        const cat = await Category.findById(blog.category).lean();
        if (cat) categoryName = cat.name;
      } else categoryName = catValue;
    }
    const categorySlug = blog.category?.slug || slugify(categoryName);
    return {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      alternates: { canonical: `/blog/${categorySlug}/${blog.slug}` },
    };
  } catch { return { title: 'Blog' }; }
}

export default async function BlogPostPage({ params }) {
  try {
    const { slug } = await params;
    await connectDB();
    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) notFound();

    let categoryDoc = null;
    let categoryId;
    let categoryName;
    if (blog.category) {
      const categoryValue = blog.category.toString();
      if (/^[0-9a-fA-F]{24}$/.test(categoryValue)) {
        try { categoryDoc = await Category.findById(blog.category).lean(); } catch {}
      }
      if (categoryDoc) {
        categoryId = categoryDoc._id;
        categoryName = categoryDoc.name;
      } else {
        try {
          categoryDoc = await Category.findOne({ name: categoryValue }).lean();
          if (categoryDoc) { categoryId = categoryDoc._id; categoryName = categoryDoc.name; }
          else { categoryId = null; categoryName = categoryValue; }
        } catch { categoryId = null; categoryName = categoryValue; }
      }
    } else categoryName = 'Uncategorized';
    
    const categorySlug = slugify(categoryName);
    let tagNames = [];
    if (blog.tags?.length > 0) {
      try {
        const tags = await Tag.find({ _id: { $in: blog.tags } }).lean();
        tagNames = tags.map(t => t.name);
      } catch { tagNames = blog.tags.map(t => t?.toString() || t); }
    }

    const relatedQuery = {
      $or: [{ category: categoryId }, { category: categoryName }],
      _id: { $ne: blog._id },
      published: true
    };
    const relatedBlogsRaw = await Blog.find(relatedQuery).limit(4).sort({ createdAt: -1 }).lean();

    const serializedBlog = JSON.parse(JSON.stringify(blog));
    const serializedRelatedBlogs = JSON.parse(JSON.stringify(relatedBlogsRaw));

    let rawContent = getRenderableContent(serializedBlog.content || '');
    rawContent = stripDuplicateFaq(rawContent, serializedBlog.faq?.length > 0);
    rawContent = injectSectionImages(rawContent, serializedBlog.sectionImages || []);
    const { html: renderableContent, headings } = addHeadingIds(rawContent);
    const readingTime = calculateReadingTime(renderableContent);

    const paragraphs = renderableContent.split('</p>').filter(p => p.trim() !== '').map(p => p + '</p>');
    let mobileContentParts = [];
    if (paragraphs.length > 0) {
      mobileContentParts.push(paragraphs.slice(0, 2).join(''));
      for (let i = 2; i < paragraphs.length; i += 4) {
        mobileContentParts.push(paragraphs.slice(i, i + 4).join(''));
      }
    } else mobileContentParts = [renderableContent];

    let contentParts = [renderableContent];
    if (paragraphs.length > 3) {
      const middleIndex = Math.ceil(paragraphs.length / 2);
      contentParts = [paragraphs.slice(0, middleIndex).join(''), paragraphs.slice(middleIndex).join('')];
    }

    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        <ViewTracker slug={slug} />
        <ReadingProgressBar />

        <MobileBlogLayout 
          blog={serializedBlog}
          relatedBlogs={serializedRelatedBlogs}
          categoryName={categoryName}
          tagNames={tagNames}
          readingTime={readingTime}
          contentParts={mobileContentParts}
        />

        <main className="hidden md:block mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <Link href="/blog" className="hover:text-orange-500 transition-colors">Magazine</Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link href={`/blog/${categorySlug}`} className="hover:text-orange-500 transition-colors">{categoryName}</Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="max-w-[150px] truncate text-slate-500 dark:text-slate-400">{serializedBlog.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[60px_1fr_280px]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 flex flex-col items-center gap-3">
                <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400 rotate-90 mb-6 whitespace-nowrap">Share</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-orange-500 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"><FiTwitter className="h-3.5 w-3.5" /></button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-orange-500 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"><FiLinkedin className="h-3.5 w-3.5" /></button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-orange-500 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"><FiLink className="h-3.5 w-3.5" /></button>
              </div>
            </aside>

            <div className="min-w-0">
              <article>
                <header className="mb-6">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Link href={`/blog?category=${encodeURIComponent(categoryName)}`} className="rounded bg-orange-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-sm">{categoryName}</Link>
                    {tagNames.slice(0, 3).map((tag) => (
                      <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`} className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">#{tag}</Link>
                    ))}
                  </div>

                  <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                    {serializedBlog.title}
                  </h1>

                  <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-slate-100 dark:border-slate-800/50 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="text-slate-600 dark:text-slate-300">{new Date(serializedBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><FiClock className="h-3 w-3 text-orange-500" /> {readingTime}m</span>
                    <span className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><FiEye className="h-3 w-3 text-blue-500" /> {(serializedBlog.views || 0).toLocaleString()}</span>
                  </div>
                </header>

                {serializedBlog.featuredImage ? (
                  <div className="relative mb-8 h-[300px] lg:h-[450px] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-lg">
                    <Image src={fixUnsplashUrl(serializedBlog.featuredImage)} alt={serializedBlog.title} fill sizes="(max-width: 1280px) 100vw, 1000px" className="object-cover" priority />
                  </div>
                ) : null}

                <div className="blog-content prose prose-slate dark:prose-invert max-w-none leading-relaxed text-slate-700 dark:text-slate-300 prose-headings:font-black prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:mb-4 prose-p:leading-[1.7] prose-a:text-orange-600 prose-blockquote:py-1 prose-blockquote:px-4 prose-img:rounded-2xl">
                  {contentParts.map((part, i) => (
                    <div key={i}>
                      <div dangerouslySetInnerHTML={{ __html: part }} />
                      {i < contentParts.length - 1 && <div className="my-8 py-4 border-y border-slate-100 dark:border-slate-800/50"><ArticleAd /></div>}
                    </div>
                  ))}
                </div>

                {serializedBlog.faq?.length ? (
                  <div className="mt-12 rounded-2xl bg-white dark:bg-slate-800/50 p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">FAQ</h2>
                    <div className="space-y-2">
                      {serializedBlog.faq.map((item, i) => (
                        <details key={i} className="group rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 transition-all overflow-hidden">
                          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-900 dark:text-white hover:text-orange-600 list-none flex items-center justify-between">
                            {item.question}
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 transition-transform group-open:rotate-180"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></span>
                          </summary>
                          <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">{item.answer}</div>
                        </details>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-8"><MultiplexAd /></div>
              </article>
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-6">
                <TableOfContents headings={headings} />
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 p-6 text-white shadow-lg">
                  <h3 className="text-sm font-black tracking-tight mb-2 uppercase">Join Manifesto</h3>
                  <p className="text-[11px] font-medium text-orange-50 mb-4 opacity-90">Deep tech insights delivered weekly.</p>
                  <div className="space-y-2">
                    <input type="email" placeholder="email..." className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-xs placeholder:text-orange-100 outline-none focus:bg-white/20" />
                    <button className="w-full rounded-lg bg-white py-2 text-[10px] font-black text-orange-600 uppercase tracking-widest active:scale-95 transition-transform">Subscribe</button>
                  </div>
                </div>
                <SidebarAd />
              </div>
            </aside>
          </div>

          {relatedBlogsRaw?.length ? (
            <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-12">
              <div className="mb-8 flex items-end justify-between px-1">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-orange-500 mb-1">More Insights</p>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">You might also like</h2>
                </div>
                <Link href="/blog" className="items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors flex">
                  Library <span>→</span>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {relatedBlogsRaw.map((relatedBlog) => {
                  const relatedCatName = relatedBlog.category?.name || relatedBlog.category || 'uncategorized';
                  return (
                    <Link key={relatedBlog._id} href={`/blog/${slugify(relatedCatName)}/${relatedBlog.slug}`} className="group block overflow-hidden rounded-xl bg-white dark:bg-slate-800 transition-all shadow-sm border border-slate-100 dark:border-slate-700/50">
                      <div className="relative h-32 overflow-hidden bg-slate-100 dark:bg-slate-700">
                        <Image src={fixUnsplashUrl(relatedBlog.featuredImage)} alt={relatedBlog.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="p-3">
                        <p className="text-[8px] font-black text-orange-500 uppercase mb-1">{relatedCatName}</p>
                        <h3 className="line-clamp-2 text-xs font-bold leading-tight text-slate-900 dark:text-white">{relatedBlog.title}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error:', error);
    return <div className="p-16 text-center">Error loading article.</div>;
  }
}
