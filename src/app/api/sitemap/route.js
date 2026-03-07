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
      .select('slug category updatedAt createdAt tags')
      .lean();

    // Fetch all categories
    const categories = await Category.find()
      .select('slug parent updatedAt createdAt')
      .lean();

    // Build blog URLs — flat structure: /blog/[category]/[slug]
    const blogUrls = blogs.map(blog => {
      const categorySlug = blog.category?.toLowerCase().replace(/\s+/g, '-');
      const url = `/blog/${categorySlug}/${blog.slug}`;

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

    const categoryUrls = parentCategories.map(cat => ({
      url: escapeXml(`/blog/${cat.slug}`),
      lastModified: cat.updatedAt || cat.createdAt,
      changeFrequency: 'daily',
      priority: 0.7,
      type: 'category'
    }));

    // Build tag URLs from unique tags
    const tagCounts = {};
    blogs.forEach(b => {
      (b.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const tagUrls = Object.keys(tagCounts).map(tag => ({
      url: escapeXml(`/blog/tag/${encodeURIComponent(tag)}`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
      type: 'tag'
    }));

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
      ...tagUrls,
    ];

    return Response.json({
      success: true,
      urls: allUrls,
      counts: {
        total: allUrls.length,
        static: staticUrls.length,
        blogs: blogUrls.length,
        categories: categoryUrls.length,
        tags: tagUrls.length,
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
