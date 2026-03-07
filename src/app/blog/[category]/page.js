import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/Pagination';
import Tag from '@/models/Tag';

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
    const { category: rawCategory } = await params;
    await connectDB();
    const categorySlug = rawCategory.toLowerCase();
    
    // First try to find by slug
    let category = await Category.findOne({ slug: categorySlug }).lean();
    
    // If not found by slug, try to find by ObjectId
    if (!category) {
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(categorySlug) && categorySlug.length === 24) {
        category = await Category.findById(categorySlug).lean();
      }
    }
    
    // If still not found, try to find by name
    if (!category) {
      category = await Category.findOne({ name: { $regex: new RegExp(`^${categorySlug}$`, 'i') } }).lean();
    }
    
    if (!category) {
      return {
        title: 'Blog Category',
        description: 'Browse category articles.',
      };
    }

    // Query for both ObjectId and string category
    const categoryQuery = {
      $or: [
        { category: category._id },
        { category: category.name }
      ],
      published: true
    };
    
    const totalBlogs = await Blog.countDocuments(categoryQuery);

    const title = category.seoTitle || `${category.name} Articles`;
    const description =
      category.seoDescription ||
      `Browse ${totalBlogs} ${category.name.toLowerCase()} article${totalBlogs === 1 ? '' : 's'} with practical insights and tutorials.`;

    return {
      title,
      description,
      keywords: category.keywords || [category.name.toLowerCase()],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `/blog/${rawCategory}`,
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
  
  // First try to find by slug
  let category = await Category.findOne({ slug: decodedSlug }).lean();
  
  // If not found by slug, try to find by ObjectId (for backwards compatibility)
  if (!category) {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.Types.ObjectId.isValid(decodedSlug) && decodedSlug.length === 24) {
      category = await Category.findById(decodedSlug).lean();
    }
  }
  
  // If still not found, try to find by name (for old blogs with string category)
  if (!category) {
    category = await Category.findOne({ name: { $regex: new RegExp(`^${decodedSlug}$`, 'i') } }).lean();
  }
  
  if (!category) {
    return null;
  }
  
  const skip = (page - 1) * POSTS_PER_PAGE;

  // Query for both ObjectId and string category (backwards compatibility)
  const categoryQuery = {
    $or: [
      { category: category._id },
      { category: category.name }
    ],
    published: true
  };

  const [blogsRaw, totalBlogs, allTags] = await Promise.all([
    Blog.find(categoryQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(POSTS_PER_PAGE)
      .populate('category')
      .populate('tags')
      .lean(),
    Blog.countDocuments(categoryQuery),
    Tag.find({}).lean()
  ]);

  // Create tag map for any unpopulated IDs
  const tagMap = {};
  allTags.forEach(t => {
    tagMap[t._id.toString()] = t.name;
  });

  // Map blogs to ensure clean data for BlogCard
  const blogs = blogsRaw.map(blog => ({
    ...blog,
    category: blog.category?.name || blog.category,
    tags: (blog.tags || []).map(t => t?.name || tagMap[t?.toString?.()] || t)
  }));

  return {
    categoryName: category.name,
    categorySlug: category.slug,
    categoryColor: category.color || '#6366f1',
    blogs,
    totalBlogs,
    totalPages: Math.ceil(totalBlogs / POSTS_PER_PAGE),
    currentPage: page,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const data = await getCategoryBlogs(category, page);

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
