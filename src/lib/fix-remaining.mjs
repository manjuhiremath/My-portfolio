import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://manjublog:KPPi783nvWfSYVXp@cluster0-shard-00-00.f639t.mongodb.net:27017,cluster0-shard-00-01.f639t.mongodb.net:27017,cluster0-shard-00-02.f639t.mongodb.net:27017/blogDB?ssl=true&replicaSet=atlas-nbs81l-shard-0&authSource=admin&retryWrites=true&w=majority';

async function fixRemaining() {
  console.log('🔄 Fixing remaining blogs with string category IDs...\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');
  
  // Define schemas inline
  const categorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    color: String
  }, { timestamps: true });
  
  const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    color: { type: String, default: '#6366f1' }
  }, { timestamps: true });
  
  const blogSchema = new mongoose.Schema({
    title: String,
    slug: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
  }, { timestamps: true });
  
  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
  const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
  const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
  
  // Get all categories
  const categories = await Category.find({}).lean();
  const categoryMap = new Map();
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), cat._id.toString());
  });
  console.log(`📁 Found ${categories.length} categories`);
  
  // Find all blogs
  const allBlogs = await Blog.find({}).lean();
  console.log(`📝 Found ${allBlogs.length} blogs`);
  
  let updated = 0;
  for (const blog of allBlogs) {
    const updates = {};
    let needsUpdate = false;
    
    // Check category
    if (blog.category) {
      if (typeof blog.category === 'string') {
        // It's a string - check if it's a valid ObjectId that exists
        if (blog.category.length === 24 && categoryMap.has(blog.category)) {
          updates.category = new mongoose.Types.ObjectId(blog.category);
          needsUpdate = true;
          console.log(`   ✅ "${blog.title.substring(0, 40)}..." - category converted`);
        } else {
          // Try to find category by name
          const cat = await Category.findOne({ 
            $or: [
              { name: { $regex: new RegExp(`^${blog.category}$`, 'i') } },
              { slug: { $regex: new RegExp(`^${blog.category}$`, 'i') } }
            ]
          }).lean();
          
          if (cat) {
            updates.category = cat._id;
            needsUpdate = true;
            console.log(`   ✅ "${blog.title.substring(0, 40)}..." - found category: ${cat.name}`);
          } else {
            console.log(`   ❌ "${blog.title.substring(0, 40)}..." - category not found: ${blog.category}`);
          }
        }
      }
    }
    
    // Check tags - convert any string tags to ObjectIds
    if (blog.tags && Array.isArray(blog.tags)) {
      const newTagIds = [];
      let changed = false;
      
      for (const tag of blog.tags) {
        if (typeof tag === 'string') {
          // It's a string - check if it's a valid ObjectId or try to find by name
          if (tag.length === 24 && /^[0-9a-fA-F]{24}$/.test(tag)) {
            newTagIds.push(new mongoose.Types.ObjectId(tag));
            changed = true;
          } else {
            // Try to find tag by name
            const t = await Tag.findOne({ 
              $or: [
                { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
                { slug: { $regex: new RegExp(`^${tag}$`, 'i') } }
              ]
            }).lean();
            
            if (t) {
              newTagIds.push(t._id);
              changed = true;
            }
          }
        } else if (typeof tag === 'object' && tag !== null && tag._id) {
          newTagIds.push(tag._id);
        }
      }
      
      if (changed) {
        updates.tags = newTagIds;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      await Blog.findByIdAndUpdate(blog._id, updates);
      updated++;
    }
  }
  
  // Final verification
  const stringCategoryBlogs = await Blog.countDocuments({ category: { $type: 'string' } });
  console.log(`\n📊 Remaining string categories: ${stringCategoryBlogs}`);
  
  // Show sample
  const sampleBlog = await Blog.findOne({}).populate('category').populate('tags').lean();
  if (sampleBlog) {
    console.log(`\n   Sample: "${sampleBlog.title}"`);
    console.log(`   Category: ${sampleBlog.category ? sampleBlog.category.name : 'N/A'}`);
    console.log(`   Tags: ${(sampleBlog.tags || []).map(t => t.name).join(', ')}`);
  }
  
  await mongoose.disconnect();
  console.log(`\n✅ Updated ${updated} blogs!`);
  process.exit(0);
}

fixRemaining().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
