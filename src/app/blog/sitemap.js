import { MetadataRoute } from 'next';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.manjuhiremath.in';

  try {
    // Fetch all URLs from API
    const res = await fetch(`${baseUrl}/blog/api/sitemap`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error('Failed to fetch sitemap data');
    }

    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }

    // Transform to Next.js sitemap format
    return data.urls.map((item) => ({
      url: `${baseUrl}${item.url}`,
      lastModified: item.lastModified ? new Date(item.lastModified) : new Date(),
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    }));

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Return at least static pages if API fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];
  }
}
