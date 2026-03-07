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
    // Create a clone to avoid affecting original headings/links extraction
    const $content = cheerio.load($.html());
    $content('script, style, noscript, nav, footer, header, aside, form, svg, iframe, menu, button').remove();
    $content('.nav, .footer, .header, .sidebar, .menu, .ad, .advertisement, .social-share, .comments').remove();
    $content('#nav, #footer, #header, #sidebar, #menu, #comments').remove();
    $content('[role="navigation"], [role="banner"], [role="contentinfo"], [aria-hidden="true"]').remove();
    
    // Specifically target common "Skip to content" links that might be anywhere
    $content('a').each((_, el) => {
      const text = $content(el).text().toLowerCase();
      if (text.includes('skip to content') || text.includes('skip to main')) {
        $content(el).remove();
      }
    });

    // Try to find the main content area first
    let textContent = '';
    const $main = $content('main, [role="main"], article, #content, .content, .main-content, .entry-content').first();
    
    if ($main.length) {
      textContent = $main.text();
    } else {
      textContent = $content('body').text();
    }
    
    // Clean up the text content
    textContent = textContent
      .replace(/Skip to content/gi, '')
      .replace(/\{"props":[\s\S]*?\}/g, '')
      .replace(/\{"resolvedServerColorMode"[\s\S]*?\}/g, '')
      .replace(/\{"should_use_dotcom_links"[\s\S]*?\}/g, '')
      .replace(/Navigation Menu Toggle navigation/gi, '')
      .replace(/Sign in|Appearance settings/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

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
