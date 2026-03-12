import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Blog from './src/models/Blog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function countBlogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    const count = await Blog.countDocuments();
    const blogs = await Blog.find({}, 'slug title');
    console.log(`Total blogs: ${count}`);
    console.log('Blogs:', JSON.stringify(blogs, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

countBlogs();
