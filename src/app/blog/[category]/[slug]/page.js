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
import { FiClock, FiEye, FiTwitter, FiLinkedin, FiLink, FiArrowRight } from 'react-icons/fi';
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

    const removeH1Tags = (html) => {
      if (!html) return '';
      // Replace h1 with div or just strip the tag but keep content. 
      // Most bloggers accidentally put h1 in content which causes duplicate H1s.
      // We'll strip the H1 tag but keep the text as a paragraph or similar, or just remove the tags.
      // Based on user request "remove h1", I will strip the tag.
      return html.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '<p className="font-bold text-xl">$1</p>');
    };

    let rawContent = getRenderableContent(serializedBlog.content || '');
    rawContent = removeH1Tags(rawContent);
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
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500">
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

        <main className="hidden md:block mx-auto max-w-[1440px] px-6 lg:px-12 py-4">
          {/* Magazine Breadcrumb */}
          <nav className="mb-4 flex items-center gap-3 text-[10px] font-semibold tracking-[0.1em] text-gray-600">
            <Link href="/blog" className="hover:text-primary transition-colors">Manifesto</Link>
            <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-800" />
            <Link href={`/blog?category=${encodeURIComponent(categoryName)}`} className="hover:text-primary transition-colors">{categoryName}</Link>
            <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-800" />
            <span className="max-w-[200px] truncate text-gray-500 dark:text-gray-400 opacity-60">Entry {serializedBlog.slug}</span>
          </nav>

          <div className="grid grid-cols-1  lg:grid-cols-[80px_1fr_320px] xl:grid-cols-[100px_1fr_380px]">
            {/* Left Sidebar: Share & Actions */}
            <aside className="hidden lg:block">
              <div className="sticky top-32 flex flex-col items-center gap-6">
                <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-600 shadow-soft hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"><FiTwitter className="h-5 w-5" /></button>
                <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-600 shadow-soft hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all duration-300 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"><FiLinkedin className="h-5 w-5" /></button>
                <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-600 shadow-soft hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"><FiLink className="h-5 w-5" /></button>
              </div>
            </aside>

            {/* Middle: Content */}
            <div className="min-w-0">
              <article>
                <header className="mb-5 space-y-8">
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/blog?category=${encodeURIComponent(categoryName)}`} className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-primary/20">{categoryName}</Link>
                    {tagNames.slice(0, 3).map((tag) => (
                      <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`} className="rounded-full bg-gray-50 dark:bg-gray-800 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors border border-gray-100 dark:border-gray-700">#{tag}</Link>
                    ))}
                  </div>

                  <h1 className="text-3xl font-black leading-[1.05] tracking-tighter text-gray-900 dark:text-white sm:text-4xl lg:text-5xl xl:text-6xl font-display">
                    {serializedBlog.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-gray-100 dark:border-gray-800/50 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                    <span className="text-primary">{new Date(serializedBlog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <span className="flex items-center gap-2"><FiClock className="h-4 w-4 text-primary" /> {readingTime} MIN READ</span>
                    <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <span className="flex items-center gap-2"><FiEye className="h-4 w-4 text-gray-300 dark:text-gray-600" /> {(serializedBlog.views || 0).toLocaleString()} IMPACT</span>
                  </div>
                </header>

                {serializedBlog.featuredImage ? (
                  <div className="relative mb-16 aspect-[21/9] overflow-hidden rounded-[3rem] bg-gray-100 dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
                    <Image src={fixUnsplashUrl(serializedBlog.featuredImage)} alt={serializedBlog.title} fill sizes="(max-width: 1536px) 100vw, 1200px" className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ) : null}

                <div className="blog-content transition-all duration-500">
                  {contentParts.map((part, i) => (
                    <div key={i} className="flow">
                      <div dangerouslySetInnerHTML={{ __html: part }} />
                      {i < contentParts.length - 1 && (
                        <div className="my-16 py-12 border-y border-gray-50 dark:border-gray-800/50">
                          <ArticleAd />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {serializedBlog.faq?.length ? (
                  <div className="mt-24 rounded-[3rem] bg-gray-50 dark:bg-gray-800/30 p-8 lg:p-12 border border-gray-100 dark:border-gray-800/50 shadow-sm max-w-[65ch] mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 tracking-tighter uppercase font-display">Technical FAQ</h2>
                    <div className="space-y-4">
                      {serializedBlog.faq.map((item, i) => (
                        <details key={i} className="group rounded-3xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 transition-all overflow-hidden shadow-sm hover:shadow-md">
                          <summary className="cursor-pointer px-6 py-5 text-sm font-bold text-gray-900 dark:text-white hover:text-primary list-none flex items-center justify-between transition-colors">
                            {item.question}
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 transition-transform group-open:rotate-180 group-open:bg-primary group-open:text-white shadow-sm"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></span>
                          </summary>
                          <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-2 border-t border-gray-50 dark:border-gray-800/50">{item.answer}</div>
                        </details>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-16"><MultiplexAd /></div>
              </article>
            </div>

            {/* Right Sidebar: TOC & CTA */}
            <aside className="hidden xl:block">
              <div className="sticky  space-y-10">
                <TableOfContents headings={headings} />
                
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 p-8 text-white shadow-2xl border border-gray-800">
                  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                  <div className="relative z-10 space-y-6">
                    <div>
                      <h3 className="text-lg font-black tracking-tight uppercase font-display leading-tight">Join the <span className="text-primary italic">Manifesto.</span></h3>
                      <p className="mt-3 text-xs font-medium text-gray-400 leading-relaxed">Deep tech insights and architectural patterns delivered weekly.</p>
                    </div>
                    <div className="space-y-3">
                      <input type="email" placeholder="Your email..." className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder:text-gray-600 outline-none focus:bg-white/10 focus:border-primary/50 transition-all" />
                      <button className="btn btn-primary w-full py-3.5 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20">Subscribe Now</button>
                    </div>
                  </div>
                </div>
                
                <SidebarAd />
              </div>
            </aside>
          </div>

          {/* Related Articles */}
          {serializedRelatedBlogs?.length ? (
            <section className="mt-32 border-t border-gray-100 dark:border-gray-800 pt-20">
              <div className="mb-12 flex items-end justify-between px-2">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Further Exploration</p>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase font-display">Related Manifestos</h2>
                </div>
                <Link href="/blog" className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-primary transition-all mb-2">
                  Library <FiArrowRight className="h-4 w-4 transition-transform group-hover:trangray-x-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                {serializedRelatedBlogs.map((relatedBlog) => {
                  let relatedCatName = 'Uncategorized';
                  if (relatedBlog.category) {
                    if (typeof relatedBlog.category === 'object' && relatedBlog.category.name) {
                      relatedCatName = relatedBlog.category.name;
                    } else {
                      relatedCatName = String(relatedBlog.category);
                    }
                  }
                  
                  return (
                    <Link key={relatedBlog._id} href={`/blog/${slugify(relatedCatName)}/${relatedBlog.slug}`} className="group block space-y-4">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-trangray-y-1">
                        <Image src={fixUnsplashUrl(relatedBlog.featuredImage)} alt={relatedBlog.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="px-1 space-y-2">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{String(relatedCatName)}</p>
                        <h3 className="line-clamp-2 text-sm font-black leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">{relatedBlog.title}</h3>
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
