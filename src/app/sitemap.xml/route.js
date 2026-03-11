import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
import Tag from "@/models/Tag";

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

function slugify(text = '') {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to add URL to XML
function addUrl(xml, loc, lastmod, changefreq = 'daily', priority = '0.7') {
  xml += '  <url>\n';
  xml += `    <loc>${escapeXml(loc)}</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <changefreq>${changefreq}</changefreq>\n`;
  xml += `    <priority>${priority}</priority>\n`;
  xml += '  </url>\n';
  return xml;
}

export async function GET() {
  try {
    await connectDB();
    
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.manjuhiremath.in';
    const currentDate = new Date().toISOString();

    // Fetch everything needed
    const [blogs, categories, tags] = await Promise.all([
      Blog.find({ published: true }).select('slug category updatedAt createdAt tags').lean(),
      Category.find().select('slug name updatedAt createdAt').lean(),
      Tag.find().select('slug name updatedAt createdAt').lean()
    ]);

    // Build lookup maps
    const catMap = {};
    categories.forEach(c => {
      catMap[c._id.toString()] = c;
      catMap[c.name] = c;
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 1. HOME & BLOG ROOT & CORE PAGES
    xml = addUrl(xml, `${baseUrl}/`, currentDate, 'daily', '1.0');
    xml = addUrl(xml, `${baseUrl}/blog`, currentDate, 'daily', '0.9');
    xml = addUrl(xml, `${baseUrl}/about`, currentDate, 'monthly', '0.5');
    xml = addUrl(xml, `${baseUrl}/privacy-policy`, currentDate, 'monthly', '0.3');
    xml = addUrl(xml, `${baseUrl}/contact`, currentDate, 'monthly', '0.5');

    // 2. CATEGORY PAGES
    categories.forEach(cat => {
      const url = `${baseUrl}/blog/${cat.slug || slugify(cat.name)}`;
      xml = addUrl(xml, url, currentDate, 'daily', '0.8');
    });

    // 3. TAG PAGES
    tags.forEach(tag => {
      const url = `${baseUrl}/blog/tag/${tag.slug || slugify(tag.name)}`;
      xml = addUrl(xml, url, currentDate, 'daily', '0.6');
    });

    // 4. INDIVIDUAL BLOG POSTS
    blogs.forEach(blog => {
      const rawCat = blog.category?.toString() || '';
      const catDoc = catMap[rawCat];
      const categorySlug = catDoc?.slug || slugify(catDoc?.name || rawCat || 'uncategorized');
      
      const url = `${baseUrl}/blog/${categorySlug}/${blog.slug}`;
      xml = addUrl(xml, url, currentDate, 'daily', '0.8');
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
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
