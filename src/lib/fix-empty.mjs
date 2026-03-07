import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://manjublog:KPPi783nvWfSYVXp@cluster0-shard-00-00.f639t.mongodb.net:27017,cluster0-shard-00-01.f639t.mongodb.net:27017,cluster0-shard-00-02.f639t.mongodb.net:27017/blogDB?ssl=true&replicaSet=atlas-nbs81l-shard-0&authSource=admin&retryWrites=true&w=majority';

async function fixEmptyCategories() {
  console.log('🔄 Fixing blogs with empty categories...\n');
  
  await mongoose.connect(MONGODB_URI);
  
  const categorySchema = new mongoose.Schema({ name: String, slug: String }, { timestamps: true });
  const blogSchema = new mongoose.Schema({ 
    title: String, 
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
  }, { timestamps: true });
  
  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
  const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
  
  // Find a default category
  const defaultCategory = await Category.findOne({ name: 'Technology' }).lean();
  console.log(`Default category: ${defaultCategory.name} (${defaultCategory._id})`);
  
  // Find blogs with empty string categories using raw MongoDB
  const result = await mongoose.connection.db.collection('blogs').updateMany(
    { category: '' },
    { $set: { category: defaultCategory._id } }
  );
  
  console.log(`\nUpdated ${result.modifiedCount} blogs with empty category to "${defaultCategory.name}"`);
  
  // Verify
  const remaining = await Blog.countDocuments({ category: { $type: 'string' } });
  console.log(`Remaining string categories: ${remaining}`);
  
  await mongoose.disconnect();
  console.log('\n✅ Done!');
  process.exit(0);
}

fixEmptyCategories().catch(err => { console.error(err); process.exit(1); });
