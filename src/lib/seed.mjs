import dotenv from 'dotenv'
dotenv.config({ path: './.env.local' })

const { connectDB } = await import("./mongodb.js")
const Blog = (await import("../models/Blog.js")).default

async function seed(){

 await connectDB()

 const blogs = [

  {

   title: "Getting Started with Next.js 15",

   slug: "getting-started-nextjs-15",

   category: "tech",

   subcategory: "web-development",

   excerpt: "Learn how to build modern web applications with Next.js 15 and its new features.",

   content: "<h2>Introduction</h2><p>Next.js 15 brings exciting new features including improved performance, better developer experience, and more.</p><h>Key Features</h2><ul><li>App2 Router improvements</li><li>Turbopack for faster builds</li><li>Enhanced server components</li></ul>",

   featuredImage: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=400",

   tags: ["Next.js", "React", "Web Development"],

   seoTitle: "Getting Started with Next.js 15 - Complete Guide",

   seoDescription: "Learn how to build modern web applications with Next.js 15",

   published: true

  },

  {

   title: "The Future of AI in 2026",

   slug: "future-of-ai-2026",

   category: "tech",

   subcategory: "ai",

   excerpt: "Exploring how artificial intelligence will transform industries in the coming year.",

   content: "<h2>AI Revolution</h2><p>Artificial intelligence is evolving rapidly. From GPT models to autonomous systems, AI is reshaping how we work and live.</p><h2>Key Trends</h2><ul><li>Multimodal AI models</li><li>AI in healthcare</li><li>Autonomous systems</li></ul>",

   featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",

   tags: ["AI", "Machine Learning", "Future"],

   seoTitle: "The Future of AI in 2026",

   seoDescription: "Exploring AI trends and predictions for 2026",

   published: true

  },

  {

   title: "Building a Portfolio with React",

   slug: "building-portfolio-react",

   category: "tech",

   subcategory: "web-development",

   excerpt: "Create a stunning portfolio website using React and modern CSS frameworks.",

   content: "<h2>Why React?</h2><p>React is the most popular frontend library for building user interfaces.</p><h2>Getting Started</h2><p>Set up your project with Create React App or Vite, then start building components.</p>",

   featuredImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",

   tags: ["React", "Portfolio", "CSS"],

   seoTitle: "Build a Portfolio with React",

   seoDescription: "Create a portfolio website with React",

   published: true

  },

  {

   title: "Understanding Machine Learning",

   slug: "understanding-machine-learning",

   category: "tech",

   subcategory: "ai",

   excerpt: "A beginner's guide to machine learning concepts and applications.",

   content: "<h2>What is Machine Learning?</h2><p>Machine learning is a subset of AI that enables systems to learn from data.</p><h2>Types of ML</h2><ul><li>Supervised Learning</li><li>Unsupervised Learning</li><li>Reinforcement Learning</li></ul>",

   featuredImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",

   tags: ["Machine Learning", "AI", "Data Science"],

   seoTitle: "Understanding Machine Learning - Beginner Guide",

   seoDescription: "Learn machine learning basics and concepts",

   published: true

  }

 ]

 await Blog.deleteMany({})

 await Blog.insertMany(blogs)

 console.log("Blogs seeded successfully!")

}

seed().catch(console.error)