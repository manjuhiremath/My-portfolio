import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/Pagination';

export const revalidate = 3600;
const POSTS_PER_PAGE = 12;

function readableLabel(text = '') {
  return decodeURIComponent(text)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function generateMetadata({ params }) {
  const tagName = decodeURIComponent(params.tag);
  const label = readableLabel(params.tag);

  try {
    await connectDB();
    const total = await Blog.countDocuments({
      tags: { $regex: new RegExp(`^${tagName}$`, 'i') },
      published: true,
    });

    return {
      title: `#${label} — Articles & Guides`,
      description: `Browse ${total} article${total === 1 ? '' : 's'} tagged with #${label}. Practical insights and tutorials.`,
      openGraph: {
        title: `#${label} — Articles & Guides`,
        description: `Browse articles tagged with #${label}.`,
        type: 'website',
        url: `/blog/tag/${params.tag}`,
      },
    };
  } catch {
    return { title: `#${label}`, description: `Articles tagged with ${label}.` };
  }
}

async function getTagBlogs(tag, page = 1) {
  await connectDB();
  const tagName = decodeURIComponent(tag);
  const skip = (page - 1) * POSTS_PER_PAGE;

  const [blogs, total] = await Promise.all([
    Blog.find({
      tags: { $regex: new RegExp(`^${tagName}$`, 'i') },
      published: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(POSTS_PER_PAGE)
      .lean(),
    Blog.countDocuments({
      tags: { $regex: new RegExp(`^${tagName}$`, 'i') },
      published: true,
    }),
  ]);

  return {
    tagName,
    blogs,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
    currentPage: page,
  };
}

export default async function TagPage({ params, searchParams }) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const data = await getTagBlogs(params.tag, page);
  const label = readableLabel(params.tag);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-700">Blog</Link>
          <span>/</span>
          <span className="text-slate-700">#{label}</span>
        </nav>

        {/* Header */}
        <header className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                #{label}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {data.total} article{data.total === 1 ? '' : 's'} with this tag
              </p>
            </div>
          </div>
        </header>

        {/* Blog Grid */}
        {data.blogs.length === 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
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
      </main>
    </div>
  );
}
