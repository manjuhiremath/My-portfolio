import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const categoryMap = {
  'Technology': '69a7dc3c764bc9d9218768ee',
  'Business': '69a7dc3c764bc9d9218768f0',
  'Design': '69a7dc3c764bc9d9218768ef',
  'Science': '69a7dc3c764bc9d9218768f2',
  'Personal Development': '69a7dc3c764bc9d9218768f1',
  'Cloud Computing': '69a7dc3c764bc9d9218768f7',
  'Marketing': '69a7dc3c764bc9d9218768fc',
  'Mobile Development': '69a7dc3c764bc9d9218768f6',
  'AI': '69a7dc3c764bc9d9218768f4',
  'Space': '69a7dc3c764bc9d921876900',
  'Web Development': '69a7dc3c764bc9d9218768f5',
  'UI/UX': '69a7dc3c764bc9d9218768f8',
  'Habits': '69a7dc3c764bc9d9218768ff',
  'Leadership': '69a7dc3c764bc9d9218768fd',
  'Innovation': '69a7dc3c764bc9d921876901',
  'Graphic Design': '69a7dc3c764bc9d9218768f9',
  'Startup': '69a7dc3c764bc9d9218768fb',
  'Motion Design': '69a7dc3c764bc9d9218768fa',
  'Productivity': '69a7dc3c764bc9d9218768fe',
  'Mobile Devices': '69a7ec5a61fb7f14c8833e20',
  'Politics': '69a7f2e461fb7f14c8833e4c',
  'Congress': '69a7f30061fb7f14c8833e4f',
  'Development Tools': '69a80dca132b2e6d14e529b5',
  'IoT Development': '69a80dcc132b2e6d14e529ba',
  'Software Development': '69a82139132b2e6d14e52a42',
  'Sports': '69a82d778326b1c87e571b04',
  'Grassroots Development & CSR': '69a82d788326b1c87e571b09',
  'Grassroots Sports Programs': '69a82fdd8326b1c87e571b26',
  'Content': '69a831a08326b1c87e571b2f',
  'Website': '69a832a38326b1c87e571b3e',
  'Software': '69a83e0b8326b1c87e571b60'
};

const categoryKeywords = {
  'Technology': ['technology', 'tech', 'apple', 'macbook', 'iphone', 'software', 'computer', 'laptop', 'ai', 'artificial intelligence', 'smartphone', 'gadget', 'device', 'digital', 'programming', 'coding', 'app', 'ios', 'android', 'windows', 'chip', 'processor', 'hardware', 'robotics', 'automation', 'cyber', 'tech', 'device', 'electronic'],
  'Business': ['business', 'entrepreneur', 'startup', 'company', 'marketing', 'sales', 'revenue', 'investment', 'finance', 'money', 'profit', 'growth', 'strategy', 'management', 'leadership', 'success', 'career', 'job', 'work', 'office', 'corporate', 'enterprise', 'brand', 'industry', 'market'],
  'Design': ['design', 'ui', 'ux', 'user interface', 'user experience', 'graphic', 'visual', 'art', 'creative', 'aesthetic', 'color', 'font', 'layout', 'web design', 'app design', 'product design', 'figma', 'photoshop', 'illustration', 'motion', 'animation'],
  'Science': ['science', 'research', 'study', 'discovery', 'space', 'nasa', 'astronomy', 'physics', 'biology', 'chemistry', 'medical', 'health', 'medicine', 'climate', 'environment', 'energy', 'earth', 'planet', 'universe', 'scientist', 'quantum'],
  'Personal Development': ['personal', 'development', 'growth', 'habit', 'mindset', 'motivation', 'success', 'life', 'self', 'improvement', 'learning', 'productivity', 'goals', 'achievement'],
  'Marketing': ['marketing', 'seo', 'content', 'social media', 'brand', 'advertising', 'digital marketing', 'campaign', 'audience', 'engagement', 'conversion'],
  'AI': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural', 'chatgpt', 'gpt', 'openai', 'model', 'algorithm', 'automation', 'intelligence'],
  'Web Development': ['web', 'website', 'javascript', 'react', 'nextjs', 'html', 'css', 'frontend', 'backend', 'fullstack', 'api', 'node', 'database'],
  'Mobile Development': ['mobile', 'ios', 'android', 'app', 'swift', 'kotlin', 'react native', 'flutter', 'mobile app', 'smartphone'],
  'Space': ['space', 'nasa', 'astronaut', 'mars', 'moon', 'satellite', 'rocket', 'spacecraft', 'orbit', 'astronomy', 'telescope', 'galaxy'],
  'Startup': ['startup', 'founder', 'venture', 'funding', 'pitch', 'bootstrapped', 'scale', 'launch', 'entrepreneur'],
  'Leadership': ['leadership', 'leader', 'team', 'management', 'vision', 'strategy', 'executive', 'ceo', 'coach', 'mentor'],
  'Productivity': ['productivity', 'efficient', 'time management', 'workflow', 'tool', 'software', 'automation', 'optimize', 'workflow'],
  'Politics': ['politics', 'political', 'government', 'election', 'vote', 'party', 'congress', 'minister', 'policy', 'governance', 'rahul gandhi', 'bjp', 'pm'],
  'Sports': ['sport', 'game', 'match', 'player', 'team', 'tournament', 'championship', 'score', 'athletic', 'fitness']
};

const categoryTags = {
  'Technology': ['Tech', 'Innovation', 'Gadgets', 'Computing', 'Software', 'Hardware', 'AI', 'Smartphones', 'Apple', 'Digital'],
  'Business': ['Business', 'Entrepreneurship', 'Marketing', 'Finance', 'Startup', 'Career', 'Leadership', 'Success', 'Growth', 'Strategy'],
  'Design': ['Design', 'UI/UX', 'Creative', 'Graphics', 'Visual', 'Aesthetics', 'Web Design', 'Product Design', 'Art', 'Digital Design'],
  'Science': ['Science', 'Research', 'Space', 'Technology', 'Innovation', 'Discovery', 'Health', 'Environment', 'Physics', 'Biology'],
  'Personal Development': ['Personal Growth', 'Habits', 'Mindset', 'Motivation', 'Self Improvement', 'Success', 'Learning', 'Productivity', 'Goals', 'Life'],
  'Marketing': ['Marketing', 'SEO', 'Digital Marketing', 'Content Strategy', 'Social Media', 'Brand', 'Advertising', 'Growth', 'Analytics', 'ROI'],
  'AI': ['AI', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Automation', 'Technology', 'Innovation', 'Neural Networks', 'Data Science', 'Future'],
  'Web Development': ['Web Development', 'JavaScript', 'React', 'Next.js', 'Frontend', 'Backend', 'Full Stack', 'Programming', 'Coding', 'Software'],
  'Mobile Development': ['Mobile', 'iOS', 'Android', 'Apps', 'Swift', 'Kotlin', 'React Native', 'Flutter', 'Mobile Tech', 'Smartphones'],
  'Space': ['Space', 'NASA', 'Astronomy', 'Mars', 'Rocket', 'Science', 'Technology', 'Exploration', 'Universe', 'Innovation'],
  'Startup': ['Startup', 'Entrepreneurship', 'Business', 'Innovation', 'Funding', 'Founder', 'Growth', 'Venture Capital', 'Launch', 'Strategy'],
  'Leadership': ['Leadership', 'Management', 'Strategy', 'Team Building', 'Vision', 'Executive', 'Success', 'Career', 'Business', 'Mentorship'],
  'Productivity': ['Productivity', 'Efficiency', 'Time Management', 'Tools', 'Workflow', 'Automation', 'Optimization', 'Success', 'Growth', ' Habits'],
  'Politics': ['Politics', 'Government', 'Policy', 'Election', 'India', 'Congress', 'BJP', 'Leadership', 'Current Affairs', 'News'],
  'Sports': ['Sports', 'Games', 'Athletics', 'Fitness', 'Competition', 'Tournament', 'Player', 'Team', 'Championship', 'Performance']
};

function detectCategory(title, content, keywords) {
  const text = `${title} ${content} ${keywords?.join(' ') || ''}`.toLowerCase();
  
  let bestCategory = 'Technology';
  let bestScore = 0;
  
  for (const [category, words] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const word of words) {
      if (text.includes(word.toLowerCase())) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

async function addCategoriesAndTags() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    const blogs = await db.collection('blogs').find({}).toArray();
    console.log(`Found ${blogs.length} blogs`);

    let categoryUpdated = 0;
    let tagsUpdated = 0;

    for (const blog of blogs) {
      const updates = {};
      
      let currentCategoryName = blog.category;
      if (typeof blog.category === 'string' && categoryMap[blog.category]) {
        currentCategoryName = blog.category;
      } else if (typeof blog.category === 'string' && !categoryMap[blog.category]) {
        const detected = detectCategory(blog.title, blog.content, blog.keywords);
        currentCategoryName = detected;
      } else if (typeof blog.category === 'object' && blog.category !== null) {
        const catId = blog.category.toString();
        const found = Object.entries(categoryMap).find(([_, id]) => id === catId);
        if (found) currentCategoryName = found[0];
        else {
          const detected = detectCategory(blog.title, blog.content, blog.keywords);
          currentCategoryName = detected;
        }
      } else {
        const detected = detectCategory(blog.title, blog.content, blog.keywords);
        currentCategoryName = detected;
      }
      
      const categoryId = categoryMap[currentCategoryName];
      if (categoryId) {
        updates.category = new mongoose.Types.ObjectId(categoryId);
        categoryUpdated++;
      }
      
      if (!blog.tags || blog.tags.length === 0) {
        const tags = categoryTags[currentCategoryName] || ['Technology', 'Tech', 'Innovation'];
        const tagIds = await db.collection('tags').find({ name: { $in: tags } }).project({ _id: 1 }).toArray();
        
        if (tagIds.length > 0) {
          updates.tags = tagIds.map(t => t._id);
          tagsUpdated++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('blogs').updateOne(
          { _id: blog._id },
          { $set: updates }
        );
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total blogs: ${blogs.length}`);
    console.log(`Categories updated: ${categoryUpdated}`);
    console.log(`Tags added: ${tagsUpdated}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addCategoriesAndTags();
