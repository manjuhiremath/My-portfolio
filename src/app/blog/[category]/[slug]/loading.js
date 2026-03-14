import { SkeletonPostContent } from '@/components/blog/BlogSkeletons';

export default function PostLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500">
      <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12">
        <SkeletonPostContent />
      </main>
    </div>
  );
}
