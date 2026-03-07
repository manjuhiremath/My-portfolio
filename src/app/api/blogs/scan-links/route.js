import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

/**
 * POST /api/blogs/scan-links
 *
 * Scan all published blog content for internal /blog/ links.
 * Check if referenced blogs exist. If not, create draft blog entries.
 *
 * Issues 6 & 12: Automatically create draft blogs for missing internal links.
 */
export async function POST() {
  try {
    await connectDB();

    const blogs = await Blog.find({ published: true }).lean();
    const existingSlugs = new Set(blogs.map(b => b.slug));

    const internalLinkRegex = /(?:href=["']|]\()\/blog\/[^"'\s)]+/gi;
    const missingLinks = [];
    const createdDrafts = [];

    for (const blog of blogs) {
      const content = blog.content || '';
      const matches = content.match(internalLinkRegex) || [];

      for (const match of matches) {
        // Extract the path from href="..." or ](...)
        const path = match
          .replace(/^href=["']/, '')
          .replace(/^\]\(/, '')
          .replace(/["')]$/, '');

        // Extract the slug (last segment of URL path)
        const segments = path.replace(/^\/blog\//, '').split('/').filter(Boolean);
        const slug = segments[segments.length - 1];

        if (!slug || existingSlugs.has(slug)) continue;

        // Check if we already logged this
        if (missingLinks.includes(slug)) continue;
        missingLinks.push(slug);

        // Create a draft blog for this missing slug
        const title = slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        const existing = await Blog.findOne({ slug }).lean();
        if (existing) {
          existingSlugs.add(slug);
          continue;
        }

        await Blog.create({
          title,
          slug,
          category: blog.category || 'General',
          excerpt: `Draft article for "${title}".`,
          content: `<p>This is a draft article for "${title}". Content coming soon.</p>`,
          tags: blog.tags?.slice(0, 3) || [],
          published: false,
          seoTitle: title,
          seoDescription: `Learn about ${title.toLowerCase()} in this upcoming article.`,
        });

        existingSlugs.add(slug);
        createdDrafts.push({ slug, title, referencedIn: blog.slug });
      }
    }

    return Response.json({
      success: true,
      scannedBlogs: blogs.length,
      missingLinks,
      createdDrafts,
      message: `Scanned ${blogs.length} blogs. Found ${missingLinks.length} missing internal links. Created ${createdDrafts.length} draft entries.`,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
