import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Tag from '@/models/Tag';
import Category from '@/models/Category';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/Pagination';
import BannerAd from '@/components/ads/BannerAd';
import MultiplexAd from '@/components/ads/MultiplexAd';
import { fixUnsplashUrl, slugify } from '@/lib/utils';

export const revalidate = 3600;
const POSTS_PER_PAGE = 12;

function readableLabel(text = '') {
  return decodeURIComponent(text)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function generateMetadata({ params }) {
  const { tag: rawTag } = await params;
  const tagSlug = slugify(decodeURIComponent(rawTag));

  try {
    await connectDB();
    const tag = await Tag.findOne({ slug: tagSlug }).lean();
    
    if (!tag) {
      const label = readableLabel(rawTag);
      return { title: `#${label}`, description: `Articles tagged with ${label}.` };
    }

    const total = await Blog.countDocuments({
      tags: tag._id,
      published: true,
    });

    const label = tag.name;
    return {
      title: `#${label} — Articles & Guides`,
      description: `Browse ${total} article${total === 1 ? '' : 's'} tagged with #${label}. Practical insights and tutorials.`,
      alternates: {
        canonical: `/blog/tag/${rawTag}`,
      },
      openGraph: {
        title: `#${label} — Articles & Guides`,
        description: `Browse articles tagged with #${label}.`,
        type: 'website',
        url: `/blog/tag/${rawTag}`,
      },
    };
  } catch {
    const label = readableLabel(rawTag);
    return { title: `#${label}`, description: `Articles tagged with ${label}.` };
  }
}

async function getTagBlogs(tag, page = 1) {
  await connectDB();
  const decodedTag = decodeURIComponent(tag);
  const tagSlug = slugify(decodedTag);
  
  let tagDoc = await Tag.findOne({ slug: tagSlug }).lean();
  
  if (!tagDoc) {
    // Try finding by name case-insensitively if slug didn't work
    tagDoc = await Tag.findOne({ name: { $regex: new RegExp(`^${decodedTag.replace(/-/g, ' ')}$`, 'i') } }).lean();
  }

  if (!tagDoc) {
    return null;
  }
  
  const skip = (page - 1) * POSTS_PER_PAGE;

  const [blogsRaw, total, allTags, allCategories] = await Promise.all([
    Blog.find({
      tags: tagDoc._id,
      published: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(POSTS_PER_PAGE)
      .populate('category')
      .populate('tags')
      .lean(),
    Blog.countDocuments({
      tags: tagDoc._id,
      published: true,
    }),
    Tag.find({}).lean(),
    Category.find({}).lean()
  ]);

  // Create lookup maps for robust resolution
  const tagMap = {};
  allTags.forEach(t => {
    tagMap[t._id.toString()] = t.name;
  });

  const catMap = {};
  allCategories.forEach(c => {
    catMap[c._id.toString()] = c.name;
  });

  // Map blogs to ensure clean data for BlogCard
  const blogs = blogsRaw.map(blog => ({
    ...blog,
    category: blog.category?.name || catMap[blog.category?.toString?.()] || blog.category,
    tags: (blog.tags || []).map(t => t?.name || tagMap[t?.toString?.()] || t)
  }));

  return {
    tagName: tagDoc.name,
    tagColor: tagDoc.color || '#f97316',
    blogs,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
    currentPage: page,
  };
}

export default async function TagPage({ params, searchParams }) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const data = await getTagBlogs(tag, page);

  if (!data) {
    notFound();
  }

  const label = readableLabel(tag);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {data.blogs.length > 0 && <BannerAd />}
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-700 dark:hover:text-slate-200">Blog</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200">#{label}</span>
        </nav>

        {/* Header */}
        <header className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                #{label}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {data.total} article{data.total === 1 ? '' : 's'} with this tag
              </p>
            </div>
          </div>
        </header>

        {/* Blog Grid */}
        {data.blogs.length === 0 ? (
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-sm text-slate-600 dark:text-slate-400">
            No published articles with this tag yet.
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </section>

            {data.totalPages > 1 && (
              <Pagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                baseUrl={`/blog/tag/${params.tag}`}
              />
            )}
          </>
        )}
        {data.blogs.length > 0 && <MultiplexAd />}
      </main>
    </div>
  );
}
