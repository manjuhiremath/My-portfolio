import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://manjublog:KPPi783nvWfSYVXp@cluster0-shard-00-00.f639t.mongodb.net:27017,cluster0-shard-00-01.f639t.mongodb.net:27017,cluster0-shard-00-02.f639t.mongodb.net:27017/blogDB?ssl=true&replicaSet=atlas-nbs81l-shard-0&authSource=admin&retryWrites=true&w=majority';

async function migrate() {
  console.log('🔄 Starting taxonomy migration...\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');
  
  // Define schemas inline
  const categorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    color: String,
    seoTitle: String,
    seoDescription: String,
    keywords: [String],
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
  }, { timestamps: true });
  
  const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    color: { type: String, default: '#6366f1' },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
  }, { timestamps: true });
  
  const blogSchema = new mongoose.Schema({
    title: String,
    slug: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    excerpt: String,
    content: String,
    readingTime: { type: Number, default: 5 },
    featuredImage: String,
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    keywords: [String],
    seoTitle: String,
    seoDescription: String,
    faq: [{ question: String, answer: String }],
    internalLinks: [String],
    seoScore: { type: Number, default: 0 },
    sectionImages: [String],
    ogImage: String,
    published: Boolean,
    publishedAt: Date,
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }, { timestamps: true });
  
  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
  const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
  const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
  
  // Get all categories and create a map (name lowercase -> ObjectId)
  const categories = await Category.find({}).lean();
  const categoryMap = new Map();
  categories.forEach(cat => {
    categoryMap.set(cat.name.toLowerCase(), cat._id.toString());
    if (cat.slug) {
      categoryMap.set(cat.slug.toLowerCase(), cat._id.toString());
    }
  });
  console.log(`📁 Found ${categories.length} categories`);
  
  // Step 1: Get existing tags from database
  let existingTags = await Tag.find({}).lean();
  const tagMap = new Map();
  existingTags.forEach(tag => {
    tagMap.set(tag.name.toLowerCase(), tag._id.toString());
    if (tag.slug) {
      tagMap.set(tag.slug.toLowerCase(), tag._id.toString());
    }
  });
  console.log(`🏷️  Existing tags: ${existingTags.length}`);
  
  // Step 2: Collect all unique tags from existing blogs (only string tags)
  console.log('\n📝 Collecting unique tags from blogs...');
  const allBlogs = await Blog.find({}).lean();
  const uniqueTagNames = new Set();
  allBlogs.forEach(blog => {
    if (blog.tags && Array.isArray(blog.tags)) {
      blog.tags.forEach(tag => {
        if (typeof tag === 'string' && tag.trim()) {
          uniqueTagNames.add(tag.trim());
        }
      });
    }
  });
  console.log(`   Found ${uniqueTagNames.size} unique string tags in blogs`);
  
  // Step 3: Create missing tags
  let tagsCreated = 0;
  for (const tagName of uniqueTagNames) {
    if (!tagMap.has(tagName.toLowerCase())) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      // Make slug unique if needed
      let finalSlug = slug;
      let counter = 1;
      while (tagMap.has(finalSlug.toLowerCase())) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      try {
        const newTag = await Tag.create({ name: tagName, slug: finalSlug });
        tagMap.set(tagName.toLowerCase(), newTag._id.toString());
        tagMap.set(finalSlug.toLowerCase(), newTag._id.toString());
        tagsCreated++;
      } catch (e) {
        if (e.code !== 11000) {
          console.log(`   ⚠️  Error creating tag "${tagName}": ${e.message}`);
        }
      }
    }
  }
  
  // Refresh tag map
  existingTags = await Tag.find({}).lean();
  existingTags.forEach(tag => {
    tagMap.set(tag.name.toLowerCase(), tag._id.toString());
    if (tag.slug) {
      tagMap.set(tag.slug.toLowerCase(), tag._id.toString());
    }
  });
  console.log(`   Created ${tagsCreated} new tags. Total: ${existingTags.length}`);
  
  // Step 4: Update all blogs with category and tag ObjectIds
  console.log('\n🔄 Updating blogs...');
  let blogsUpdated = 0;
  let categoryUpdated = 0;
  let tagsUpdatedCount = 0;
  
  for (const blog of allBlogs) {
    const updateData = {};
    let needsUpdate = false;
    
    // Convert category string to ObjectId
    if (blog.category && typeof blog.category === 'string') {
      const categoryId = categoryMap.get(blog.category.toLowerCase());
      if (categoryId) {
        updateData.category = new mongoose.Types.ObjectId(categoryId);
        needsUpdate = true;
        categoryUpdated++;
      } else {
        console.log(`   ⚠️  Category not found: "${blog.category}" for blog "${blog.title}"`);
      }
    }
    
    // Convert tags array to ObjectIds (only for string tags)
    if (blog.tags && Array.isArray(blog.tags)) {
      const newTagIds = [];
      let tagChanged = false;
      
      for (const tag of blog.tags) {
        if (typeof tag === 'string' && tag.trim()) {
          const tagId = tagMap.get(tag.trim().toLowerCase());
          if (tagId) {
            newTagIds.push(new mongoose.Types.ObjectId(tagId));
            tagChanged = true;
          }
        } else if (typeof tag === 'object' && tag !== null && tag._id) {
          // Already an ObjectId
          newTagIds.push(tag._id);
        }
      }
      
      if (tagChanged && newTagIds.length > 0) {
        updateData.tags = newTagIds;
        needsUpdate = true;
        tagsUpdatedCount++;
      }
    }
    
    if (needsUpdate) {
      await Blog.findByIdAndUpdate(blog._id, updateData);
      blogsUpdated++;
      if (blogsUpdated <= 5) {
        console.log(`   ✅ Updated: "${blog.title.substring(0, 40)}..."`);
      }
    }
  }
  
  console.log(`   Updated ${blogsUpdated} blogs`);
  console.log(`   Categories converted: ${categoryUpdated}`);
  console.log(`   Tags converted: ${tagsUpdatedCount}`);
  
  // Verification
  console.log('\n📊 Verification:');
  const sampleBlog = await Blog.findOne({}).populate('category').populate('tags').lean();
  if (sampleBlog) {
    console.log(`   Sample: "${sampleBlog.title}"`);
    console.log(`   Category: ${sampleBlog.category ? sampleBlog.category.name : 'N/A'}`);
    console.log(`   Tags: ${(sampleBlog.tags || []).map(t => t.name).join(', ')}`);
  }
  
  // Count remaining string categories/tags
  const stringCategoryBlogs = await Blog.countDocuments({ category: { $type: 'string' } });
  const stringTagsBlogs = await Blog.countDocuments({ 'tags.0': { $type: 'string' } });
  console.log(`\n   Remaining string categories: ${stringCategoryBlogs}`);
  console.log(`   Remaining string tags: ${stringTagsBlogs}`);
  
  await mongoose.disconnect();
  console.log('\n✅ Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
