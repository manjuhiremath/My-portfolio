export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.manjuhiremath.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/blog/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/blog/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
