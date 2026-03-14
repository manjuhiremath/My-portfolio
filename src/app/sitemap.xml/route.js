export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.manjuhiremath.in';
  const currentDate = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // 1. Static Pages (Home, Blog, About, Contact, Privacy)
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/sitemap-pages.xml</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '  </sitemap>\n';

  // 2. Point to the Blog Sitemap Index (which handles all categories)
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/blog/sitemap.xml</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '  </sitemap>\n';

  // 2. Add individual sitemaps for other sections if needed, 
  // or just point to the main blog one if that's the primary content.
  
  xml += '</sitemapindex>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
