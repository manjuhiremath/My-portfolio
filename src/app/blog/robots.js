export default function robots() {
  const baseUrl = 'https://www.manjuhiremath.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog/', '/blog/*'],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
        ],
      }
    ],
    sitemap: `${baseUrl}/blog/sitemap.xml`,
    host: baseUrl,
  };
}
