export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.manjuhiremath.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog/', '/blog/*', '/about', '/contact','/privacy-policy'],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/static/',
        ],
      }
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/blog/sitemap.xml`,
    ],
    host: baseUrl,
  };
}
