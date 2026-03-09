import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { FiStar } from 'react-icons/fi';

export default function EditorPicks({ blogs }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-5 sm:p-6 lg:p-8 border border-slate-100 dark:border-slate-700 shadow-sm shadow-slate-100 dark:shadow-slate-900/50">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
          <FiStar className="h-4 w-4 fill-current" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase sm:text-xl">
            Editor&apos;s Picks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Handpicked articles by our team</p>
        </div>
      </div>

      {/* Picks Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {blogs.slice(0, 3).map((blog) => {
          const categorySlug = slugify(blog.category);
          const href = `/blog/${categorySlug}/${blog.slug}`;
          const imageUrl = fixUnsplashUrl(blog.featuredImage);

          return (
            <Link key={blog._id} href={href} className="group">
              <article className="space-y-3">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700 shadow-sm transition-all group-hover:shadow-md">
                  <Image
                    src={imageUrl}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    {blog.category}
                  </p>
                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 dark:text-white transition-colors group-hover:text-orange-600 sm:text-lg">
                    {blog.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
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