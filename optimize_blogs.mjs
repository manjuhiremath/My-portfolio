import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const { connectDB } = await import('./src/lib/mongodb.js');
const Blog = (await import('./src/models/Blog.js')).default;
const { calculateBlogSeoScore, getWordCount } = await import('./src/lib/seo/score.js');
const { expandContentWithAI } = await import('./src/lib/seo-optimizer-helper.mjs');

function optimizeMetadata(blog) {
  const updates = {};
  
  // Title (25-70)
  if (blog.title.length > 70) {
    updates.title = blog.title.substring(0, 67) + '...';
  } else if (blog.title.length < 25) {
    updates.title = blog.title + ' - Comprehensive 2026 Guide';
  }

  // SEO Title (30-60)
  if (blog.seoTitle) {
    if (blog.seoTitle.length > 60) {
      updates.seoTitle = blog.seoTitle.substring(0, 57) + '...';
    } else if (blog.seoTitle.length < 30) {
      updates.seoTitle = blog.seoTitle + ' | 2026 SEO Strategy Guide';
    }
  } else {
    updates.seoTitle = blog.title.substring(0, 50);
  }

  // SEO Description (120-170)
  if (blog.seoDescription) {
    if (blog.seoDescription.length < 120) {
      updates.seoDescription = blog.seoDescription + ' Discover the latest trends, strategies, and insights to dominate your niche in 2026 with our expert analysis.';
    }
    if (updates.seoDescription?.length > 170 || blog.seoDescription.length > 170) {
      const desc = updates.seoDescription || blog.seoDescription;
      updates.seoDescription = desc.substring(0, 167) + '...';
    }
  } else {
    updates.seoDescription = (blog.excerpt || 'Read our latest blog post about ' + blog.title).substring(0, 160).padEnd(130, ' Detailed insights inside.');
  }

  // Excerpt (90-260)
  if (blog.excerpt) {
    if (blog.excerpt.length < 90) {
      updates.excerpt = blog.excerpt + ' This comprehensive guide explores everything you need to know about the topic, including expert tips and future trends for 2026.';
    }
  } else {
    updates.excerpt = blog.title + ' is a critical topic in 2026. This article provides an in-depth look at how it shapes the industry and what you can do to stay ahead.';
  }

  return updates;
}

async function main() {
  await connectDB();
  const blogs = await Blog.find().lean();
  
  console.log(`Optimizing SEO scores for ${blogs.length} blogs...`);
  
  for (const blog of blogs) {
    let score = calculateBlogSeoScore(blog);
    
    if (score > 90) {
      console.log(`Skipping ${blog.title} (Score: ${score})`);
      continue;
    }

    console.log(`Optimizing ${blog.title} (Current Score: ${score})...`);
    
    let updates = optimizeMetadata(blog);
    
    // Check word count
    const currentWordCount = getWordCount(blog.content);
    if (currentWordCount < 1200) {
      console.log(`Expanding content for ${blog.title} (${currentWordCount} words)...`);
      const additionalContent = await expandContentWithAI(blog.title, blog.content);
      if (additionalContent) {
        updates.content = blog.content + "\n\n" + additionalContent;
      }
    }

    // Apply updates to a temp object to re-calculate score
    const updatedBlog = { ...blog, ...updates };
    const newScore = calculateBlogSeoScore(updatedBlog);
    updates.seoScore = newScore;

    await Blog.findByIdAndUpdate(blog._id, updates);
    console.log(`Updated ${blog.title}. New Score: ${newScore}`);
  }
  
  console.log('SEO Optimization complete!');
  process.exit(0);
}

main().catch(console.error);
