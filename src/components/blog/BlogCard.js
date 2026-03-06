import Image from 'next/image';
import Link from 'next/link';
import { fixUnsplashUrl, slugify } from '@/lib/utils';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogCard({ blog, categoryColor = '#6366f1' }) {
  if (!blog) return null;

  const categorySlug = slugify(blog.category);
  const subcategorySlug = slugify(blog.subcategory);
  const href = subcategorySlug
    ? `/blog/${categorySlug}/${subcategorySlug}/${blog.slug}`
    : `/blog/${categorySlug}/${blog.slug}`;

  const imageUrl = fixUnsplashUrl(blog.featuredImage);

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-48">
        <Image
          src={imageUrl}
          alt={blog.title || 'Blog post'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <span
          className="absolute left-3 top-3 rounded-md px-2 py-1 text-[11px] font-medium text-white"
          style={{ backgroundColor: `${categoryColor}` }}
        >
          {blog.category || 'General'}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900 group-hover:text-orange-600">
          {blog.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
          {blog.excerpt || 'Read this article for practical insights and actionable guidance.'}
        </p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
          <span className="truncate">{blog.subcategory || 'Insights'}</span>
          <span>{formatDate(blog.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

