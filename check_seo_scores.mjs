import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const { connectDB } = await import('./src/lib/mongodb.js');
const Blog = (await import('./src/models/Blog.js')).default;
const { calculateBlogSeoScore, getWordCount } = await import('./src/lib/seo/score.js');

async function main() {
  await connectDB();
  const blogs = await Blog.find().lean();
  
  console.log(`Checking SEO scores for ${blogs.length} blogs...`);
  
  const lowScores = [];
  
  for (const blog of blogs) {
    const score = calculateBlogSeoScore(blog);
    if (score <= 90) {
      lowScores.push({
        id: blog._id,
        title: blog.title,
        score,
        wordCount: getWordCount(blog.content),
        details: {
          titleLen: blog.title?.length,
          seoTitleLen: blog.seoTitle?.length,
          seoDescLen: blog.seoDescription?.length,
          excerptLen: blog.excerpt?.length,
        }
      });
    }
  }
  
  console.log(`Found ${lowScores.length} blogs with score <= 90.`);
  if (lowScores.length > 0) {
    console.table(lowScores.map(b => ({
      Title: b.title.substring(0, 40),
      Score: b.score,
      Words: b.wordCount,
      T_Len: b.details.titleLen,
      ST_Len: b.details.seoTitleLen,
      SD_Len: b.details.seoDescLen,
      E_Len: b.details.excerptLen
    })));
  }
  
  process.exit(0);
}

main().catch(console.error);
