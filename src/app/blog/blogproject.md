# Blog Project Documentation

> **Complete technical documentation for the Manju Hiremath Blog Platform**

This document provides comprehensive developer documentation for the blog system's architecture, APIs, database schemas, and workflows.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Project Structure](#2-project-structure)
3. [Database Schema](#3-database-schema)
4. [Admin Panel](#4-admin-panel)
5. [Blog Rendering System](#5-blog-rendering-system)
6. [API Documentation](#6-api-documentation)
7. [SEO System](#7-seo-system)
8. [AI Blog Generator](#8-ai-blog-generator)
9. [Image System](#9-image-system)
10. [Analytics System](#10-analytics-system)
11. [Taxonomy System](#11-taxonomy-system)
12. [Content Workflow](#12-content-workflow)
13. [Architecture Diagram](#13-architecture-diagram)
14. [Development Guide](#14-development-guide)

---

## 1. System Overview

The blog platform is a **full-featured CMS** built with Next.js and MongoDB that provides:

- **Content Management**: Create, edit, and publish blog posts with rich HTML content
- **AI-Powered Generation**: Generate blog content using multiple AI providers with automatic fallback
- **SEO Optimization**: Automatic SEO scoring, meta tags, schema markup, and internal linking
- **Analytics Dashboard**: Track views, keyword rankings, and content performance
- **Media Management**: Upload and manage images via Cloudinary
- **Taxonomy**: Hierarchical categories and tags for content organization

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, React, Tailwind CSS |
| Database | MongoDB with Mongoose ODM |
| Storage | Cloudinary (images) |
| AI | OpenRouter, Groq, Mistral, Cerebras, SambaNova, Ollama |
| Deployment | Vercel |

---

## 2. Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel
│   │   └── blog/
│   │       ├── analytics/       # Analytics dashboard
│   │       ├── blogs/           # Blog management
│   │       │   ├── create/      # Create new blog
│   │       │   ├── edit/[slug]/ # Edit existing blog
│   │       │   └── generate/   # AI blog generator
│   │       ├── categories/      # Category & tag management
│   │       ├── media/          # Media library
│   │       ├── settings/       # Blog settings
│   │       ├── seo-tools/      # SEO utilities
│   │       └── ai-models/      # AI model configuration
│   │
│   ├── api/                    # API Routes
│   │   ├── admin/
│   │   │   ├── dashboard/      # Dashboard stats
│   │   │   └── scrape/        # Web scraping
│   │   ├── ai/
│   │   │   ├── generate-blog/  # AI blog generation
│   │   │   ├── generate-image/# AI image generation
│   │   │   ├── generate-outline/
│   │   │   ├── keyword-research/
│   │   │   ├── key-info/
│   │   │   └── models/        # AI model management
│   │   ├── blogs/             # Blog CRUD
│   │   ├── categories/        # Category management
│   │   ├── tags/             # Tag management
│   │   ├── upload/           # File upload
│   │   └── sitemap/         # Sitemap generation
│   │
│   └── blog/                  # Public blog pages
│       ├── page.tsx           # Main blog listing
│       ├── [category]/        # Category-filtered blogs
│       └── tag/[tag]/         # Tag-filtered blogs
│
├── models/                      # MongoDB Schemas
│   ├── Blog.js
│   ├── Category.js
│   ├── Tag.js
│   └── AIModel.js
│
├── lib/                        # Utility libraries
│   ├── admin/
│   │   └── dashboard-stats.js # Analytics aggregation
│   ├── ai/
│   │   ├── router.js          # AI provider fallback router
│   │   └── providers.js       # AI provider configurations
│   ├── seo/
│   │   └── score.js          # SEO scoring algorithms
│   ├── cloudinary.js          # Image handling
│   ├── mongodb.js             # Database connection
│   └── utils.js               # General utilities
│
└── components/                # React components
    ├── admin/                # Admin UI components
    ├── blog/                 # Blog display components
    └── ui/                   # Shared UI components
```

---

## 3. Database Schema

### 3.1 Blog Model (`Blog.js`)

```javascript
{
  // Core Content
  title: String,              // Blog title
  slug: String,               // URL-friendly identifier
  content: String,            // HTML content from rich text editor
  excerpt: String,            // Short description for cards
  
  // Categorization
  category: ObjectId,          // Reference to Category
  tags: [ObjectId],           // Array of Tag references
  
  // SEO
  seoTitle: String,           // Custom SEO title
  seoDescription: String,     // Meta description
  keywords: [String],         // Target keywords
  seoScore: Number,          // Calculated SEO score (0-100)
  faq: [{                    // FAQ section
    question: String,
    answer: String
  }],
  internalLinks: [String],     // Internal link URLs
  
  // Media
  featuredImage: String,      // Main blog image URL
  sectionImages: [String],    // In-content images
  ogImage: String,           // Social sharing image
  
  // Metrics
  readingTime: Number,        // Estimated read time (minutes)
  views: Number,              // View count
  
  // Publishing
  published: Boolean,          // Draft/published status
  publishedAt: Date,          // Publication timestamp
  createdAt: Date,           // Creation timestamp
  updatedAt: Date            // Last update
}
```

**Indexes:**
- `slug` (unique)
- `published`
- `category`
- `createdAt`

### 3.2 Category Model (`Category.js`)

```javascript
{
  // Identity
  name: String,               // Category name
  slug: String,              // URL-friendly identifier
  
  // Hierarchy
  parent: ObjectId,           // Reference to parent Category (null = top-level)
  
  // Presentation
  color: String,             // Display color (hex)
  description: String,       // Category description
  
  // Relations
  tags: [ObjectId],          // Associated tags (many-to-many)
  
  // SEO
  seoTitle: String,
  seoDescription: String,
  keywords: [String],
  
  timestamps: true            // createdAt, updatedAt
}
```

**Key Features:**
- Supports **hierarchical categories** (parent/child)
- Child categories become **tags** in the UI
- Many-to-many relationship with Tags

### 3.3 Tag Model (`Tag.js`)

```javascript
{
  // Identity
  name: String (required),    // Tag name
  slug: String (required, unique), // URL-friendly identifier
  
  // Presentation
  color: String,             // Display color (default: #6366f1)
  
  // Relations
  categories: [ObjectId],    // Associated categories
  
  timestamps: true
}
```

**Indexes:**
- `slug` (unique)

### 3.4 AIModel Model (`AIModel.js`)

```javascript
{
  // Identity
  modelId: String (unique),   // Provider model identifier
  name: String,              // Display name
  
  // Configuration
  provider: String,           // Provider name
  providerType: String,      // openrouter, ollama, openai, etc.
  apiKey: String,           // API key (hidden from queries)
  baseUrl: String,           // Custom endpoint URL
  
  // Capabilities
  description: String,
  contextLength: Number,     // Max tokens
  capability: String,        // text-to-text, image-to-text, etc.
  inputModalities: [String],
  outputModalities: [String],
  
  // Usage Flags
  isFree: Boolean,
  isActive: Boolean,
  isDefault: Boolean,
  useForKeywordResearch: Boolean,
  useForOutline: Boolean,
  useForContent: Boolean,
  
  timestamps: true
}
```

### 3.5 Schema Relationships

```
┌─────────────┐       ┌──────────────┐       ┌─────────┐
│    Blog      │       │  Category    │       │   Tag   │
├─────────────┤       ├──────────────┤       ├─────────┤
│ category    │◄──────│ _id          │       │         │
│ tags []     │       │              │       │         │
│             │       │ parent       │◄──────│ _id     │
│             │       │ tags []      │◄──────│categories│
└─────────────┘       └──────────────┘       └─────────┘
```

---

## 4. Admin Panel

### 4.1 Admin Routes

| Route | Purpose |
|-------|---------|
| `/admin/blog` | Redirect to dashboard |
| `/admin/blog/dashboard` | Overview with KPIs, recent blogs |
| `/admin/blog/blogs` | Blog listing with search/filter |
| `/admin/blog/blogs/create` | Manual blog creation |
| `/admin/blog/blogs/edit/[slug]` | Edit existing blog |
| `/admin/blog/blogs/generate` | AI-powered blog generator |
| `/admin/blog/categories` | Category & tag management |
| `/admin/blog/media` | Media library |
| `/admin/blog/analytics` | Analytics dashboard |
| `/admin/blog/seo-tools` | SEO utilities |
| `/admin/blog/ai-models` | AI model configuration |

### 4.2 Dashboard (`/admin/blog/dashboard`)

Displays:
- **KPI Cards**: Total blogs, published count, total views, avg SEO score, categories
- **Monthly Views Chart**: 6-month view trend
- **SEO Distribution**: Blog count by SEO score bucket
- **Recent Blogs Table**: Last 10 updated blogs with quick edit
- **Top Articles**: Best performing content

### 4.3 Blog Management (`/admin/blog/blogs`)

Features:
- Search by title/slug
- Filter by status (all/published/draft)
- Filter by category
- Sort by title, SEO score, views, date
- Pagination (12 per page)
- Quick publish/draft toggle
- Delete with confirmation
- Bulk actions placeholder

### 4.4 AI Blog Generator (`/admin/blog/blogs/generate`)

Multi-step wizard:

1. **Keyword**: Enter target keyword/topic
2. **Outline**: AI generates blog structure
3. **Content**: AI writes full article
4. **SEO**: Auto-optimize meta tags
5. **Image**: Generate featured image
6. **Publish**: Preview and publish

### 4.5 Categories & Tags (`/admin/blog/categories`)

Features:
- Create top-level categories
- Create tags (child categories)
- Assign tags to categories via dropdown
- Tags shown under respective categories
- Search/filter taxonomy
- Delete categories/tags

### 4.6 Analytics (`/admin/blog/analytics`)

Comprehensive dashboard with:

- **KPI Cards**: Total blogs, views, monthly views, SEO score, keywords, high-SEO count
- **Traffic Chart**: Monthly view distribution (12 months)
- **Categories Chart**: Top categories by views
- **SEO Distribution**: Donut chart of score buckets
- **AI Insights**: Automated recommendations
- **SEO Health Checklist**: Missing meta, images, links
- **Quick Actions**: Fix SEO, generate ideas, fix links
- **Content Table**: Top performing blogs (sortable)
- **Keyword Table**: Keyword rankings with position/delta

---

## 5. Blog Rendering System

### 5.1 Public Routes

| Route | Description |
|-------|-------------|
| `/blog` | Main blog listing with editorial layout |
| `/blog/[category]` | Category-filtered posts |
| `/blog/[category]/[slug]` | Individual blog post |
| `/blog/tag/[tag]` | Tag-filtered posts |

### 5.2 Blog Listing Page (`/blog`)

Editorial components:
- **FeaturedHero**: Top blog with large image
- **TopStories**: 4 trending blogs
- **TrendingSidebar**: Top 5 by views
- **CategorySection**: Blogs grouped by category
- **EditorPicks**: Staff-selected content
- **LatestBlogsGrid**: Chronological grid

### 5.3 Blog Post Page (`/blog/[category]/[slug]`)

Features:
- Full article content with typography
- Featured image with caption
- Author info
- Publication date
- Reading time
- Category and tags
- Table of contents (auto-generated from headings)
- FAQ section (if available)
- Related posts
- Social sharing
- Comments (future)

---

## 6. API Documentation

### 6.1 Blogs API

#### GET `/api/blogs`

Fetch blogs with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 100 |
| `published` | string | `true`, `false`, or `all` | `true` |
| `category` | string | Filter by category name | - |
| `startDate` | string | Filter from date (ISO) | - |
| `endDate` | string | Filter to date (ISO) | - |

**Response:**
```json
{
  "success": true,
  "blogs": [
    {
      "_id": "...",
      "title": "Blog Title",
      "slug": "blog-slug",
      "category": "Technology",
      "published": true,
      "views": 1250,
      "featuredImage": "https://...",
      "createdAt": "2024-01-15T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 45,
    "totalPages": 1
  }
}
```

#### GET `/api/blogs/[slug]`

Get single blog by slug.

#### POST `/api/blogs`

Create new blog.

**Request Body:**
```json
{
  "title": "Blog Title",
  "slug": "blog-slug",
  "content": "<p>HTML content</p>",
  "category": "Technology",
  "tags": ["tag1", "tag2"],
  "seoTitle": "SEO Title",
  "seoDescription": "Meta description",
  "featuredImage": "cloudinary-url",
  "published": true
}
```

#### PUT `/api/blogs/[slug]`

Update existing blog.

#### DELETE `/api/blogs/[slug]`

Delete blog.

---

### 6.2 Categories API

#### GET `/api/categories`

Get all categories (with tag population).

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Technology",
    "slug": "technology",
    "parent": null,
    "color": "#6366f1",
    "tags": [
      { "_id": "...", "name": "AI", "slug": "ai" }
    ]
  }
]
```

#### POST `/api/categories`

Create category.

**Request Body:**
```json
{
  "name": "Category Name",
  "slug": "category-slug",
  "parent": null,
  "color": "#6366f1"
}
```

#### PUT `/api/categories/[id]`

Update category (including tags array).

#### DELETE `/api/categories/[id]`

Delete category.

---

### 6.3 Tags API

#### GET `/api/tags`

Get all tags.

#### POST `/api/tags`

Create tag.

#### PUT `/api/tags/[id]`

Update tag.

#### DELETE `/api/tags/[id]`

Delete tag.

---

### 6.4 Analytics API

#### GET `/api/admin/dashboard/stats`

Returns comprehensive analytics data.

**Response:**
```json
{
  "success": true,
  "metrics": {
    "totalBlogs": 45,
    "publishedBlogs": 38,
    "draftBlogs": 7,
    "totalCategories": 8,
    "totalViews": 15000,
    "averageSeoScore": 72,
    "monthlyViewsCurrent": 1250,
    "viewsTrend": 15,
    "highSeoCount": 12,
    "health": {
      "missingMeta": 5,
      "missingImages": 8,
      "missingInternalLinks": 12
    }
  },
  "monthlyViews": [
    { "month": "Jan 2024", "views": 1000, "articles": 5 }
  ],
  "recentBlogs": [...],
  "topArticles": [...],
  "blogsByCategory": [...],
  "keywordRankings": [...],
  "seoScoreDistribution": [...]
}
```

---

### 6.5 AI APIs

#### POST `/api/ai/generate-blog`

Generate full blog post.

#### POST `/api/ai/generate-outline`

Generate blog outline.

#### POST `/api/ai/generate-image`

Generate AI image.

#### POST `/api/ai/keyword-research`

Research keywords for topic.

---

## 7. SEO System

### 7.1 SEO Score Calculation

Located in `/lib/seo/score.js`:

```javascript
calculateBlogSeoScore(blog) → 0-100
```

**Scoring Criteria:**

| Criterion | Weight | Conditions |
|-----------|--------|------------|
| Title length | 16 pts | 25-70 chars |
| SEO Title | 16 pts | 30-60 chars |
| Meta Description | 16 pts | 120-170 chars |
| Excerpt | 10 pts | 90-260 chars |
| Headings | 10 pts | 3+ headings |
| Content Length | 16 pts | 1200+ words |
| Keyword Coverage | 16 pts | 65%+ |

### 7.2 SEO Features

- **Meta Tags**: Auto-generated from blog data
- **Schema Markup**: Article, FAQ, Breadcrumb schemas
- **Internal Linking**: Detection of missing internal links
- **OG Tags**: Social sharing images
- **Sitemap**: Auto-generated `/sitemap.xml`
- **Robots.txt**: Auto-generated `/robots.txt`

---

## 8. AI Blog Generator

### 8.1 AI Router (`/lib/ai/router.js`)

Intelligent fallback system that tries multiple AI providers in order:

```javascript
FALLBACK_CHAIN = [
  // Primary models
  { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  { provider: 'openrouter', model: 'mistralai/mistral-small-3.1-24b-instruct:free' },
  { provider: 'openrouter', model: 'google/gemma-3-27b-it:free' },
  
  // Secondary models
  { provider: 'openrouter', model: 'google/gemma-3-12b-it:free' },
  { provider: 'openrouter', model: 'qwen/qwen3-next-80b-a3b-instruct:free' },
  
  // Lightweight fallback
  { provider: 'openrouter', model: 'meta-llama/llama-3.2-3b-instruct:free' },
  
  // Local fallback
  { provider: 'ollama', model: 'llama3' },
  { provider: 'ollama', model: 'mistral' }
]
```

### 8.2 Supported Providers

| Provider | Type | API Required |
|----------|------|--------------|
| OpenRouter | Cloud | Yes (free tier available) |
| Groq | Cloud | Yes (free tier available) |
| Mistral | Cloud | Yes (free tier available) |
| Cerebras | Cloud | Yes (free tier available) |
| SambaNova | Cloud | Yes (free tier available) |
| Ollama | Local | No (runs locally) |

### 8.3 Generation Workflow

```
1. Keyword Research
   └─→ Analyze topic, find related keywords
   
2. Outline Generation
   └─→ Create blog structure with headings
   
3. Content Generation
   └─→ Write full article with SEO optimization
   
4. SEO Optimization
   └─→ Generate meta title/description
   
5. Image Generation
   └─→ Create featured image via AI
   
6. Publish
   └─→ Preview and post to blog
```

---

## 9. Image System

### 9.1 Image Sources

- **AI Generated**: Via `/api/ai/generate-image`
- **Cloudinary Upload**: Via `/api/upload`
- **External URLs**: Direct image URLs

### 9.2 Image Types

| Type | Field | Usage |
|------|-------|-------|
| Featured Image | `featuredImage` | Blog header, cards |
| Section Images | `sectionImages[]` | In-content images |
| OG Image | `ogImage` | Social sharing |

### 9.3 Cloudinary Integration

Located in `/lib/cloudinary.js`:

- **Upload**: Normalize and upload images
- **Transformation**: Auto-resize for different contexts
- **Optimization**: Auto-format (WebP/AVIF)

---

## 10. Analytics System

### 10.1 Dashboard Metrics

Located in `/lib/admin/dashboard-stats.js`:

**Key Metrics:**
- Total blogs (published/drafts)
- Total views (lifetime)
- Monthly views with trend percentage
- Average SEO score
- High SEO count (90+)
- Keyword count

**Health Indicators:**
- Missing meta descriptions
- Missing featured images
- Missing internal links

### 10.2 Data Aggregations

```javascript
// Monthly views (last 12 months)
Blog.aggregate([
  { $match: { createdAt: { $gte: 1 year ago } } },
  { $group: { _id: '$month', views: { $sum: '$views' } }
])

// Views by category
Blog.aggregate([
  { $match: { published: true } },
  { $group: { _id: '$category', views: { $sum: '$views' } }
])

// SEO distribution
Blog.aggregate([
  { $group: { _id: null, scores: { $push: '$seoScore' } }
])
```

---

## 11. Taxonomy System

### 11.1 Category Hierarchy

```
Category (Parent)
├── Child Category 1 (Tag)
│   └── Related Tags
├── Child Category 2 (Tag)
│   └── Related Tags
└── Child Category 3 (Tag)
```

### 11.2 Tag Assignment

Tags can be assigned to multiple categories via the Category model:

```javascript
// In Category model
tags: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Tag'
}]

// In Tag model  
categories: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category'
}]
```

### 11.3 Usage in Blogs

- **Category**: Single category per blog
- **Tags**: Multiple tags per blog

---

## 12. Content Workflow

### 12.1 Blog Lifecycle

```
┌─────────────┐
│    Draft    │  ← Created via admin or AI generator
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Review    │  ← Edit content, add images, optimize SEO
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Published │  ← Set published=true
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Analytics │  ← Track views, update SEO score
└─────────────┘
```

### 12.2 AI Generation Flow

1. Enter keyword/topic
2. Generate outline → Review/Edit
3. Generate content → Review/Edit
4. Auto-generate SEO meta
5. Generate featured image
6. Preview → Publish

---

## 13. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Admin UI   │  │ Blog Pages │  │ Public API │        │
│  └─────┬───────┘  └──────┬──────┘  └──────┬──────┘        │
└────────┼──────────────────┼───────────────┼───────────────┘
         │                  │               │
         ▼                  ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ /api/blogs │  │ /api/admin │  │ /api/ai    │        │
│  └─────┬───────┘  └──────┬──────┘  └──────┬──────┘        │
└────────┼──────────────────┼───────────────┼───────────────┘
         │                  │               │
         ▼                  ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  ┌──────────┐  ┌───────────┐  ┌────────┐  ┌─────────┐   │
│  │   Blog   │  │ Category  │  │  Tag   │  │ AIModel │   │
│  └────┬─────┘  └─────┬─────┘  └───┬────┘  └────┬────┘   │
│       │              │            │            │           │
│       └──────────────┴────────────┴────────────┘           │
│                    MongoDB                                    │
└─────────────────────────────────────────────────────────────┘
         │                  │               │
         ▼                  ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Cloudinary  │  │  AI Providers│  │   External  │
│   (Images)  │  │  (OpenRouter │  │   Services   │
│              │  │   Groq, etc) │  │             │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 14. Development Guide

### 14.1 Adding New Blog Features

1. **Database**: Add field to `Blog.js` schema
2. **API**: Update `/api/blogs` routes
3. **Admin**: Add form field in blog editor
4. **Frontend**: Update blog display components
5. **SEO**: Update scoring if needed

### 14.2 Adding New API Routes

1. Create route file: `app/api/[resource]/route.js`
2. Implement GET/POST/PUT/DELETE handlers
3. Connect to MongoDB via `connectDB()`
4. Use Mongoose models for CRUD
5. Return proper JSON responses

### 14.3 Extending Admin Panel

1. Create page: `app/admin/blog/[feature]/page.js`
2. Use existing UI components:
   - `AdminPageHeader`
   - `AdminActionToolbar`
   - `AdminMetricCard`
   - `AdminStatusBadge`
3. Call APIs for data
4. Handle loading/error states

### 14.4 Adding Analytics Metrics

1. Add aggregation in `/lib/admin/dashboard-stats.js`
2. Update API response format
3. Add UI component in `/admin/blog/analytics/page.js`

### 14.5 Environment Variables

```env
# Database
MONGODB_URI=mongodb://...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# AI Providers
OPENROUTER_API_KEY=sk-or-...
GROQ_API_KEY=...
MISTRAL_API_KEY=...
CEREBRAS_API_KEY=...
OLLAMA_API_KEY=...
```

---

## Appendix: Component Reference

### Admin UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AdminPageHeader` | `/components/admin/ui` | Page title, description, actions |
| `AdminActionToolbar` | `/components/admin/ui` | Search, filters, bulk actions |
| `AdminMetricCard` | `/components/admin/ui` | KPI metric display |
| `AdminStatusBadge` | `/components/admin/ui` | Status indicators |

### Blog Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `BlogCard` | `/components/blog` | Blog preview card |
| `FeaturedHero` | `/components/blog/editorial` | Featured blog display |
| `TopStories` | `/components/blog/editorial` | Trending blogs |
| `TrendingSidebar` | `/components/blog/editorial` | Sidebar trending |

---

**Document Version**: 1.0  
**Last Updated**: March 2024  
**Author**: Blog Platform Documentation
