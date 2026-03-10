import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/Pagination';
import Tag from '@/models/Tag';
import BannerAd from '@/components/ads/BannerAd';
import MultiplexAd from '@/components/ads/MultiplexAd';

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
      alternates: {
        canonical: `/blog/${rawCategory}`,
      },
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
      .lean(),
    Blog.countDocuments(categoryQuery),
    Tag.find({}).lean()
  ]);

  // Create tag map for any unpopulated IDs
  const tagMap = {};
  allTags.forEach(t => {
    const id = t._id.toString();
    tagMap[id] = t.name;
    // Also map by name for legacy string references
    tagMap[t.name] = t.name;
  });

  // Map blogs to ensure clean data for BlogCard
  const blogs = blogsRaw.map(blog => ({
    ...blog,
    category: blog.category?.name || blog.category,
    tags: (blog.tags || []).map(t => {
      // Handle populated Tag objects,Ids, Object and legacy strings
      if (!t) return null;
      if (typeof t === 'string') return tagMap[t] || t;
      if (t.name) return t.name;
      return tagMap[t._id?.toString()] || tagMap[t.toString()] || null;
    }).filter(Boolean)
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
    notFound();
  }

  const { categoryName, categorySlug, categoryColor, blogs, totalBlogs, totalPages, currentPage } = data;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {blogs.length > 0 && <BannerAd />}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-700 dark:hover:text-slate-200">
            Blog
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200">{categoryName}</span>
        </nav>

        <header className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: categoryColor }}
          >
            Category
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">{categoryName}</h1>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400 max-w-2xl">
            Explore our curated collection of {totalBlogs} article{totalBlogs === 1 ? '' : 's'} in the {categoryName.toLowerCase()} category.
          </p>
        </header>

        {blogs.length === 0 ? (
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-sm text-slate-600 dark:text-slate-400">
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
        {blogs.length > 0 && <MultiplexAd />}
      </main>
    </div>
  );
}
