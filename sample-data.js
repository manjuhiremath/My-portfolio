// Sample data for MongoDB seeding
export const sampleCategories = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Design', slug: 'design' },
  { name: 'Business', slug: 'business' },
];

export const sampleSubcategories = [
  { name: 'AI', slug: 'ai', parent: 'CATEGORY_ID_0' },
  { name: 'Web Development', slug: 'web-development', parent: 'CATEGORY_ID_0' },
  { name: 'UI/UX', slug: 'ui-ux', parent: 'CATEGORY_ID_1' },
  { name: 'Startup', slug: 'startup', parent: 'CATEGORY_ID_2' },
];

export const sampleBlogs = [
  {
    title: 'Getting Started with Next.js 15',
    slug: 'getting-started-with-nextjs-15',
    category: 'Technology',
    subcategory: 'Web Development',
    excerpt: 'Learn how to build modern web applications with Next.js 15 and its new features.',
    content: `<h2>Introduction</h2>
    <p>Next.js 15 brings exciting new features that make building web applications even better. In this post, we'll explore the key improvements and how to get started.</p>

    <h2>What's New in Next.js 15</h2>
    <ul>
      <li>Improved App Router</li>
      <li>Better performance optimizations</li>
      <li>Enhanced developer experience</li>
      <li>New caching strategies</li>
    </ul>

    <h2>Getting Started</h2>
    <p>To create a new Next.js 15 project, run:</p>
    <pre><code>npx create-next-app@latest my-app</code></pre>

    <p>This will set up everything you need to start building with Next.js 15.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    tags: ['nextjs', 'react', 'web-development', 'javascript'],
    seoTitle: 'Getting Started with Next.js 15 - Complete Guide',
    seoDescription: 'Learn how to build modern web applications with Next.js 15 and its new features. Complete tutorial for beginners.',
    published: true,
  },
  {
    title: 'The Future of AI in Web Development',
    slug: 'future-of-ai-in-web-development',
    category: 'Technology',
    subcategory: 'AI',
    excerpt: 'Exploring how artificial intelligence is transforming the way we build and maintain web applications.',
    content: `<h2>AI's Role in Modern Development</h2>
    <p>Artificial Intelligence is revolutionizing web development in ways we couldn't have imagined just a few years ago.</p>

    <h2>Code Generation</h2>
    <p>AI-powered code generation tools are becoming increasingly sophisticated, helping developers write code faster and with fewer errors.</p>

    <h2>Automated Testing</h2>
    <p>AI can help generate comprehensive test suites and identify potential bugs before they reach production.</p>

    <h2>The Future</h2>
    <p>As AI continues to evolve, we can expect even more powerful tools that will fundamentally change how we approach web development.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    tags: ['ai', 'web-development', 'automation', 'future'],
    seoTitle: 'The Future of AI in Web Development - 2024',
    seoDescription: 'Exploring how artificial intelligence is transforming web development. Learn about AI-powered tools and future trends.',
    published: true,
  },
  {
    title: 'Mastering UI/UX Design Principles',
    slug: 'mastering-ui-ux-design-principles',
    category: 'Design',
    subcategory: 'UI/UX',
    excerpt: 'Essential principles every designer should know to create exceptional user experiences.',
    content: `<h2>Why UI/UX Matters</h2>
    <p>Good design is invisible. When users can accomplish their goals effortlessly, that's when you know you've created something special.</p>

    <h2>Key Principles</h2>
    <h3>1. User-Centered Design</h3>
    <p>Always put the user first. Understand their needs, behaviors, and pain points.</p>

    <h3>2. Consistency</h3>
    <p>Maintain visual and functional consistency throughout your application.</p>

    <h3>3. Simplicity</h3>
    <p>Remove unnecessary elements. Focus on what matters most.</p>

    <h3>4. Accessibility</h3>
    <p>Design for everyone, including users with disabilities.</p>

    <h2>Practical Tips</h2>
    <ul>
      <li>Conduct user research regularly</li>
      <li>Test your designs with real users</li>
      <li>Iterate based on feedback</li>
      <li>Stay updated with design trends</li>
    </ul>`,
    featuredImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    tags: ['ui', 'ux', 'design', 'principles', 'user-experience'],
    seoTitle: 'Mastering UI/UX Design Principles - Complete Guide',
    seoDescription: 'Essential principles every designer should know to create exceptional user experiences. Learn key concepts and practical tips.',
    published: true,
  },
  {
    title: 'Building Successful Tech Startups',
    slug: 'building-successful-tech-startups',
    category: 'Business',
    subcategory: 'Startup',
    excerpt: 'Lessons learned from building and scaling technology startups in the modern era.',
    content: `<h2>The Startup Journey</h2>
    <p>Building a successful tech startup is one of the most challenging yet rewarding experiences an entrepreneur can have.</p>

    <h2>Key Success Factors</h2>
    <h3>1. Problem-Solution Fit</h3>
    <p>Find a real problem that people are willing to pay to solve.</p>

    <h3>2. Strong Team</h3>
    <p>Assemble a team with complementary skills and shared vision.</p>

    <h3>3. Product-Market Fit</h3>
    <p>Build something people actually want and use.</p>

    <h3>4. Sustainable Business Model</h3>
    <p>Find a way to generate revenue that scales with your growth.</p>

    <h2>Common Pitfalls to Avoid</h2>
    <ul>
      <li>Raising too much money too early</li>
      <li>Scaling before achieving product-market fit</li>
      <li>Ignoring customer feedback</li>
      <li>Building features nobody wants</li>
    </ul>

    <h2>Final Thoughts</h2>
    <p>Success in startups requires persistence, adaptability, and a willingness to learn from failures. Stay focused on solving real problems for real people.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=400&fit=crop',
    tags: ['startup', 'business', 'entrepreneurship', 'tech', 'scaling'],
    seoTitle: 'Building Successful Tech Startups - Essential Guide',
    seoDescription: 'Lessons learned from building and scaling technology startups. Learn key success factors and avoid common pitfalls.',
    published: true,
  },
  {
    title: 'React Performance Optimization Techniques',
    slug: 'react-performance-optimization-techniques',
    category: 'Technology',
    subcategory: 'Web Development',
    excerpt: 'Advanced techniques to optimize React applications for better performance and user experience.',
    content: `<h2>Why Performance Matters</h2>
    <p>In today's fast-paced digital world, users expect instant loading times and smooth interactions. Performance optimization is crucial for user satisfaction and business success.</p>

    <h2>Core Optimization Techniques</h2>
    <h3>1. Code Splitting</h3>
    <p>Use dynamic imports and React.lazy() to split your code into smaller chunks that load on demand.</p>

    <h3>2. Memoization</h3>
    <p>React.memo(), useMemo(), and useCallback() help prevent unnecessary re-renders.</p>

    <h3>3. Virtual Scrolling</h3>
    <p>For large lists, only render visible items to improve performance.</p>

    <h3>4. Image Optimization</h3>
    <p>Use Next.js Image component for automatic optimization and lazy loading.</p>

    <h2>Advanced Techniques</h2>
    <ul>
      <li>Bundle analysis and tree shaking</li>
      <li>Service worker implementation</li>
      <li>Critical CSS extraction</li>
      <li>Server-side rendering optimization</li>
    </ul>

    <h2>Monitoring and Measurement</h2>
    <p>Use tools like Lighthouse, Web Vitals, and performance monitoring services to track and improve your app's performance over time.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=400&fit=crop',
    tags: ['react', 'performance', 'optimization', 'javascript', 'web-development'],
    seoTitle: 'React Performance Optimization Techniques - Advanced Guide',
    seoDescription: 'Advanced techniques to optimize React applications for better performance. Learn code splitting, memoization, and more.',
    published: true,
  },
  {
    title: 'Draft: Upcoming Design Trends for 2024',
    slug: 'upcoming-design-trends-2024',
    category: 'Design',
    subcategory: 'UI/UX',
    excerpt: 'Preview of the most exciting design trends that will shape digital experiences in 2024.',
    content: `<h2>2024 Design Landscape</h2>
    <p>As we move into 2024, several design trends are emerging that will define the visual language of digital experiences.</p>

    <h2>Key Trends</h2>
    <h3>1. AI-Enhanced Design</h3>
    <p>AI tools are becoming integral to the design process, offering new possibilities for creativity and efficiency.</p>

    <h3>2. Sustainable Design</h3>
    <p>Designers are increasingly considering environmental impact and creating more sustainable digital experiences.</p>

    <h3>3. Immersive Experiences</h3>
    <p>AR/VR and WebXR technologies are blurring the lines between digital and physical worlds.</p>

    <h3>4. Inclusive Design</h3>
    <p>Designing for accessibility and inclusivity is becoming a core principle rather than an afterthought.</p>

    <h2>Implementation Strategies</h2>
    <p>Stay ahead by experimenting with these trends while maintaining usability and accessibility standards.</p>

    <p><em>This post is still in draft mode and will be published soon.</em></p>`,
    featuredImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=400&fit=crop',
    tags: ['design', 'trends', '2024', 'ui', 'ux'],
    seoTitle: 'Upcoming Design Trends for 2024',
    seoDescription: 'Preview of the most exciting design trends that will shape digital experiences in 2024.',
    published: false,
  }
];

console.log('Sample data structure ready for manual insertion into MongoDB.');
console.log('Categories:', sampleCategories.length);
console.log('Subcategories:', sampleSubcategories.length);
console.log('Blog posts:', sampleBlogs.length);