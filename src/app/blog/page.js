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
  // If a category is selected, we fetch all blogs for that category (up to 1000)
  // If no category is selected, we fetch the latest 1000 for the editorial view
  const limit = 1000;

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

import { 
  SkeletonBlogCard, 
  SkeletonTrendingSidebar, 
  SkeletonEditorPicks, 
  SkeletonCategorySection 
} from '@/components/blog/BlogSkeletons';

function BlogPageFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500">
      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 lg:px-6 lg:py-8">
        <div className="space-y-8 lg:space-y-10">
          {/* Hero Skeleton */}
          <section>
            <SkeletonBlogCard variant="featured" />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-8">
              {/* Top Stories Skeleton */}
              <section>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonBlogCard variant="compact" />
                  <SkeletonBlogCard variant="compact" />
                  <SkeletonBlogCard variant="compact" />
                  <SkeletonBlogCard variant="compact" />
                </div>
              </section>

              {/* Latest Feed Skeleton */}
              <section className="space-y-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonBlogCard key={i} />
                  ))}
                </div>
              </section>

              <section>
                <SkeletonEditorPicks />
              </section>
            </div>

            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-4">
              <SkeletonTrendingSidebar />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

