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
      .select('slug category subcategory updatedAt createdAt')
      .lean();

    // Fetch all categories
    const categories = await Category.find()
      .select('slug parent name updatedAt createdAt')
      .lean();

    // Group blogs by category and subcategory
    const blogsBySubcategory = {};
    blogs.forEach(blog => {
      const catKey = blog.category?.toLowerCase().replace(/\s+/g, '-');
      const subKey = blog.subcategory?.toLowerCase().replace(/\s+/g, '-');
      const key = `${catKey}/${subKey}`;
      if (!blogsBySubcategory[key]) blogsBySubcategory[key] = [];
      blogsBySubcategory[key].push(blog);
    });

    // Count blogs per category for pagination
    const blogsPerCategory = {};
    blogs.forEach(blog => {
      const catKey = blog.category?.toLowerCase().replace(/\s+/g, '-');
      if (!blogsPerCategory[catKey]) blogsPerCategory[catKey] = 0;
      blogsPerCategory[catKey]++;
    });

    // Count blogs per subcategory for pagination
    const blogsPerSubcategory = {};
    blogs.forEach(blog => {
      const catKey = blog.category?.toLowerCase().replace(/\s+/g, '-');
      const subKey = blog.subcategory?.toLowerCase().replace(/\s+/g, '-');
      const key = `${catKey}/${subKey}`;
      if (!blogsPerSubcategory[key]) blogsPerSubcategory[key] = 0;
      blogsPerSubcategory[key]++;
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 1. MAIN URL (/blog)
    xml = addUrl(xml, `${baseUrl}/blog`, currentDate);

    // Build parent categories lookup
    const parentCategories = categories.filter(c => !c.parent);
    const parentSlugMap = {};
    const parentBySlug = {};
    parentCategories.forEach(cat => {
      parentSlugMap[cat._id.toString()] = cat.slug;
      parentBySlug[cat.slug] = cat;
    });

    // Get subcategories grouped by parent
    const subcategoriesByParent = {};
    categories.filter(c => c.parent).forEach(sub => {
      const parentId = sub.parent?.toString();
      if (!subcategoriesByParent[parentId]) subcategoriesByParent[parentId] = [];
      subcategoriesByParent[parentId].push(sub);
    });

    // 2. CATEGORY URLS WITH PAGINATION
    parentCategories.forEach(cat => {
      // Main category URL
      xml = addUrl(xml, `${baseUrl}/blog/${cat.slug}`, currentDate);
      
      // Category pagination pages (if more than 9 blogs)
      const blogCount = blogsPerCategory[cat.slug] || 0;
      const totalPages = Math.ceil(blogCount / 9);
      for (let page = 2; page <= totalPages; page++) {
        xml = addUrl(xml, `${baseUrl}/blog/${cat.slug}?page=${page}`, currentDate);
      }
    });

    // 3. SUBCATEGORY URLS WITH PAGINATION
    parentCategories.forEach(parent => {
      const subs = subcategoriesByParent[parent._id.toString()] || [];
      subs.forEach(sub => {
        // Main subcategory URL
        xml = addUrl(xml, `${baseUrl}/blog/${parent.slug}/${sub.slug}`, currentDate);
        
        // Subcategory pagination pages (if more than 9 blogs)
        const key = `${parent.slug}/${sub.slug}`;
        const blogCount = blogsPerSubcategory[key] || 0;
        const totalPages = Math.ceil(blogCount / 9);
        for (let page = 2; page <= totalPages; page++) {
          xml = addUrl(xml, `${baseUrl}/blog/${parent.slug}/${sub.slug}?page=${page}`, currentDate);
        }
      });
    });

    // 4. INDIVIDUAL BLOG POSTS (organized by category/subcategory)
    parentCategories.forEach(parent => {
      const subs = subcategoriesByParent[parent._id.toString()] || [];
      
      // Add posts for each subcategory
      subs.forEach(sub => {
        const key = `${parent.slug}/${sub.slug}`;
        const subBlogs = blogsBySubcategory[key] || [];
        
        subBlogs.forEach(blog => {
          const url = `${baseUrl}/blog/${parent.slug}/${sub.slug}/${blog.slug}`;
          xml = addUrl(xml, url, currentDate);
        });
      });
      
      // Add posts without subcategory (direct under category)
      const catBlogs = blogs.filter(b => {
        const bCat = b.category?.toLowerCase().replace(/\s+/g, '-');
        const bSub = b.subcategory?.toLowerCase().replace(/\s+/g, '-');
        return bCat === parent.slug && (!bSub || bSub === '');
      });
      
      catBlogs.forEach(blog => {
        const url = `${baseUrl}/blog/${parent.slug}/${blog.slug}`;
        xml = addUrl(xml, url, currentDate);
      });
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
    
    // Return minimal valid XML on error
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
