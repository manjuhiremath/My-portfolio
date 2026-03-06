import Image from 'next/image';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ViewTracker from '@/components/blog/ViewTracker';
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

  const lines = normalized.split('\n');
  const html = [];
  let inUl = false;
  let inOl = false;
  let inPre = false;
  const codeBuffer = [];

  const closeLists = () => {
    if (inUl) {
      html.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      html.push('</ol>');
      inOl = false;
    }
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
        if (inOl) {
          html.push('</ol>');
          inOl = false;
        }
        html.push('<ul>');
        inUl = true;
      }
      html.push(`<li>${escapeHtml(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inOl) {
        if (inUl) {
          html.push('</ul>');
          inUl = false;
        }
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

function getRenderableContent(content = '') {
  const looksLikeHtml = /<([a-z][\w-]*)(\s[^>]*)?>/i.test(content);
  if (looksLikeHtml) return content;
  return formatPlainTextToHtml(content);
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

function calculateReadingTime(content = '') {
  const plain = stripHtml(content);
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 220));
}

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug: params.slug }).lean();

    if (!blog) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.',
      };
    }

    return {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      keywords: blog.keywords || blog.tags || [],
      openGraph: {
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        type: 'article',
        publishedTime: blog.createdAt,
        images: blog.featuredImage ? [{ url: blog.featuredImage }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        images: blog.featuredImage ? [blog.featuredImage] : [],
      },
    };
  } catch {
    return {
      title: 'Blog Post',
      description: 'Read our latest blog posts.',
    };
  }
}

export default async function BlogPage({ params }) {
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug: params.slug }).lean();

    if (!blog) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="mx-auto max-w-4xl px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Blog not found</h1>
            <p className="mt-2 text-sm text-slate-600">The article you are looking for does not exist.</p>
            <Link href="/blog" className="mt-4 inline-block text-orange-600 hover:underline">
              Back to blog
            </Link>
          </div>
          <Footer />
        </div>
      );
    }

    const [relatedBlogsRaw] = await Promise.all([
      Blog.find({
        $or: [{ category: blog.category }, { subcategory: blog.subcategory }],
        _id: { $ne: blog._id },
        published: true,
      })
        .limit(3)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const rawContent = getRenderableContent(blog.content || '');
    const { html: renderableContent, headings } = addHeadingIds(rawContent);
    const readingTime = calculateReadingTime(renderableContent);

    const categorySlug = slugify(blog.category);
    const subcategorySlug = slugify(blog.subcategory);
    const articlePath = subcategorySlug
      ? `/blog/${categorySlug}/${subcategorySlug}/${blog.slug}`
      : `/blog/${categorySlug}/${blog.slug}`;
    const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://manjuhiremath.in';
    const articleUrl = `${siteUrl}${articlePath}`;
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(blog.title || '');

    return (
      <div className="min-h-screen bg-background">
        <ViewTracker slug={params.slug} />
        <Navigation />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-700">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-700">
              Blog
            </Link>
            <span>/</span>
            <Link href={`/blog/${categorySlug}`} className="capitalize hover:text-slate-700">
              {blog.category}
            </Link>
            {subcategorySlug ? (
              <>
                <span>/</span>
                <Link href={`/blog/${categorySlug}/${subcategorySlug}`} className="capitalize hover:text-slate-700">
                  {blog.subcategory}
                </Link>
              </>
            ) : null}
            <span>/</span>
            <span className="max-w-[320px] truncate text-slate-700">{blog.title}</span>
          </nav>

          <header className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                {blog.category}
              </span>
              {blog.subcategory ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {blog.subcategory}
                </span>
              ) : null}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {blog.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
              <span>•</span>
              <span>{(blog.views || 0).toLocaleString()} views</span>
            </div>
          </header>

          {blog.featuredImage ? (
            <div className="relative mt-6 h-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-[340px] lg:h-[440px]">
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
              <div
                className="blog-content leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: renderableContent }}
              />

              {blog.tags?.length ? (
                <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
                  {blog.tags.map((tag, index) => (
                    <span key={`${tag}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-slate-900">Share</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    X
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              {headings.length ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h2 className="text-sm font-semibold text-slate-900">On this page</h2>
                  <ul className="mt-3 space-y-2">
                    {headings
                      .filter((item) => item.level <= 3)
                      .map((item) => (
                        <li key={item.id} className="text-xs">
                          <a
                            href={`#${item.id}`}
                            className={`block truncate text-slate-600 hover:text-orange-600 ${
                              item.level === 3 ? 'pl-3' : ''
                            }`}
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </section>

          {relatedBlogsRaw?.length ? (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Related Articles</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedBlogsRaw.map((relatedBlog) => (
                  <Link
                    key={relatedBlog._id}
                    href={`/${['blog', slugify(relatedBlog.category), slugify(relatedBlog.subcategory), relatedBlog.slug]
                      .filter(Boolean)
                      .join('/')}`}
                    className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative h-40 bg-slate-100">
                      <Image
                        src={fixUnsplashUrl(relatedBlog.featuredImage)}
                        alt={relatedBlog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-orange-600">
                        {relatedBlog.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(relatedBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error loading blog:', error);
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Error loading article</h1>
          <p className="mt-2 text-sm text-slate-600">Something went wrong. Please try again later.</p>
        </div>
        <Footer />
      </div>
    );
  }
}

