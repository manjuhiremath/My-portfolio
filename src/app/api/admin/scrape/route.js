import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic SEO
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    // Extract headings
    const headings = {
      h1: [], h2: [], h3: [], h4: [], h5: [], h6: []
    };
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const tag = el.tagName.toLowerCase();
      headings[tag].push($(el).text().trim());
    });

    // Extract images
    const images = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        // Handle relative URLs
        let fullSrc = src;
        if (src.startsWith('/')) {
          const urlObj = new URL(url);
          fullSrc = `${urlObj.origin}${src}`;
        } else if (!src.startsWith('http')) {
           try {
             fullSrc = new URL(src, url).href;
           } catch(e) {}
        }
        images.push({
          src: fullSrc,
          alt: $(el).attr('alt') || '',
        });
      }
    });

    // Extract text content (for word count / readability)
    $('script, style, noscript, nav, footer, header').remove(); // remove non-content tags
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract links
    const links = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        links.push({
          href,
          text: $(el).text().trim()
        });
      }
    });

    return NextResponse.json({
      title,
      description,
      keywords,
      headings,
      images,
      links,
      textContent,
      html // original HTML for reference if needed
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message || 'Failed to scrape URL' }, { status: 500 });
  }
}
