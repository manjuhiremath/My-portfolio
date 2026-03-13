import { Suspense } from 'react';
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import BlogClient from './BlogClient';

export const revalidate = 3600; // Revalidate every hour

async function getInitialData(categoryParam = null) {
  await connectDB();
  
  const blogQuery = { published: true };
  
  if (categoryParam && categoryParam !== 'all') {
    // Check if it's a valid ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryParam);
    if (isObjectId) {
      blogQuery.category = categoryParam;
    } else {
      // Find category by slug or name
      const cat = await Category.findOne({
        $or: [
          { slug: categoryParam.toLowerCase() },
          { name: { $regex: new RegExp(`^${categoryParam}$`, 'i') } }
        ]
      });
      if (cat) {
        blogQuery.category = cat._id;
      } else {
        // If category not found by slug/name, it might be a legacy string category
        blogQuery.category = categoryParam;
      }
    }
  }

  // Parallel fetch for speed
  // If a category is selected, we fetch all blogs for that category (up to 500)
  // If no category is selected, we fetch the latest 100 for the editorial view
  const limit = (categoryParam && categoryParam !== 'all') ? 500 : 100;

  const [blogsData, categories, tags] = await Promise.all([
    Blog.find(blogQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title slug category excerpt featuredImage readingTime views tags createdAt publishedAt')
      .populate('category')
      .lean(),
    Category.find().lean(),
    Tag.find().lean()
  ]);

  // Transform for client use (serialize ObjectIds and other non-plain objects)
  const serializedBlogs = JSON.parse(JSON.stringify(blogsData));
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedTags = JSON.parse(JSON.stringify(tags));

  return {
    blogs: serializedBlogs,
    categories: serializedCategories,
    tags: serializedTags
  };
}

export default async function BlogPage({ searchParams }) {
  const { category } = await searchParams;
  const { blogs, categories, tags } = await getInitialData(category);

  return (
    <Suspense fallback={<BlogPageFallback />}>
      <BlogClient 
        initialBlogs={blogs} 
        initialCategories={categories} 
        initialTags={tags} 
      />
    </Suspense>
  );
}

function BlogPageFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-orange-500" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Loading Magazine...</p>
      </div>
    </div>
  );
}
