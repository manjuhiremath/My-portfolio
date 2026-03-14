import { 
  SkeletonBlogCard, 
  SkeletonTrendingSidebar, 
  SkeletonEditorPicks 
} from '@/components/blog/BlogSkeletons';

export default function BlogLoading() {
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
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonBlogCard variant="compact" />
                  <SkeletonBlogCard variant="compact" />
                  <SkeletonBlogCard variant="compact" />
                  <SkeletonBlogCard variant="compact" />
                </div>
              </section>

              {/* Latest Feed Skeleton */}
              <section className="space-y-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
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
