# Blog Portfolio Project Documentation

## Overview

The blog section of the portfolio is a full-featured content management system built with Next.js 15, MongoDB, and React. It provides a modern, responsive blog platform for publishing articles on technology, design, and business topics.

## Project Structure

```
src/app/blog/
├── [category]/           # Dynamic category pages (planned)
├── layout.js            # Blog layout with SEO metadata
├── page.js              # Main blog listing page
└── blogproject.md       # This documentation file
```

## Technology Stack

- **Framework**: Next.js 15.5.9 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12
- **Icons**: React Icons 5
- **Image Handling**: Next.js Image component

## Core Features

### 1. Blog Listing Page (`page.js`)

The main blog page includes:

- **Hero Section with Carousel**
  - Auto-rotating featured posts (5-second interval)
  - Navigation arrows and dot indicators
  - Gradient background with subtle pattern
  - Category badges on featured images

- **Category Filtering**
  - Filter buttons for all categories
  - Dynamic category list generation
  - Active state highlighting with orange accent

- **Blog Cards Grid**
  - Responsive grid layout (1/2/3 columns)
  - Hover effects with image zoom
  - Category color coding
  - Excerpt truncation
  - Date formatting

- **Data Fetching**
  - Client-side fetching with useEffect
  - Loading state handling
  - Error handling with try/catch

### 2. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blogs` | GET | Fetch all published blogs |
| `/api/blogs` | POST | Create new blog post |
| `/api/blogs/[slug]` | GET | Fetch single blog by slug |
| `/api/categories` | GET | Fetch all categories |
| `/api/categories` | POST | Create new category |
| `/api/upload` | POST | Upload images |

### 3. Database Schema

The Blog model includes:

- **title**: String (required)
- **slug**: String (unique, URL-friendly)
- **excerpt**: String (brief summary)
- **content**: String (full HTML/markdown)
- **category**: String (main category)
- **subcategory**: String (sub-category)
- **featuredImage**: String (image URL)
- **tags**: Array of strings
- **published**: Boolean (draft/published)
- **createdAt**: Date
- **updatedAt**: Date

## URL Structure

```
/blog                              - Main blog listing
/blog/[category]                  - Category filtered view
/blog/[category]/[subcategory]    - Subcategory view
/blog/[category]/[subcategory]/[slug] - Individual blog post
```

## SEO Implementation

The blog includes comprehensive SEO:

- **Metadata**: Title, description, keywords
- **Open Graph**: Social media previews
- **Twitter Cards**: Twitter share optimization
- **Robots**: Index and follow directives

## Component Features

### BlogCard
- Featured image with Next.js Image component
- Category badge with dynamic coloring
- Title with hover effect
- Excerpt with line clamping
- Subcategory and date display

### Featured Carousel
- Auto-advancement every 5 seconds
- Manual navigation controls
- Smooth CSS transitions
- Gradient overlays for text readability

### Category Filter
- Dynamic category detection
- "All Posts" option
- Responsive button layout

## Styling

### Color Scheme
- Primary: `#334155` (slate-700)
- Secondary: `#64748B` (slate-500)
- Accent: `#f97316` (orange-500)
- Background: Dynamic (light/dark)

### Responsive Breakpoints
- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

## Performance Optimizations

- Next.js Image component with lazy loading
- Client-side data fetching for real-time updates
- CSS transitions for smooth animations
- Optimized carousel with transform translations

## Future Enhancements

- [x] AI Blog Generator
- [ ] Category dynamic pages (`[category]/page.js`)
- [ ] Subcategory pages
- [ ] Search functionality
- [ ] Related posts
- [ ] Comments system
- [ ] Newsletter subscription
- [ ] Social sharing buttons

## AI Blog Generator

The AI Blog Generator is a powerful feature that allows admins to automatically generate SEO-optimized blog posts using AI.

### How It Works

1. **Admin enters topic, category, and subcategory**
2. **AI (Llama 3.1 via OpenRouter) generates:**
   - Title
   - Slug (URL-friendly)
   - Tags (array)
   - SEO Title (50-60 chars)
   - SEO Description (150-160 chars)
   - Featured Image Prompt
   - Content (1500+ words with H2, bullets, FAQ)
3. **Blog is saved to MongoDB as draft**

### API Endpoint

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/generate-blog` | POST | Generate and save blog post |

### Admin Interface

Access at: `/admin/blogs/generate`

Features:
- Topic input field
- Category dropdown (populated from database)
- Subcategory dropdown (dependent on category selection)
- Generate button with loading state
- Preview of generated content
- Direct links to edit or view all blogs

### Environment Variables

```env
OPENROUTER_API_KEY=your_openrouter_key_here
```

### Dependencies

```json
{
  "openai": "^4.x",
  "slugify": "^3.x"
}
```

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production
npm start

# Linting
npm run lint
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/myportfolio
CLOUDINARY_CLOUD_NAME=BLOG
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
OPENROUTER_API_KEY= xxxxxx
```

## Dependencies

```json
{
  "next": "15.5.9",
  "react": "19.1.0",
  "mongoose": "^8.x",
  "framer-motion": "^12.x",
  "react-icons": "^5.x"
}
```

## License

This project is part of the personal portfolio and is proprietary.
