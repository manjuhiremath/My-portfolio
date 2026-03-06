import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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

    const category = await Category.findOne({ slug: params.category.toLowerCase() }).lean();
    const subcategory = await Category.findOne({ slug: params.subcategory.toLowerCase() }).lean();

    const categoryName = category?.name || readableLabel(params.category);
    const subcategoryName = subcategory?.name || readableLabel(params.subcategory);

    const totalBlogs = await Blog.countDocuments({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      subcategory: { $regex: new RegExp(`^${subcategoryName}$`, 'i') },
      published: true,
    });

    const title = subcategory?.seoTitle || `${subcategoryName} in ${categoryName}`;
    const description =
      subcategory?.seoDescription ||
      `${totalBlogs} article${totalBlogs === 1 ? '' : 's'} for ${subcategoryName.toLowerCase()} under ${categoryName.toLowerCase()}.`;

    return {
      title,
      description,
      keywords: subcategory?.keywords || category?.keywords || [subcategoryName.toLowerCase()],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `/blog/${params.category}/${params.subcategory}`,
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'Blog Subcategory',
      description: 'Browse subcategory articles.',
    };
  }
}

async function getSubcategoryBlogs(categorySlug, subcategorySlug, page = 1) {
  await connectDB();

  const category = await Category.findOne({ slug: categorySlug.toLowerCase() }).lean();
  const subcategory = await Category.findOne({ slug: subcategorySlug.toLowerCase() }).lean();

  const categoryName = category?.name || readableLabel(categorySlug);
  const subcategoryName = subcategory?.name || readableLabel(subcategorySlug);
  const skip = (page - 1) * POSTS_PER_PAGE;

  const [blogs, totalBlogs] = await Promise.all([
    Blog.find({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      subcategory: { $regex: new RegExp(`^${subcategoryName}$`, 'i') },
      published: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(POSTS_PER_PAGE)
      .lean(),
    Blog.countDocuments({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      subcategory: { $regex: new RegExp(`^${subcategoryName}$`, 'i') },
      published: true,
    }),
  ]);

  return {
    categoryName,
    categorySlug: slugify(categoryName),
    categoryColor: category?.color || '#6366f1',
    subcategoryName,
    subcategorySlug: slugify(subcategoryName),
    blogs,
    totalBlogs,
    totalPages: Math.ceil(totalBlogs / POSTS_PER_PAGE),
    currentPage: page,
  };
}

export default async function SubcategoryPage({ params, searchParams }) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const data = await getSubcategoryBlogs(params.category, params.subcategory, page);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Subcategory not found</h1>
          <p className="mt-2 text-sm text-slate-600">The subcategory you requested does not exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    categoryName,
    categorySlug,
    categoryColor,
    subcategoryName,
    subcategorySlug,
    blogs,
    totalBlogs,
    totalPages,
    currentPage,
  } = data;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

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
          <Link href={`/blog/${categorySlug}`} className="hover:text-slate-700">
            {categoryName}
          </Link>
          <span>/</span>
          <span className="text-slate-700">{subcategoryName}</span>
        </nav>

        <header className="rounded-xl border border-slate-200 bg-white p-5">
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: categoryColor }}
          >
            Subcategory
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{subcategoryName}</h1>
          <p className="mt-2 text-sm text-slate-600">
            In {categoryName}. {totalBlogs} article{totalBlogs === 1 ? '' : 's'} available.
          </p>
        </header>

        {blogs.length === 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
            No published posts in this subcategory yet.
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} categoryColor={categoryColor} />
              ))}
            </section>

            {totalPages > 1 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/blog/${categorySlug}/${subcategorySlug}`}
              />
            ) : null}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

