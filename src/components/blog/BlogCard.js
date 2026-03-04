import Image from 'next/image';
import Link from 'next/link';

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogCard({ blog, categoryColor = '#6366f1' }) {
  if (!blog) return null;

  return (
    <Link
      href={`/blog/${slugify(blog.category)}/${slugify(blog.subcategory)}/${blog.slug}`}
      className="feature-card group cursor-pointer block border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white"
    >
      <div className="image-container relative h-48 overflow-hidden">
        <Image
          src={blog.featuredImage || '/placeholder-image.svg'}
          alt={blog.title || 'Blog Post'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-3 left-3">
          <span 
            className="category-tag px-2 py-1 rounded-md text-xs font-medium"
            style={{ 
              backgroundColor: `${categoryColor}15`,
              color: categoryColor,
              border: `1px solid ${categoryColor}30`
            }}
          >
            {blog.category}
          </span>
        </div>
      </div>

      <div className="content p-5 flex flex-col h-full">
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-secondary text-sm line-clamp-2 mb-4 flex-grow">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-secondary mt-3 pt-2 border-t border-gray-100">
          <span>{blog.subcategory}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </Link>
  );
}
