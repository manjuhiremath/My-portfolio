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

          <header className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <Link
                href={`/blog?category=${encodeURIComponent(categoryName)}`}
                className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-400 hover:bg-orange-200 transition-colors"
              >
                {categoryName}
              </Link>
              {tagNames.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {blog.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
              <span>•</span>
              <span>{(blog.views || 0).toLocaleString()} views</span>
            </div>
          </header>

          {blog.featuredImage ? (
            <div className="relative mt-6 h-[240px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 sm:h-[340px] lg:h-[440px]">
              <Image
                src={fixUnsplashUrl(blog.featuredImage)}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          <section className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_280px]">
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
                <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-200 dark:border-slate-700 pt-6">
                  {tagNames.map((tag, index) => (
                    <Link
                      key={`${tag}-${index}`}
                      href={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* FAQ Schema */}
              {blog.faq?.length ? (
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {blog.faq.map((item, i) => (
                      <details key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                          {item.question}
                        </summary>
                        <p className="px-4 pb-3 text-sm text-slate-600 dark:text-slate-400">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              ) : null}
              
              <MultiplexAd />
            </article>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <TableOfContents headings={headings} />
              <SidebarAd />
            </aside>
          </section>

          {relatedBlogsRaw?.length ? (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Related Articles</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedBlogsRaw.map((relatedBlog) => {
                  // Handle category resolution for related blogs
                  const rawRelatedCat = relatedBlog.category?.toString?.() || relatedBlog.category;
                  const relatedCatName = relatedBlog.category?.name || catMap[rawRelatedCat] || rawRelatedCat || 'uncategorized';
                  const relatedCatSlug = slugify(relatedCatName);
                  
                  return (
                    <Link
                      key={relatedBlog._id}
                      href={`/blog/${relatedCatSlug}/${relatedBlog.slug}`}
                      className="group block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="relative h-40 bg-slate-100 dark:bg-slate-700">
                        <Image
                          src={fixUnsplashUrl(relatedBlog.featuredImage)}
                          alt={relatedBlog.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white group-hover:text-orange-600">
                          {relatedBlog.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(relatedBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
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
