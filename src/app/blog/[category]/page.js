import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/Pagination';

export const revalidate = 3600;
const POSTS_PER_PAGE = 9;

function slugify(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readableLabel(text = '') {
  return text.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const categorySlug = params.category.toLowerCase();
    const category = await Category.findOne({ slug: categorySlug }).lean();
    const categoryName = category?.name || readableLabel(params.category);
    const totalBlogs = await Blog.countDocuments({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      published: true,
    });

    const title = category?.seoTitle || `${categoryName} Articles`;
    const description =
      category?.seoDescription ||
      `Browse ${totalBlogs} ${categoryName.toLowerCase()} article${totalBlogs === 1 ? '' : 's'} with practical insights and tutorials.`;

    return {
      title,
      description,
      keywords: category?.keywords || [categoryName.toLowerCase()],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `/blog/${params.category}`,
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'Blog Category',
      description: 'Browse category articles.',
    };
  }
}

async function getCategoryBlogs(categorySlug, page = 1) {
  await connectDB();

  const decodedSlug = categorySlug.toLowerCase();
  const category = await Category.findOne({ slug: decodedSlug }).lean();
  const categoryName = category?.name || readableLabel(categorySlug);
  const skip = (page - 1) * POSTS_PER_PAGE;

  const [blogs, totalBlogs] = await Promise.all([
    Blog.find({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      published: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(POSTS_PER_PAGE)
      .lean(),
    Blog.countDocuments({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      published: true,
    }),
  ]);

  return {
    categoryName,
    categorySlug: slugify(categoryName),
    categoryColor: category?.color || '#6366f1',
    blogs,
    totalBlogs,
    totalPages: Math.ceil(totalBlogs / POSTS_PER_PAGE),
    currentPage: page,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const data = await getCategoryBlogs(params.category, page);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Category not found</h1>
          <p className="mt-2 text-sm text-slate-600">The category you requested does not exist.</p>
        </div>
      </div>
    );
  }

  const { categoryName, categorySlug, categoryColor, blogs, totalBlogs, totalPages, currentPage } = data;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-700">
            Blog
          </Link>
          <span>/</span>
          <span className="text-slate-700">{categoryName}</span>
        </nav>

        <header className="rounded-xl border border-slate-200 bg-white p-5">
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: categoryColor }}
          >
            Category
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{categoryName}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {totalBlogs} article{totalBlogs === 1 ? '' : 's'} in this category.
          </p>
        </header>

        {blogs.length === 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
            No published posts in this category yet.
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} categoryColor={categoryColor} />
              ))}
            </section>

            {totalPages > 1 ? (
              <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/blog/${categorySlug}`} />
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
