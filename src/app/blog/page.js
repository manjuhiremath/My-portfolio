'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import BlogCard from '@/components/blog/BlogCard';

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => <div className="h-20" />,
});

function BlogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setActiveFilter(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const categoryParam = activeFilter !== 'all' ? `&category=${encodeURIComponent(activeFilter)}` : '';
        const [blogsRes, categoriesRes] = await Promise.all([
          fetch(`/api/blogs?published=true${categoryParam}`),
          fetch('/api/categories')
        ]);
        const blogsData = await blogsRes.json();
        const categoriesData = await categoriesRes.json();
        
        const blogsArray = Array.isArray(blogsData) ? blogsData : (blogsData.blogs || []);
        
        setBlogs(blogsArray);
        setFilteredBlogs(blogsArray);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeFilter]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter(blog => 
        blog.category.toLowerCase() === activeFilter.toLowerCase()
      ));
    }
  }, [activeFilter, blogs]);

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6366f1';
  };

  const topLevelCategories = categories
    .filter(cat => !cat.parent)
    .map(cat => cat.name);
  
  const categoryList = ['all', ...topLevelCategories];
  
  const featuredBlogs = blogs.slice(0, 4);

  useEffect(() => {
    if (featuredBlogs.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredBlogs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredBlogs.length]);

  const handleFilterClick = (category) => {
    setActiveFilter(category);
    const url = category === 'all' ? '/blog' : `/blog?category=${encodeURIComponent(category)}`;
    window.history.pushState({}, '', url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Carousel */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiA0NHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Text Content */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium mb-6">
                Welcome to My Blog
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Insights & Perspectives on <span className="text-orange-500">Technology</span>, Design & Business
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl">
                Explore in-depth articles, tutorials, and guides on web development, AI, design principles, and entrepreneurship.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#blogs" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
                  Browse Articles
                </a>
              </div>
            </div>

            {/* Right - Carousel */}
            <div className="relative h-80 md:h-96 lg:h-[500px]">
              {featuredBlogs.length > 0 ? (
                <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
                  <div 
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {featuredBlogs.map((blog) => {
                      const categoryColor = getCategoryColor(blog.category);
                      return (
                        <div key={blog._id} className="w-full h-full flex-shrink-0 relative">
                          <Image
                            src={blog.featuredImage || '/placeholder-image.svg'}
                            alt={blog.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                            priority={currentSlide === featuredBlogs.indexOf(blog)}
                            loading={currentSlide === featuredBlogs.indexOf(blog) ? 'eager' : 'lazy'}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <span 
                              className="px-3 py-1 rounded-full text-sm font-medium text-white"
                              style={{ backgroundColor: categoryColor }}
                            >
                              {blog.category}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                              {blog.title}
                            </h3>
                            <Link 
                              href={`/blog/${blog.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}/${blog.subcategory.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}/${blog.slug}`}
                              className="text-orange-400 font-medium hover:underline text-sm"
                            >
                              Read More →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Navigation Arrows */}
                  {featuredBlogs.length > 1 && (
                    <>
                      <button 
                        type="button"
                        onClick={() => setCurrentSlide(prev => (prev - 1 + featuredBlogs.length) % featuredBlogs.length)}
                        aria-label="Previous featured post"
                        className="absolute left-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors z-10 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCurrentSlide(prev => (prev + 1) % featuredBlogs.length)}
                        aria-label="Next featured post"
                        className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors z-10 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Dots */}
                  {featuredBlogs.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {featuredBlogs.map((_, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          aria-label={`Go to featured slide ${index + 1}`}
                          className={`h-2 rounded-full transition-all ${
                            index === currentSlide ? 'bg-orange-500 w-8' : 'bg-white/40 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center">
                  <p className="text-slate-400">No featured posts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Listing */}
      <div id="blogs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">Blog</span>
        </nav>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categoryList.map(category => (
            <button
              type="button"
              key={category}
              onClick={() => handleFilterClick(category)}
              className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all ${
                activeFilter === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-secondary hover:bg-slate-200'
              }`}
            >
              {category === 'all' ? 'All Posts' : category}
            </button>
          ))}
        </div>

        {Object.keys(filteredBlogs.reduce((acc, blog) => {
          if (!acc[blog.category]) acc[blog.category] = [];
          acc[blog.category].push(blog);
          return acc;
        }, {})).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-secondary">No blogs found for this category.</p>
          </div>
        ) : (
          Object.entries(filteredBlogs.reduce((acc, blog) => {
            if (!acc[blog.category]) acc[blog.category] = [];
            acc[blog.category].push(blog);
            return acc;
          }, {})).map(([category, categoryBlogs]) => {
            const categoryColor = getCategoryColor(category);
            return (
              <div key={category} className="mb-12">
                <h2 
                  className="text-xl font-semibold mb-6 capitalize border-l-4 pl-4"
                  style={{ borderColor: categoryColor, color: categoryColor }}
                >
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryBlogs.map(blog => (
                    <div key={blog._id}>
                      <BlogCard blog={blog} categoryColor={categoryColor} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Footer />
    </div>
  );
}

function BlogPageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-secondary">Loading...</p>
      </div>
      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogPageFallback />}>
      <BlogContent />
    </Suspense>
  );
}
