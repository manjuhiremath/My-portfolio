import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import ViewTracker from '@/components/blog/ViewTracker';
import TableOfContents from '@/components/blog/TableOfContents';
import ArticleAd from '@/components/ads/ArticleAd';
import SidebarAd from '@/components/ads/SidebarAd';
import MultiplexAd from '@/components/ads/MultiplexAd';
import { fixUnsplashUrl, slugify } from '@/lib/utils';

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
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return formatted;
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
      html.push(`<li>${escapeHtml(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inOl) {
        if (inUl) { html.push('</ul>'); inUl = false; }
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${escapeHtml(olMatch[1])}</li>`);
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
  if (looksLikeHtml) return cleaned;
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
    // Inject section images after H2 headings (Issue 1)
    rawContent = injectSectionImages(rawContent, blog.sectionImages || []);
    const { html: renderableContent, headings } = addHeadingIds(rawContent);
    const readingTime = calculateReadingTime(renderableContent);

    // Split content for ad injection
    const paragraphs = renderableContent.split('</p>');
    const hasEnoughParagraphs = paragraphs.length > 3;
    
    let contentParts = [renderableContent];
    if (hasEnoughParagraphs) {
      const firstPart = paragraphs.slice(0, 1).join('</p>') + '</p>';
      const middleIndex = Math.ceil(paragraphs.length / 2);
      const secondPart = paragraphs.slice(1, middleIndex).join('</p>') + '</p>';
      const thirdPart = paragraphs.slice(middleIndex).join('</p>');
      contentParts = [firstPart, secondPart, thirdPart];
    }

    return (
      <div className="min-h-screen bg-background">
        <ViewTracker slug={params.slug} />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/blog" className="hover:text-slate-700 dark:hover:text-slate-200">Blog</Link>
            <span>/</span>
            <Link href={`/blog/${categorySlug}`} className="capitalize hover:text-slate-700 dark:hover:text-slate-200">
              {categoryName}
            </Link>
            <span>/</span>
            <span className="max-w-[320px] truncate text-slate-700 dark:text-slate-300">{blog.title}</span>
          </nav>

          <header className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap gap-2">
              <Link
                href={`/blog?category=${encodeURIComponent(categoryName)}`}
                className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 hover:bg-orange-200 transition-colors"
              >
                {categoryName}
              </Link>
              {tagNames.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {blog.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-white dark:ring-slate-700">
                  <Image src="/Profilemanju.jpeg" alt="Author" fill className="object-cover" />
                </div>
                <span className="text-slate-700 dark:text-slate-200">Manjunath M</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="flex items-center gap-1.5">
                <FiClock className="h-3.5 w-3.5" />
                {readingTime} min read
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="flex items-center gap-1.5">
                <FiEye className="h-3.5 w-3.5" />
                {(blog.views || 0).toLocaleString()} views
              </span>
            </div>
          </header>

          {blog.featuredImage ? (
            <div className="relative mt-6 h-[240px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xl sm:h-[340px] lg:h-[480px]">
              <Image
                src={fixUnsplashUrl(blog.featuredImage)}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : null}

          <section className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px]">
            <article className="min-w-0">
              <div className="blog-content leading-relaxed text-slate-700 dark:text-slate-300">
                {contentParts.length > 1 ? (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: contentParts[0] }} />
                    <ArticleAd />
                    <div dangerouslySetInnerHTML={{ __html: contentParts[1] }} />
                    <ArticleAd />
                    <div dangerouslySetInnerHTML={{ __html: contentParts[2] }} />
                  </>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: contentParts[0] }} />
                )}
              </div>

              {tagNames.length ? (
                <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 dark:border-slate-700 pt-8">
                  {tagNames.map((tag, index) => (
                    <Link
                      key={`${tag}-${index}`}
                      href={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* FAQ Schema */}
              {blog.faq?.length ? (
                <div className="mt-10 border-t border-slate-200 dark:border-slate-700 pt-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {blog.faq.map((item, i) => (
                      <details key={i} className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all">
                        <summary className="cursor-pointer px-5 py-4 text-base font-bold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 list-none flex items-center justify-between">
                          {item.question}
                          <span className="transition-transform group-open:rotate-180">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </span>
                        </summary>
                        <div className="px-5 pb-4 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 mt-2 pt-4">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ) : null}
              
              <div className="mt-10">
                <MultiplexAd />
              </div>
            </article>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <TableOfContents headings={headings} />
              <SidebarAd />
            </aside>
          </section>

          {relatedBlogsRaw?.length ? (
            <section className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-12">
              <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full bg-orange-500" />
                Related Articles
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedBlogsRaw.map((relatedBlog) => {
                  // Handle category resolution for related blogs
                  const rawRelatedCat = relatedBlog.category?.toString?.() || relatedBlog.category;
                  const relatedCatName = relatedBlog.category?.name || catMap[rawRelatedCat] || rawRelatedCat || 'uncategorized';
                  const relatedCatSlug = slugify(relatedCatName);
                  
                  return (
                    <Link
                      key={relatedBlog._id}
                      href={`/blog/${relatedCatSlug}/${relatedBlog.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm"
                    >
                      <div className="relative h-48 bg-slate-100 dark:bg-slate-700">
                        <Image
                          src={fixUnsplashUrl(relatedBlog.featuredImage)}
                          alt={relatedBlog.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                      <div className="p-5">
                        <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">
                          {relatedCatName}
                        </p>
                        <h3 className="line-clamp-2 text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                          {relatedBlog.title}
                        </h3>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                          <span>{new Date(relatedBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
