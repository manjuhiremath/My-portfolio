import Blog from './src/models/Blog.js';
import { connectDB } from './src/lib/mongodb.js';

async function run() {
  await connectDB();
  const blogs = await Blog.find({}).select('slug featuredImage sectionImages thumbnailImage').lean();
  
  const imageUsage = new Map();
  
  blogs.forEach(blog => {
    const images = [blog.featuredImage, blog.thumbnailImage, ...(blog.sectionImages || [])].filter(Boolean);
    images.forEach(img => {
      if (!imageUsage.has(img)) {
        imageUsage.set(img, []);
      }
      imageUsage.get(img).push(blog.slug);
    });
  });
  
  console.log("Image Duplication Audit:");
  let duplicateCount = 0;
  for (const [url, slugs] of imageUsage.entries()) {
    if (slugs.length > 1) {
      console.log(`\nURL: ${url}`);
      console.log(`Used in ${slugs.length} blogs: ${slugs.slice(0, 5).join(', ')}${slugs.length > 5 ? '...' : ''}`);
      duplicateCount++;
    }
  }
  
  console.log(`\nTotal unique images: ${imageUsage.size}`);
  console.log(`Total duplicate images (used in >1 blog): ${duplicateCount}`);
  
  process.exit(0);
}
run();
