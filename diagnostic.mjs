import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Blog from './src/models/Blog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Blog.countDocuments();
  console.log('Total blogs:', count);
  process.exit(0);
}

run();
