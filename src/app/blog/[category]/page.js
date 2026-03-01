import Image from 'next/image';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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

async function getCategoryAndBlogs(categorySlug) {
  try {
    await connectDB();

    const categoryName = capitalize(categorySlug);
    
    const category = await Category.findOne({ name: categoryName });
    
    const blogs = await Blog.find({
      category: { $regex: new RegExp(categoryName, 'i') },
      published: true
    }).sort({ createdAt: -1 });

    return { categoryName, categorySlug, blogs, categoryColor: category?.color || '#6366f1' };
  } catch (error) {
    console.error('Error fetching category and blogs:', error);
    return null;
  }
}

export default async function CategoryPage({ params }) {
  const { categoryName, categorySlug, blogs, categoryColor } = await getCategoryAndBlogs(params.category) || {};

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
          <div className="feature-grid">
            {blogs.map(blog => (
              <Link
                key={blog._id}
                href={`/blog/${slugify(blog.category)}/${slugify(blog.subcategory)}/${blog.slug}`}
                className="feature-card group cursor-pointer"
              >
                <div className="image-container">
                  <Image
                    src={blog.featuredImage || '/placeholder-image.jpg'}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="content">
                  <span 
                    className="category-tag"
                    style={{ 
                      backgroundColor: `${categoryColor}15`,
                      color: categoryColor,
                      border: `1px solid ${categoryColor}30`
                    }}
                  >
                    {blog.category}
                  </span>

                  <h2 className="group-hover:opacity-80 transition-colors">
                    {blog.title}
                  </h2>

                  <p className="line-clamp-2">
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-secondary mt-3 pt-2 border-t border-gray-100">
                    <span>{blog.subcategory}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}