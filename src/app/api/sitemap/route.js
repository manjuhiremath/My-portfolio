import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Category from "@/models/Category";

// Escape XML special characters
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    await connectDB();

    // Fetch all published blogs
    const blogs = await Blog.find({ published: true })
      .select('slug category subcategory updatedAt createdAt')
      .lean();

    // Fetch all categories
    const categories = await Category.find()
      .select('slug parent updatedAt createdAt')
      .lean();

    // Build blog URLs
    const blogUrls = blogs.map(blog => {
      const categorySlug = blog.category?.toLowerCase().replace(/\s+/g, '-');
      const subcategorySlug = blog.subcategory?.toLowerCase().replace(/\s+/g, '-');
      
      let url = '/blog';
      if (categorySlug) url += `/${categorySlug}`;
      if (subcategorySlug) url += `/${subcategorySlug}`;
      url += `/${blog.slug}`;

      return {
        url: escapeXml(url),
        lastModified: blog.updatedAt || blog.createdAt,
        changeFrequency: 'daily',
        priority: 0.8,
        type: 'blog'
      };
    });

    // Build category URLs
    const parentCategories = categories.filter(c => !c.parent);
    const subcategories = categories.filter(c => c.parent);

    const categoryUrls = parentCategories.map(cat => ({
      url: escapeXml(`/blog/${cat.slug}`),
      lastModified: cat.updatedAt || cat.createdAt,
      changeFrequency: 'daily',
      priority: 0.7,
      type: 'category'
    }));

    const subcategoryUrls = subcategories.map(sub => {
      const parent = parentCategories.find(p => p._id.toString() === sub.parent?.toString());
      return {
        url: escapeXml(`/blog/${parent?.slug || 'uncategorized'}/${sub.slug}`),
        lastModified: sub.updatedAt || sub.createdAt,
        changeFrequency: 'daily',
        priority: 0.6,
        type: 'subcategory'
      };
    });

    // Static pages
    const staticPages = [
      { url: '/', priority: 1.0, changeFrequency: 'daily' },
      { url: '/blog', priority: 0.9, changeFrequency: 'daily' },
      { url: '/about', priority: 0.7, changeFrequency: 'daily' },
      { url: '/contact', priority: 0.6, changeFrequency: 'daily' },
      { url: '/projects', priority: 0.8, changeFrequency: 'daily' },
      { url: '/experience', priority: 0.7, changeFrequency: 'daily' },
      { url: '/skills', priority: 0.7, changeFrequency: 'daily' },
    ];

    const staticUrls = staticPages.map(page => ({
      url: escapeXml(page.url),
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      type: 'static'
    }));

    const allUrls = [
      ...staticUrls,
      ...blogUrls,
      ...categoryUrls,
      ...subcategoryUrls
    ];

    return Response.json({
      success: true,
      urls: allUrls,
      counts: {
        total: allUrls.length,
        static: staticUrls.length,
        blogs: blogUrls.length,
        categories: categoryUrls.length,
        subcategories: subcategoryUrls.length
      }
    });

  } catch (error) {
    console.error('Sitemap API Error:', error);
    return Response.json(
      { error: 'Failed to fetch sitemap URLs' },
      { status: 500 }
    );
  }
}
