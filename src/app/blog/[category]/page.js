import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/Pagination';

export const revalidate = 3600;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function capitalize(text) {
  return text.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

const POSTS_PER_PAGE = 6;

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const categorySlug = params.category.toLowerCase();
    
    // Fetch category from DB with SEO data
    const category = await Category.findOne({ slug: categorySlug });
    const categoryName = category ? category.name : capitalize(params.category);
    
    const blogs = await Blog.find({
      category: { $regex: new RegExp(categoryName, 'i') },
      published: true
    }).limit(10);

    // Use DB SEO data or fallback
    const seoTitle = category?.seoTitle || `${categoryName} Articles - Blog`;
    const seoDescription = category?.seoDescription || `Explore ${categoryName.toLowerCase()} articles, tutorials, and insights. ${blogs.length} articles on ${categoryName.toLowerCase()} topics.`;
    const keywords = category?.keywords || [categoryName.toLowerCase()];
    
    return {
      title: seoTitle,
      description: seoDescription,
      keywords: keywords,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        type: 'website',
        url: `/blog/${params.category}`,
        siteName: 'Blog',
      },
      twitter: {
        card: 'summary',
        title: seoTitle,
        description: seoDescription,
      },
      robots: {
        index: true,
        follow: true,
      }
    };
  } catch (error) {
    return {
      title: 'Blog',
      description: 'Explore insightful articles on technology, design, and business.',
    };
  }
}

async function getCategoryAndBlogs(categorySlug, page = 1) {
  try {
    await connectDB();

    const categoryName = capitalize(categorySlug);
    
    const category = await Category.findOne({ name: categoryName });
    
    const skip = (page - 1) * POSTS_PER_PAGE;
    
    const blogs = await Blog.find({
      category: { $regex: new RegExp(categoryName, 'i') },
      published: true
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(POSTS_PER_PAGE);

    const totalBlogs = await Blog.countDocuments({
      category: { $regex: new RegExp(categoryName, 'i') },
      published: true
    });

    const totalPages = Math.ceil(totalBlogs / POSTS_PER_PAGE);

    return { 
      categoryName, 
      categorySlug, 
      blogs, 
      categoryColor: category?.color || '#6366f1',
      currentPage: page,
      totalPages,
      totalBlogs
    };
  } catch (error) {
    console.error('Error fetching category and blogs:', error);
    return null;
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const { categoryName, categorySlug, blogs, categoryColor, currentPage, totalPages, totalBlogs } = await getCategoryAndBlogs(params.category, page) || {};

  if (!categoryName) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground">Category Not Found</span>
          </nav>
          <div className="soft-card p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Category Not Found</h1>
            <p className="text-secondary">The category you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground capitalize">{categoryName}</span>
        </nav>

        <div className="text-center mb-12">
          <h1 className="minimal-heading mb-4 capitalize">
            {categoryName}
          </h1>
        </div>

        {blogs.length === 0 ? (
          <div className="soft-card p-12 text-center max-w-md mx-auto">
            <p className="text-secondary">No blogs found in this category yet.</p>
          </div>
        ) : (
          <>
            <div className="feature-grid">
              {blogs.map(blog => (
                <div key={blog._id}>
                  <BlogCard blog={blog} categoryColor={categoryColor} />
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                baseUrl={`/blog/${categorySlug}`} 
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
