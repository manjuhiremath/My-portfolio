import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://manjublog:KPPi783nvWfSYVXp@cluster0-shard-00-00.f639t.mongodb.net:27017,cluster0-shard-00-01.f639t.mongodb.net:27017,cluster0-shard-00-02.f639t.mongodb.net:27017/blogDB?ssl=true&replicaSet=atlas-nbs81l-shard-0&authSource=admin&retryWrites=true&w=majority';

async function check() {
  console.log('🔍 Checking database...\n');
  
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
  
  // Check data
  const categories = await Category.find({}).lean();
  console.log(`📁 Categories: ${categories.length}`);
  categories.forEach(c => console.log(`   - ${c.name} (${c._id})`));
  
  const tags = await Tag.find({}).lean();
  console.log(`\n🏷️  Tags: ${tags.length}`);
  tags.forEach(t => console.log(`   - ${t.name} (${t._id})`));
  
  const blogs = await Blog.find({}).limit(5).lean();
  console.log(`\n📝 Sample Blogs (${blogs.length} shown):`);
  for (const blog of blogs) {
    console.log(`   - "${blog.title}"`);
    console.log(`     category: ${blog.category} (type: ${typeof blog.category})`);
    console.log(`     tags: ${JSON.stringify(blog.tags)}`);
  }
  
  await mongoose.disconnect();
  process.exit(0);
}

check().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
