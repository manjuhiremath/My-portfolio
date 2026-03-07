import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://manjublog:KPPi783nvWfSYVXp@cluster0-shard-00-00.f639t.mongodb.net:27017,cluster0-shard-00-01.f639t.mongodb.net:27017,cluster0-shard-00-02.f639t.mongodb.net:27017/blogDB?ssl=true&replicaSet=atlas-nbs81l-shard-0&authSource=admin&retryWrites=true&w=majority';

async function checkRemaining() {
  console.log('🔍 Checking remaining issues...\n');
  
  await mongoose.connect(MONGODB_URI);
  
  const categorySchema = new mongoose.Schema({ name: String, slug: String }, { timestamps: true });
  const tagSchema = new mongoose.Schema({ name: String, slug: String }, { timestamps: true });
  const blogSchema = new mongoose.Schema({ 
    title: String, 
    slug: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
  }, { timestamps: true });
  
  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
  const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
  const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
  
  // Find blogs with string categories
  const blogsWithStringCategory = await Blog.find({ category: { $type: 'string' } }).lean();
  console.log(`Blogs with string categories: ${blogsWithStringCategory.length}`);
  for (const b of blogsWithStringCategory) {
    console.log(`  - "${b.title}": category = "${b.category}"`);
  }
  
  // Find blogs with string tags
  const blogsWithStringTags = await Blog.find({ 
    $expr: { $anyElementTrue: { $map: { input: '$tags', as: 't', in: { $eq: [{ $type: '$$t' }, 'string'] } } } }
  }).lean();
  console.log(`\nBlogs with string tags: ${blogsWithStringTags.length}`);
  for (const b of blogsWithStringTags) {
    console.log(`  - "${b.title}": tags = ${JSON.stringify(b.tags)}`);
  }
  
  await mongoose.disconnect();
  process.exit(0);
}

checkRemaining().catch(err => { console.error(err); process.exit(1); });
