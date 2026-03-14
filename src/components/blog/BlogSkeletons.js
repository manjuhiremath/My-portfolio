'use client';

/**
 * Modern Editorial Skeletons for Blog Components
 */

export function SkeletonBlogCard({ variant = 'default' }) {
  if (variant === 'featured') {
    return (
      <div className="relative h-[320px] sm:h-[400px] lg:h-[480px] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-gray-200 dark:border-gray-700/50">
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8 space-y-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-gray-200/20 dark:border-gray-700/20">
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex gap-3 items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 animate-pulse">
        <div className="w-14 h-14 sm:w-20 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/30 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] sm:aspect-[4/3] bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-3 sm:p-4 lg:p-5 space-y-3">
        <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-2 py-2">
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
        <div className="pt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlogCardSmall() {
  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/30 overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-2 sm:p-3 space-y-2">
        <div className="h-3.5 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3.5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="pt-1.5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          <div className="h-2 w-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div className="h-2 w-8 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTrendingSidebar() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-xl p-5 border border-gray-100 dark:border-gray-800/50 space-y-4">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-6 w-4 bg-gray-200 dark:bg-gray-700 rounded shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-2.5 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-5 bg-gray-900 border border-gray-800 space-y-4">
        <div className="h-4 w-24 bg-gray-800 rounded mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-2 w-16 bg-gray-800 rounded"></div>
            <div className="h-3.5 w-full bg-gray-800 rounded"></div>
            <div className="h-2 w-12 bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonEditorPicks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCategorySection() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
          <SkeletonBlogCard variant="featured" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:col-span-1 xl:col-span-1">
          <SkeletonBlogCardSmall />
          <SkeletonBlogCardSmall />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:col-span-1 xl:col-span-1">
          <SkeletonBlogCardSmall />
          <SkeletonBlogCardSmall />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPostContent() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Hero area */}
      <div className="space-y-4">
        <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
        <div className="aspect-[21/9] w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
      
      {/* Body text */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block lg:col-span-4 space-y-8">
          <div className="h-64 w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl"></div>
          <div className="h-96 w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
