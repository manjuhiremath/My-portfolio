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

// Helper to add URL to XML
function addUrl(xml, loc, lastmod) {
  xml += '  <url>\n';
  xml += `    <loc>${escapeXml(loc)}</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '  </url>\n';
  return xml;
}

export async function GET() {
  try {
    await connectDB();
    
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.manjuhiremath.in';
    const currentDate = new Date().toISOString();

    // Fetch all published blogs
    const blogs = await Blog.find({ published: true })
      .select('slug category updatedAt createdAt tags')
      .lean();

    // Fetch all categories
    const categories = await Category.find()
      .select('slug parent name updatedAt createdAt')
      .lean();

    // Count blogs per category for pagination
    const blogsPerCategory = {};
    blogs.forEach(blog => {
      const catKey = blog.category?.toLowerCase().replace(/\s+/g, '-');
      if (!blogsPerCategory[catKey]) blogsPerCategory[catKey] = 0;
      blogsPerCategory[catKey]++;
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 1. MAIN URL (/blog)
    xml = addUrl(xml, `${baseUrl}/blog`, currentDate);

    // Build parent categories lookup
    const parentCategories = categories.filter(c => !c.parent);

    // 2. CATEGORY URLS WITH PAGINATION
    parentCategories.forEach(cat => {
      xml = addUrl(xml, `${baseUrl}/blog/${cat.slug}`, currentDate);
      
      const blogCount = blogsPerCategory[cat.slug] || 0;
      const totalPages = Math.ceil(blogCount / 9);
      for (let page = 2; page <= totalPages; page++) {
        xml = addUrl(xml, `${baseUrl}/blog/${cat.slug}?page=${page}`, currentDate);
      }
    });

    // 3. TAG URLS
    const tagCounts = {};
    blogs.forEach(b => {
      (b.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    Object.keys(tagCounts).forEach(tag => {
      xml = addUrl(xml, `${baseUrl}/blog/tag/${encodeURIComponent(tag)}`, currentDate);
    });

    // 4. INDIVIDUAL BLOG POSTS — flat structure: /blog/[category]/[slug]
    blogs.forEach(blog => {
      const categorySlug = blog.category?.toLowerCase().replace(/\s+/g, '-');
      const url = `${baseUrl}/blog/${categorySlug}/${blog.slug}`;
      xml = addUrl(xml, url, currentDate);
    });

    xml += '</urlset>';

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Sitemap XML Error:', error);
    
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.manjuhiremath.in';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(`${baseUrl}/blog`)}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '  </url>\n';
    xml += '</urlset>';
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
