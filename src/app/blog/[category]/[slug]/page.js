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

/**
 * Process inline markdown (bold, links, code) within a string that may already contain HTML tags.
 * Unlike formatInlineMarkdown, this does NOT escape HTML tags.
 * We avoid single-star italic here because it frequently conflicts with bullet points in mixed-format AI content.
 */
function processInlineMarkdownInHtml(html = '') {
  return html
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function formatPlainTextToHtml(content = '') {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';

  // Decode HTML entities first before processing
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

/**
 * Strip wrapping ```html ... ``` code fences from blog content (Issue 10).
 * Some blogs have content wrapped in code fences which causes raw HTML display.
 */
function stripCodeFenceWrappers(content = '') {
  let c = content.trim();
  // Remove leading ```html or ``` and trailing ```
  c = c.replace(/^```(?:html)?\s*\n?/i, '');
  c = c.replace(/\n?```\s*$/i, '');
  return c.trim();
}

function getRenderableContent(content = '') {
  let cleaned = stripCodeFenceWrappers(content);
  // Decode HTML entities before processing
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

/**
 * Inject section images after H2 headings (Issue 1).
 * Uses the blog's sectionImages array, mapping each to an H2 in order.
 */
function injectSectionImages(htmlContent = '', sectionImages = []) {
  if (!sectionImages || sectionImages.length === 0) return htmlContent;
  let imageIndex = 0;
  return htmlContent.replace(/<\/h2>/gi, (match) => {
    if (imageIndex < sectionImages.length) {
      const imgUrl = sectionImages[imageIndex];
      imageIndex++;
      if (imgUrl) {
        return `${match}\n<figure class="blog-section-image my-6"><img src="${imgUrl}" alt="Section illustration" class="w-full rounded-xl" loading="lazy" />\n</figure>`;
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

/**
 * Strip duplicate FAQ section from content if it already exists in blog.faq (Issue 12).
 */
function stripDuplicateFaq(content = '', hasFaqArray = false) {
  if (!hasFaqArray) return content;
  
  // Look for <h2>Frequently Asked Questions</h2> and everything after it
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

    if (!blog) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.',
      };
    }

    // Handle category - could be ObjectId or string
    let categoryName = 'uncategorized';
    if (blog.category) {
      const catValue = blog.category.toString();
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(catValue);
      
      if (isObjectId) {
        const cat = await Category.findById(blog.category).lean();
        if (cat) categoryName = cat.name;
      } else {
        categoryName = catValue;
      }
    }

    // Get tags
    let tagNames = [];
    if (blog.tags && blog.tags.length > 0) {
      try {
        const tags = await Tag.find({ _id: { $in: blog.tags } }).lean();
        tagNames = tags.map(t => t.name);
      } catch (e) {
        tagNames = [];
      }
    }

    const categorySlug = blog.category?.slug || slugify(categoryName);

    return {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      keywords: blog.keywords || tagNames || [],
      alternates: {
        canonical: `/blog/${categorySlug}/${blog.slug}`,
      },
      openGraph: {
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        type: 'article',
        publishedTime: blog.createdAt,
        images: blog.ogImage
          ? [{ url: blog.ogImage }]
          : blog.featuredImage
          ? [{ url: blog.featuredImage }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        images: blog.ogImage
          ? [blog.ogImage]
          : blog.featuredImage
          ? [blog.featuredImage]
          : [],
      },
    };
  } catch {
    return {
      title: 'Blog Post',
      description: 'Read our latest blog posts.',
    };
  }
}

export default async function BlogPostPage({ params }) {
  try {
    const { slug } = await params;
    await connectDB();
    
    // First find the blog without populate to check what type category is
    const blog = await Blog.findOne({ slug }).lean();

    if (!blog) {
      notFound();
    }

    // Handle category - could be ObjectId (new) or string (legacy)
    let categoryDoc = null;
    let categoryId;
    let categoryName;
    
    if (blog.category) {
      // Check if category is a string (legacy) or ObjectId
      const categoryValue = blog.category.toString();
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryValue);
      
      if (isObjectId) {
        // It's an ObjectId - try to populate
        try {
          categoryDoc = await Category.findById(blog.category).lean();
        } catch (e) {
          console.warn('Failed to populate category:', e.message);
        }
      }
      
      if (categoryDoc) {
        categoryId = categoryDoc._id;
        categoryName = categoryDoc.name;
      } else {
        // Legacy: category is a string - try to find by name or use as-is
        try {
          categoryDoc = await Category.findOne({ name: categoryValue }).lean();
          if (categoryDoc) {
            categoryId = categoryDoc._id;
            categoryName = categoryDoc.name;
          } else {
            // Category not found in database - use the string value
            categoryId = null;
            categoryName = categoryValue;
          }
        } catch (e) {
          // If lookup fails, use the raw value
          categoryId = null;
          categoryName = categoryValue;
        }
      }
    } else {
      categoryName = 'Uncategorized';
    }
    
    const categorySlug = slugify(categoryName);
    
    // Get tags
    let tagNames = [];
    if (blog.tags && blog.tags.length > 0) {
      try {
        const tags = await Tag.find({ _id: { $in: blog.tags } }).lean();
        tagNames = tags.map(t => t.name);
      } catch (e) {
        // If tag lookup fails, use raw values
        tagNames = blog.tags.map(t => t?.toString?.() || t);
      }
    }

    // Query related blogs by category - handle both ObjectId and string
    const relatedQuery = {
      $or: [
        { category: categoryId },
        { category: categoryName }
      ],
      _id: { $ne: blog._id },
      published: true
    };
    
    const relatedBlogsRaw = await Blog.find(relatedQuery)
      .limit(3)
      .sort({ createdAt: -1 })
      .lean();

    // Get all categories for related blogs mapping
    const allCategories = await Category.find({}).lean();
    const catMap = {};
    allCategories.forEach(c => {
      catMap[c._id.toString()] = c.name;
    });

    let rawContent = getRenderableContent(blog.content || '');
    // Strip duplicate FAQ if array exists (Issue 12)
    rawContent = stripDuplicateFaq(rawContent, blog.faq?.length > 0);
    // Inject section images after H2 headings (Issue 1)
    rawContent = injectSectionImages(rawContent, blog.sectionImages || []);
    const { html: renderableContent, headings } = addHeadingIds(rawContent);
    const readingTime = calculateReadingTime(renderableContent);

    // Split content for lazy loading and ad injection
    const paragraphs = renderableContent.split('</p>').filter(p => p.trim() !== '').map(p => p + '</p>');
    
    // Content parts for Mobile (more granular for lazy loading)
    let mobileContentParts = [];
    if (paragraphs.length > 0) {
      // First section: Title, summary (if any), featured image, and first 2 paragraphs
      mobileContentParts.push(paragraphs.slice(0, 2).join(''));
      
      // Subsequent parts: 3 paragraphs each
      for (let i = 2; i < paragraphs.length; i += 3) {
        mobileContentParts.push(paragraphs.slice(i, i + 3).join(''));
      }
    } else {
      mobileContentParts = [renderableContent];
    }

    // Content parts for Desktop (keep existing 3-part logic for ads)
    let contentParts = [renderableContent];
    if (paragraphs.length > 3) {
      const firstPart = paragraphs.slice(0, 1).join('');
      const middleIndex = Math.ceil(paragraphs.length / 2);
      const secondPart = paragraphs.slice(1, middleIndex).join('');
      const thirdPart = paragraphs.slice(middleIndex).join('');
      contentParts = [firstPart, secondPart, thirdPart];
    }

    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        <ViewTracker slug={slug} />
        <ReadingProgressBar />

        {/* Mobile UI Only */}
        <MobileBlogLayout 
          blog={blog}
          relatedBlogs={relatedBlogsRaw}
          categoryName={categoryName}
          tagNames={tagNames}
          readingTime={readingTime}
          contentParts={mobileContentParts}
        />

        {/* Desktop UI Only */}
        <main className="hidden md:block mx-auto max-w-[1440px] px-6 py-12 lg:px-12">
          <nav className="mb-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <Link href="/blog" className="hover:text-orange-500 transition-colors">Magazine</Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link href={`/blog/${categorySlug}`} className="hover:text-orange-500 transition-colors">
              {categoryName}
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="max-w-[200px] truncate text-slate-500 dark:text-slate-400">{blog.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[80px_1fr_320px]">
            {/* Left Sticky Share Bar */}
            <aside className="hidden lg:block">
              <div className="sticky top-32 flex flex-col items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 rotate-90 mb-8 whitespace-nowrap">Share Article</span>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-400 hover:text-[#1da1f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <FiTwitter className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-600 hover:text-[#0077b5] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <FiLinkedin className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <FiLink className="h-4 w-4" />
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="min-w-0">
              <article>
                <header className="mb-10 text-center lg:text-left">
                  <div className="mb-6 flex flex-wrap justify-center lg:justify-start gap-3">
                    <Link
                      href={`/blog?category=${encodeURIComponent(categoryName)}`}
                      className="rounded-full bg-orange-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-orange-500/20"
                    >
                      {categoryName}
                    </Link>
                    {tagNames.slice(0, 3).map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${encodeURIComponent(tag)}`}
                        className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>

                  <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                    {blog.title}
                  </h1>

                  <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 border-y border-slate-100 dark:border-slate-800/50 py-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full ring-4 ring-slate-50 dark:ring-slate-800">
                        <Image src="/Profilemanju.jpeg" alt="Author" fill className="object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-900 dark:text-white">Manjunath M</p>
                        <p className="text-[10px] text-slate-400">Lead Architect</p>
                      </div>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-slate-100 dark:bg-slate-800" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">Published</span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-slate-100 dark:bg-slate-800" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">Reading Time</span>
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <FiClock className="h-3.5 w-3.5 text-orange-500" />
                        {readingTime} min read
                      </span>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-slate-100 dark:bg-slate-800" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">Engagement</span>
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <FiEye className="h-3.5 w-3.5 text-blue-500" />
                        {(blog.views || 0).toLocaleString()} views
                      </span>
                    </div>
                  </div>
                </header>

                {blog.featuredImage ? (
                  <div className="relative mb-12 h-[400px] lg:h-[600px] overflow-hidden rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <Image
                      src={fixUnsplashUrl(blog.featuredImage)}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 1280px) 100vw, 1200px"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ) : null}

                <div className="blog-content prose-lg prose-slate dark:prose-invert max-w-none leading-relaxed text-slate-700 dark:text-slate-300 prose-headings:font-black prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:mb-6 prose-p:leading-[1.8] prose-a:text-orange-600 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 dark:prose-blockquote:bg-orange-900/10 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-img:rounded-3xl prose-img:shadow-xl">
                  {contentParts.length > 1 ? (
                    <>
                      <div dangerouslySetInnerHTML={{ __html: contentParts[0] }} />
                      <div className="my-12 py-8 border-y border-slate-100 dark:border-slate-800/50">
                        <ArticleAd />
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: contentParts[1] }} />
                      <div className="my-12 py-8 border-y border-slate-100 dark:border-slate-800/50">
                        <ArticleAd />
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: contentParts[2] }} />
                    </>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: contentParts[0] }} />
                  )}
                </div>

                {/* FAQ Section */}
                {blog.faq?.length ? (
                  <div className="mt-20 rounded-[2.5rem] bg-white dark:bg-slate-800/50 p-8 lg:p-12 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Common Questions</h2>
                    <div className="space-y-4">
                      {blog.faq.map((item, i) => (
                        <details key={i} className="group rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 transition-all overflow-hidden">
                          <summary className="cursor-pointer px-6 py-5 text-lg font-bold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 list-none flex items-center justify-between transition-colors">
                            {item.question}
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm transition-transform group-open:rotate-180">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                            </span>
                          </summary>
                          <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
                            {item.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                <div className="mt-16">
                  <MultiplexAd />
                </div>
              </article>
            </div>

            {/* Right Sidebar */}
            <aside className="hidden xl:block">
              <div className="sticky top-32 space-y-8">
                <TableOfContents headings={headings} />
                <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-rose-600 p-8 text-white shadow-xl shadow-orange-500/20">
                  <h3 className="text-xl font-black tracking-tight mb-4 uppercase">Newsletter</h3>
                  <p className="text-sm font-medium text-orange-100 mb-6 leading-relaxed">Get the latest insights on tech, design, and architecture delivered to your inbox.</p>
                  <div className="space-y-3">
                    <input type="email" placeholder="email@example.com" className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm placeholder:text-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50" />
                    <button className="w-full rounded-xl bg-white py-3 text-sm font-black uppercase tracking-widest text-orange-600 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">Subscribe</button>
                  </div>
                </div>
                <SidebarAd />
              </div>
            </aside>
          </div>

          {/* Related Articles Section */}
          {relatedBlogsRaw?.length ? (
            <section className="mt-24 border-t border-slate-200 dark:border-slate-800 pt-16">
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-2">More from Magazine</p>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">You might also like</h2>
                </div>
                <Link href="/blog" className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">
                  View all <span className="text-xl">→</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedBlogsRaw.map((relatedBlog) => {
                  const rawRelatedCat = relatedBlog.category?.toString?.() || relatedBlog.category;
                  const relatedCatName = relatedBlog.category?.name || catMap[rawRelatedCat] || rawRelatedCat || 'uncategorized';
                  const relatedCatSlug = slugify(relatedCatName);
                  
                  return (
                    <Link
                      key={relatedBlog._id}
                      href={`/blog/${relatedCatSlug}/${relatedBlog.slug}`}
                      className="group block overflow-hidden rounded-[2rem] bg-white dark:bg-slate-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] shadow-sm border border-slate-100 dark:border-slate-700/50"
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-700">
                        <Image
                          src={fixUnsplashUrl(relatedBlog.featuredImage)}
                          alt={relatedBlog.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                      </div>
                      <div className="p-6">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                            {relatedCatName}
                          </span>
                        </div>
                        <h3 className="line-clamp-2 text-lg font-black leading-snug text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                          {relatedBlog.title}
                        </h3>
                        <div className="mt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-700/50 pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span>{new Date(relatedBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="flex items-center gap-1">
                            <FiEye className="h-3 w-3" />
                            {(relatedBlog.views || 0).toLocaleString()}
                          </span>
                        </div>
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
    console.error('Error loading blog:', error);
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Error loading article</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Something went wrong. Please try again later.</p>
        </div>
      </div>
    );
  }
}
