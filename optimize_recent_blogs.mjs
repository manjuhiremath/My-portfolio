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
  
  // Title (25-70) - Aim for 50
  if (blog.title.length > 70) {
    updates.title = blog.title.substring(0, 67) + '...';
  } else if (blog.title.length < 25) {
    updates.title = (blog.title + ' | The Comprehensive 2026 Strategy Guide').substring(0, 70);
  }

  // SEO Title (30-60) - Aim for 55
  let st = blog.seoTitle || blog.title;
  if (st.length > 60) {
    st = st.substring(0, 57) + '...';
  } else if (st.length < 30) {
    st = (st + ' | 2026 SEO Expert Guide').substring(0, 60);
  }
  updates.seoTitle = st;

  // SEO Description (120-170) - Aim for 155
  let sd = blog.seoDescription || blog.excerpt || '';
  if (sd.length < 120) {
    sd = (sd + ' Discover the latest trends, expert strategies, and in-depth insights to dominate your industry in 2026 with our comprehensive analysis and actionable tips.').substring(0, 170);
  } else if (sd.length > 170) {
    sd = sd.substring(0, 167) + '...';
  }
  updates.seoDescription = sd;

  // Excerpt (90-260) - Aim for 200
  let ex = blog.excerpt || blog.title;
  if (ex.length < 90) {
    ex = (ex + ' This definitive 2026 guide explores every critical aspect of the topic, providing you with the knowledge and tools needed to stay ahead of the competition.').substring(0, 260);
  } else if (ex.length > 260) {
    ex = ex.substring(0, 257) + '...';
  }
  updates.excerpt = ex;

  return updates;
}

async function main() {
  await connectDB();
  
  const blogs = await Blog.find().sort({ createdAt: -1 }).limit(40).lean();
  
  console.log(`Deep Optimizing SEO scores for ${blogs.length} recent blogs...`);
  
  for (const blog of blogs) {
    let score = calculateBlogSeoScore(blog);
    
    if (score >= 90) {
      console.log(`[PASS] ${blog.title} (Score: ${score})`);
      continue;
    }

    console.log(`[DEEP OPTIMIZING] ${blog.title} (Score: ${score})...`);
    
    let updates = optimizeMetadata(blog);
    
    const wordCount = getWordCount(blog.content);
    if (wordCount < 1200) {
      console.log(`  Expanding content significantly...`);
      const addition = await expandContentWithAI(blog.title, blog.content, blog.keywords, blog.tags);
      if (addition) {
        updates.content = blog.content + "\n\n" + addition;
      }
    }

    const updatedBlog = { ...blog, ...updates };
    const newScore = calculateBlogSeoScore(updatedBlog);
    updates.seoScore = newScore;

    await Blog.findByIdAndUpdate(blog._id, updates);
    console.log(`  ✓ Done. New Score: ${newScore} (Words: ${getWordCount(updates.content || blog.content)})`);
  }
  
  console.log('Deep SEO Optimization complete!');
  process.exit(0);
}

main().catch(console.error);
