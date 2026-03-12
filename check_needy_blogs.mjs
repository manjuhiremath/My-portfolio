import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Blog = mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  
  const allBlogs = await Blog.find({});
  const needyBlogs = allBlogs.filter(b => {
    const sectionImagesCount = Array.isArray(b.sectionImages) ? b.sectionImages.length : 0;
    if (sectionImagesCount < 3) return true;
    if (!b.featuredImage || b.featuredImage.includes('placeholder')) return true;
    if (!b.thumbnailImage || b.thumbnailImage.includes('placeholder')) return true;
    return false;
  });

  console.log('Total blogs:', await Blog.countDocuments());
  console.log('Blogs needing images:', needyBlogs.length);
  if (needyBlogs.length > 0) {
    console.log('First 5 needy blogs:', needyBlogs.slice(0, 5).map(b => b.slug));
  }
  process.exit(0);
}

main();
