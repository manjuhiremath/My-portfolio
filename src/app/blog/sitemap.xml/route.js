import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Category from "@/models/Category";

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
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function addImage(xml, url, title, caption) {
  let imgXml = '    <image:image>\n';
  imgXml += `      <image:loc>${escapeXml(url)}</image:loc>\n`;
  if (title) imgXml += `      <image:title>${escapeXml(title)}</image:title>\n`;
  if (caption) imgXml += `      <image:caption>${escapeXml(caption)}</image:caption>\n`;
  imgXml += '    </image:image>\n';
  return xml + imgXml;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('id');
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.manjuhiremath.in';

  try {
    await connectDB();

    // USE CASE 1: Main sitemap index - lists all category sitemaps
    if (!categoryId) {
      const categories = await Category.find().select('slug name updatedAt').lean();
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Category sitemaps: /blog/sitemap.xml?id=technology
      categories.forEach(cat => {
        const slug = cat.slug || slugify(cat.name);
        xml += '  <sitemap>\n';
        xml += `    <loc>${baseUrl}/blog/sitemap.xml?id=${slug}</loc>\n`;
        xml += `    <lastmod>${cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString()}</lastmod>\n`;
        xml += '  </sitemap>\n';
      });

      xml += '</sitemapindex>';

      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // USE CASE 2: Category-specific sitemap with all content images
    const category = await Category.findOne({ 
      $or: [
        { slug: categoryId },
        { name: { $regex: new RegExp(`^${categoryId}$`, 'i') } }
      ]
    }).lean();

    if (!category) {
      return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    const blogs = await Blog.find({ 
      $or: [
        { category: category._id },
        { category: category.name }
      ],
      published: true 
    })
    .select('slug title excerpt featuredImage sectionImages category createdAt updatedAt')
    .sort({ createdAt: -1 })
    .lean();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    const categorySlug = category.slug || slugify(category.name);
    const currentDate = new Date().toISOString();

    blogs.forEach(blog => {
      const blogUrl = `${baseUrl}/blog/${categorySlug}/${blog.slug}`;
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(blogUrl)}</loc>\n`;
      xml += `    <lastmod>${blog.updatedAt ? new Date(blog.updatedAt).toISOString() : currentDate}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';

      // 1. Add Featured Image
      if (blog.featuredImage) {
        xml = addImage(xml, blog.featuredImage, blog.title, blog.excerpt);
      }

      // 2. Add all Section/Content Images
      if (blog.sectionImages && Array.isArray(blog.sectionImages)) {
        blog.sectionImages.forEach((imgUrl, index) => {
          if (imgUrl) {
            xml = addImage(xml, imgUrl, `${blog.title} - Image ${index + 1}`, blog.title);
          }
        });
      }

      xml += '  </url>\n';
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
