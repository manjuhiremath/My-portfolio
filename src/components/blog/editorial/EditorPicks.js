import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { FiStar } from 'react-icons/fi';

import { SkeletonEditorPicks } from '../BlogSkeletons';

export default function EditorPicks({ blogs, loading = false }) {
  if (loading) return <SkeletonEditorPicks />;
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800/30 p-8 sm:p-10 lg:p-12 border border-gray-300 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
      <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-20">
        <FiStar className="h-24 w-24 text-orange-500 rotate-12" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 mb-12 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white shadow-xl shadow-orange-500/20">
          <FiStar className="h-6 w-6 fill-current" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase font-display">
            Curated <span className="text-orange-500">Picks</span>
          </h2>
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-700 uppercase tracking-[0.3em]">Handpicked article collection</p>
        </div>
      </div>

      {/* Picks Grid */}
      <div className="relative z-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.slice(0, 3).map((blog) => {
          const categoryName = blog.category?.name || blog.category;
          const categorySlug = slugify(categoryName);
          const href = `/blog/${categorySlug}/${blog.slug}`;
          const imageUrl = fixUnsplashUrl(blog.featuredImage);

          return (
            <Link key={blog._id} href={href} className="group">
              <article className="space-y-5">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm transition-all group-hover:shadow-md">
                  <img
                    src={imageUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="space-y-3 px-2">
                  <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em]">
                    {categoryName}
                  </p>
                  <h3 className="line-clamp-2 text-sm font-black leading-snug text-gray-900 dark:text-white transition-colors font-display">
                    {blog.title}
                  </h3>
                  <p className="line-clamp-2 text-[11px] text-gray-700 dark:text-gray-400 font-medium leading-relaxed">
                    {blog.excerpt || 'Discover expert insights in this handpicked article.'}
                  </p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
