import { Suspense } from 'react';
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import BlogClient from './BlogClient';

export const revalidate = 3600; // Revalidate every hour

async function getInitialData() {
  await connectDB();
  
  // Parallel fetch for speed
  const [blogsData, categories, tags] = await Promise.all([
    Blog.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(100) // Fetch top 100 for initial pool
      .select('title slug category excerpt featuredImage readingTime views tags createdAt publishedAt')
      .populate('category')
      .lean(),
    Category.find().lean(),
    Tag.find().lean()
  ]);

  // Transform for client use (serialize ObjectIds)
  const blogs = JSON.parse(JSON.stringify(blogsData));
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedTags = JSON.parse(JSON.stringify(tags));

  return {
    blogs,
    categories: serializedCategories,
    tags: serializedTags
  };
}

export default async function BlogPage() {
  const { blogs, categories, tags } = await getInitialData();

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
