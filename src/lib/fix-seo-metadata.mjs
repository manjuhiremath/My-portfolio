import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

function stripHtml(input = '') {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getWordCount(input = '') {
  return stripHtml(input).split(/\s+/).filter(Boolean).length;
}

function hasInRange(length, min, max) { return length >= min && length <= max; }

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len - 3) + '...' : str;
}

function generateSeoMetadata(blog) {
  const title = blog.title || '';
  const content = blog.content || '';
  const words = getWordCount(content);
  
  let seoTitle = blog.seoTitle || '';
  let seoDescription = blog.seoDescription || blog.excerpt || '';
  let excerpt = blog.excerpt || '';
  
  const needsTitleFix = !hasInRange(seoTitle.length, 30, 60);
  const needsDescFix = !hasInRange(seoDescription.length, 120, 170);
  const needsExcerptFix = !hasInRange(excerpt.length, 90, 260);
  
  const updates = {};
  
  if (needsTitleFix && title) {
    let newTitle = title;
    if (title.length > 60) {
      newTitle = title.substring(0, 55) + ' - Complete Guide';
    }
    if (!hasInRange(newTitle.length, 30, 60)) {
      newTitle = newTitle + ' 2026';
    }
    updates.seoTitle = truncate(newTitle, 60);
  }
  
  if (needsDescFix && title) {
    const baseDesc = words > 800 
      ? `Learn everything about ${title.toLowerCase()}. Comprehensive guide with practical tips, expert insights, and detailed analysis.`
      : `Discover ${title.toLowerCase()}. Expert guide covering key concepts, best practices, and strategies for success.`;
    updates.seoDescription = truncate(baseDesc, 170);
  }
  
  if (needsExcerptFix && title) {
    const newExcerpt = `Explore our comprehensive guide on ${title.toLowerCase()}. Detailed insights, practical tips, and expert analysis to help you succeed.`;
    updates.excerpt = truncate(newExcerpt, 260);
  }
  
  return updates;
}

async function fixSeoMetadata() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const blogs = await db.collection('blogs').find({}).toArray();
    
    let fixed = 0;
    for (const blog of blogs) {
      const updates = generateSeoMetadata(blog);
      if (Object.keys(updates).length > 0) {
        await db.collection('blogs').updateOne(
          { _id: blog._id },
          { $set: updates }
        );
        fixed++;
        console.log(`Fixed: ${blog.slug} -> ${JSON.stringify(updates)}`);
      }
    }

    console.log(`\nTotal blogs fixed: ${fixed}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixSeoMetadata();
