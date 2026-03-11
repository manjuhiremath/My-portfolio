import mongoose from 'mongoose';

/**
 * Connects to the database (reusing the existing mongodb.js logic if possible, 
 * or directly using mongoose here for robust typing).
 */
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB Tool] MONGODB_URI not found. Skipping DB connection.');
    return;
  }
  await mongoose.connect(uri);
}

export async function saveBlog(blogData: any) {
  await dbConnect();
  // Using dynamic import or mongoose.model to avoid schema conflicts
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  const blog = new Blog(blogData);
  return await blog.save();
}

export async function getAllBlogs() {
  await dbConnect();
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  return await Blog.find({});
}

export async function updateBlog(id: string, updates: any) {
  await dbConnect();
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  return await Blog.findByIdAndUpdate(id, updates, { new: true });
}

export async function getBlogBySlug(slug: string) {
  await dbConnect();
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  return await Blog.findOne({ slug });
}
