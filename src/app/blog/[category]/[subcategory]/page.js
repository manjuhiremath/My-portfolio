import Image from 'next/image';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/Pagination';

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

async function getSubcategoryAndBlogs(categorySlug, subcategorySlug, page = 1) {
  try {
    await connectDB();

    const categoryName = capitalize(categorySlug);
    const subcategoryName = capitalize(subcategorySlug);
    
    const category = await Category.findOne({ name: categoryName });
    
    const skip = (page - 1) * POSTS_PER_PAGE;
    
    const blogs = await Blog.find({
      category: { $regex: new RegExp(categoryName, 'i') },
      subcategory: { $regex: new RegExp(subcategoryName, 'i') },
      published: true
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(POSTS_PER_PAGE);

    const totalBlogs = await Blog.countDocuments({
      category: { $regex: new RegExp(categoryName, 'i') },
      subcategory: { $regex: new RegExp(subcategoryName, 'i') },
      published: true
    });

    const totalPages = Math.ceil(totalBlogs / POSTS_PER_PAGE);

    return { 
      categoryName, 
      categorySlug, 
      subcategoryName, 
      subcategorySlug, 
      blogs,
      categoryColor: category?.color || '#6366f1',
      currentPage: page,
      totalPages,
      totalBlogs
    };
  } catch (error) {
    console.error('Error fetching subcategory and blogs:', error);
    return null;
  }
}

export default async function SubcategoryPage({ params, searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const { categoryName, categorySlug, subcategoryName, subcategorySlug, blogs, categoryColor, currentPage, totalPages, totalBlogs } = 
    await getSubcategoryAndBlogs(params.category, params.subcategory, page) || {};

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
                baseUrl={`/blog/${categorySlug}/${subcategorySlug}`} 
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}