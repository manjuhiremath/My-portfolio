import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';
import { FiStar } from 'react-icons/fi';

export default function EditorPicks({ blogs }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 p-8 sm:p-10 lg:p-12 border border-slate-100 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
      <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-20">
        <FiStar className="h-24 w-24 text-orange-500 rotate-12" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 mb-12 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20">
          <FiStar className="h-6 w-6 fill-current" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Curated <span className="text-orange-500">Picks</span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Handpicked article collection</p>
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
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-200 dark:bg-slate-700 shadow-sm transition-all duration-500">
                  <Image
                    src={imageUrl}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="space-y-3 px-2">
                  <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em]">
                    {categoryName}
                  </p>
                  <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-900 dark:text-white transition-colors">
                    {blog.title}
                  </h3>
                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
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