import Blog from './src/models/Blog.js';
import { connectDB } from './src/lib/mongodb.js';
import { calculateBlogSeoScore } from './src/lib/seo/score.js';
import mongoose from 'mongoose';

const DUPLICATE_URLS = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1481627834886-df6b4b4e2211?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1455309036637-0acbabe26c11?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
  'https://res.cloudinary.com/dmn2neefw/image/upload/v1773076519/blog-images/placeholder-thumb.webp',
  'https://res.cloudinary.com/dmn2neefw/image/upload/v1773076519/blog-images/placeholder2.webp',
  'https://res.cloudinary.com/dmn2neefw/image/upload/v1773076519/blog-images/placeholder3.webp',
  'https://res.cloudinary.com/dmn2neefw/image/upload/v1773076519/blog-images/placeholder.webp'
];

function getUniqueImageUrl(topic, index, slug) {
  const keywords = topic.split(' ').slice(0, 3).join(',').toLowerCase();
  // Using source.unsplash.com replacement (images.unsplash.com/featured)
  // adding a unique seed (slug + index) to ensure it's different for every call
  return `https://images.unsplash.com/featured/?${encodeURIComponent(keywords)}&sig=${slug}-${index}`;
}

async function run() {
  await connectDB();
  const blogs = await Blog.find({}).lean();
  console.log(`Auditing ${blogs.length} blogs for duplicate images...`);
  
  let updatedCount = 0;
  
  for (const blog of blogs) {
    let changed = false;
    let featuredImage = blog.featuredImage;
    let thumbnailImage = blog.thumbnailImage;
    let sectionImages = [...(blog.sectionImages || [])];
    let content = blog.content || '';
    
    // Check Featured
    if (DUPLICATE_URLS.some(url => featuredImage?.includes(url)) || !featuredImage) {
      featuredImage = getUniqueImageUrl(blog.title, 0, blog.slug);
      changed = true;
    }
    
    // Check Thumbnail
    if (DUPLICATE_URLS.some(url => thumbnailImage?.includes(url)) || !thumbnailImage || thumbnailImage === blog.featuredImage) {
      thumbnailImage = featuredImage; // Use same unique featured image for thumb
      changed = true;
    }
    
    // Check Section Images Array
    const newSectionImages = [];
    sectionImages.forEach((img, i) => {
      if (DUPLICATE_URLS.some(url => img?.includes(url))) {
        newSectionImages.push(getUniqueImageUrl(blog.title, i + 1, blog.slug));
        changed = true;
      } else {
        newSectionImages.push(img);
      }
    });
    
    // Check Content HTML
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
    let match;
    let imgCounter = 10; // Start high to avoid collision with array index
    let newContent = content;
    
    while ((match = imgRegex.exec(content)) !== null) {
      const imgTag = match[0];
      const src = match[1];
      
      if (DUPLICATE_URLS.some(url => src?.includes(url))) {
        const newSrc = getUniqueImageUrl(blog.title, imgCounter++, blog.slug);
        newContent = newContent.replace(src, newSrc);
        changed = true;
      }
    }
    
    if (changed) {
      const updateData = {
        featuredImage,
        thumbnailImage,
        sectionImages: newSectionImages,
        content: newContent
      };
      
      // Re-calculate SEO Score to be safe
      const tempBlog = { ...blog, ...updateData };
      updateData.seoScore = calculateBlogSeoScore(tempBlog);
      
      await Blog.updateOne({ _id: blog._id }, { $set: updateData });
      updatedCount++;
      if (updatedCount % 20 === 0) console.log(`Updated ${updatedCount} blogs...`);
    }
  }
  
  console.log(`\nFinished! Successfully replaced duplicate images in ${updatedCount} blogs.`);
  process.exit(0);
}

run().catch(console.error);
