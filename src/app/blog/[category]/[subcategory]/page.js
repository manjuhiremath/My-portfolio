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
    const subcategorySlug = params.subcategory.toLowerCase();
    
    // Fetch category and subcategory from DB
    const category = await Category.findOne({ slug: categorySlug });
    const subcategory = await Category.findOne({ slug: subcategorySlug });
    
    const categoryName = category ? category.name : capitalize(params.category);
    const subcategoryName = subcategory ? subcategory.name : capitalize(params.subcategory);
    
    const blogs = await Blog.find({
      category: { $regex: new RegExp(categoryName, 'i') },
      subcategory: { $regex: new RegExp(subcategoryName, 'i') },
      published: true
    }).limit(10);

    // Use DB SEO data or fallback
    const seoTitle = subcategory?.seoTitle || category?.seoTitle || `${subcategoryName} - ${categoryName} Articles`;
    const seoDescription = subcategory?.seoDescription || category?.seoDescription || `Explore ${subcategoryName.toLowerCase()} articles in ${categoryName.toLowerCase()}. ${blogs.length} tutorials and guides.`;
    const keywords = subcategory?.keywords || category?.keywords || [subcategoryName.toLowerCase()];
    
    return {
      title: seoTitle,
      description: seoDescription,
      keywords: keywords,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        type: 'website',
        url: `/blog/${params.category}/${params.subcategory}`,
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

async function getSubcategoryAndBlogs(categorySlug, subcategorySlug) {
  try {
    await connectDB();

    const categoryName = capitalize(categorySlug);
    const subcategoryName = capitalize(subcategorySlug);
    
    const category = await Category.findOne({ name: categoryName });
    
    const blogs = await Blog.find({
      category: { $regex: new RegExp(categoryName, 'i') },
      subcategory: { $regex: new RegExp(subcategoryName, 'i') },
      published: true
    }).sort({ createdAt: -1 });

    return { 
      categoryName, 
      categorySlug, 
      subcategoryName, 
      subcategorySlug, 
      blogs,
      categoryColor: category?.color || '#6366f1'
    };
  } catch (error) {
    console.error('Error fetching subcategory and blogs:', error);
    return null;
  }
}

export default async function SubcategoryPage({ params }) {
  const { categoryName, categorySlug, subcategoryName, subcategorySlug, blogs, categoryColor } = 
    await getSubcategoryAndBlogs(params.category, params.subcategory) || {};

  if (!subcategoryName) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground">Subcategory Not Found</span>
          </nav>
          <div className="soft-card p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Subcategory Not Found</h1>
            <p className="text-secondary">The subcategory you&apos;re looking for doesn&apos;t exist.</p>
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
          <Link href={`/blog/${categorySlug}`} className="hover:text-primary transition-colors capitalize">{categoryName}</Link>
          <span>/</span>
          <span className="text-foreground capitalize">{subcategoryName}</span>
        </nav>

        <div className="text-center mb-12">
          <h1 className="minimal-heading mb-4 capitalize">
            {subcategoryName}
          </h1>
          <p className="minimal-subheading mx-auto">
            {categoryName} &bull; {subcategoryName}
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="soft-card p-12 text-center max-w-md mx-auto">
            <p className="text-secondary">No blogs found in this subcategory yet.</p>
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