import { 
  SkeletonBlogCard, 
  SkeletonTrendingSidebar 
} from '@/components/blog/BlogSkeletons';

export default function TagLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500">
      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 lg:px-6 lg:py-8">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4 space-y-2">
            <div className="h-3 w-16 bg-orange-100 dark:bg-orange-900/20 rounded"></div>
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonBlogCard key={i} />
                ))}
              </div>
            </div>
            <aside className="lg:col-span-4">
              <SkeletonTrendingSidebar />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
