import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Setup Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

const blogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  featuredImage: String,
  thumbnailImage: String,
  sectionImages: [String],
  content: String,
}, { timestamps: true, strict: false });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

const UNSPLASH_IDS = {
  ai: ['photo-1485827404703-89b55fcc595e', 'photo-1507146426996-ef05306b995a', 'photo-1675271591211-126ad94e495d', 'photo-1531746790731-6c087fecd65a', 'photo-1550751827-4bd374c3f58b'],
  space: ['photo-1451187580459-43490279c0fa', 'photo-1614728894747-a83421e2b9c9', 'photo-1446776811953-b23d57bd21aa', 'photo-1454789548928-9efd52dc4031', 'photo-1464852045489-bccb7d17fe39'],
  energy: ['photo-1518770660439-4636190af475', 'photo-1581091226825-a6a2a5aee158', 'photo-1617791160536-598cf32026fb', 'photo-1593941707882-a5bba14938c7', 'photo-1568605117036-5fe5e7bab0b7'],
  web: ['photo-1639762681485-074b7f938ba0', 'photo-1504384308090-c894fdcc538d', 'photo-1558494949-ef010cbdcc31', 'photo-1519389950473-47ba0277781c', 'photo-1531297484001-80022131f5a1'],
  general: ['photo-1512446816042-444d641267d4', 'photo-1498050108023-c5249f4df085', 'photo-1525547719571-a2d4ac8945e2', 'photo-1517433447747-24a3666d00bc', 'photo-1510511459019-5dda7724fd87']
};

function getImagesForTopic(title, slug) {
  const t = (title + ' ' + slug).toLowerCase();
  if (t.includes('ai') || t.includes('agent') || t.includes('intelligence') || t.includes('robot')) return UNSPLASH_IDS.ai;
  if (t.includes('space') || t.includes('mars') || t.includes('nasa') || t.includes('starship')) return UNSPLASH_IDS.space;
  if (t.includes('battery') || t.includes('energy') || t.includes('power') || t.includes('grid') || t.includes('climate')) return UNSPLASH_IDS.energy;
  if (t.includes('web') || t.includes('internet') || t.includes('ecommerce') || t.includes('digital') || t.includes('crypto')) return UNSPLASH_IDS.web;
  return UNSPLASH_IDS.general;
}

async function uploadToCloudinary(id, folder, fileName) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1200`;
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: folder,
      public_id: fileName,
      resource_type: 'image',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload failed for ${id}:`, error.message);
    return null;
  }
}

async function processBlog(blog) {
  console.log(`Auditing images for ${blog.slug}...`);
  
  const sectionImagesCount = Array.isArray(blog.sectionImages) ? blog.sectionImages.length : 0;
  const needsFeatured = !blog.featuredImage || blog.featuredImage.includes('placeholder');
  const needsThumbnail = !blog.thumbnailImage || blog.thumbnailImage.includes('placeholder');
  const needsContent = sectionImagesCount < 3;

  if (!needsFeatured && !needsThumbnail && !needsContent) {
    console.log(`  [OK] Already has enough images.`);
    return;
  }

  const topicIds = getImagesForTopic(blog.title, blog.slug);
  const cloudinaryFolder = `blog-images`;
  const uploadedUrls = [];

  // Always upload at least 5 images to ensure variety
  for (let i = 0; i < topicIds.length; i++) {
    const fileName = i === 0 ? 'featured' : (i === 1 ? 'thumbnail' : `content-${i-2}`);
    const url = await uploadToCloudinary(topicIds[i], cloudinaryFolder, fileName);
    if (url) uploadedUrls.push(url);
  }

  if (uploadedUrls.length >= 2) {
    const updateData = {
      featuredImage: uploadedUrls[0],
      thumbnailImage: uploadedUrls[1],
      sectionImages: uploadedUrls.slice(2),
      updatedAt: new Date()
    };

    // Inject images into content if missing
    let updatedContent = blog.content || '';
    if (!updatedContent.includes('<img') || updatedContent.split('<img').length < 3) {
      updatedContent += `\n\n<h2>Visual Insights</h2>\n`;
      updateData.sectionImages.forEach((img, idx) => {
        const alt = `${blog.title} Analysis - ${idx + 1}`;
        updatedContent += `
<figure class="my-10 overflow-hidden rounded-2xl shadow-2xl transition-transform hover:scale-[1.02] duration-300">
  <img src="${img}" alt="${alt}" title="${alt}" loading="lazy" style="width: 100%; height: auto; border-radius: 8px;">
  <figcaption class="bg-gray-50 dark:bg-gray-900 px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400 italic">
    Insights into ${blog.title}.
  </figcaption>
</figure>`;
      });
      updateData.content = updatedContent;
    }

    await Blog.updateOne({ _id: blog._id }, { $set: updateData });
    console.log(`  [UPDATED] ${blog.slug} with ${uploadedUrls.length} images.`);
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const allBlogs = await Blog.find({});
  console.log(`Found ${allBlogs.length} blogs to check.`);

  for (const blog of allBlogs) {
    await processBlog(blog);
  }

  console.log('\nBlog image audit and optimization complete.');
  process.exit(0);
}

main();
