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

- **Content Management**: Create, edit, and publish blog posts with rich HTML content.
- **AI-Powered Generation**: Generate blog content using multiple AI providers with automatic fallback and rate-limit protection.
- **Premium Typography**: Standardized on **Poppins** (Headings) and **Karla** (Body) for a modern editorial aesthetic.
- **SEO Optimization**: Automatic SEO scoring, meta tags, image sitemaps, and canonical URL management.
- **Skeleton Loading**: Integrated high-fidelity skeleton system for zero-jank transitions.
- **Media Management**: Upload via Cloudinary or use verified, high-resolution Unsplash assets.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Typography | Poppins (Display/Headings), Karla (Body/Content) |
| Database | MongoDB with Mongoose ODM |
| Storage | Cloudinary (User Media), Unsplash (Dynamic Feed) |
| AI | OpenRouter, Groq (Llama 3.3), Mistral, Cerebras |
| Deployment | Vercel |

---

## 2. Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel (Dashboard, Blog CRUD, SEO Tools)
│   ├── api/                      # API Routes (Blogs, AI, Search, Stats)
│   └── blog/                     # Public Blog Ecosystem
│       ├── [category]/           # Category-specific hubs
│       │   └── [slug]/           # High-readability article pages
│       ├── sitemap.xml/          # Dynamic image-enriched sitemaps
│       ├── tag/[tag]/            # Tag-filtered archives
│       └── BlogClient.js         # Interactive blog engine
│
├── models/                       # MongoDB Schemas
│   ├── Blog.js                   # Primary article schema
│   ├── Category.js               # Taxonomy & metadata
│   └── Tag.js                    # Keyword indexing
│
├── lib/                          # Backend logic
│   ├── ai/                       # Provider-agnostic AI routing
│   ├── seo/                      # Scoring & optimization logic
│   └── utils.js                  # Shared logic (slugify, etc.)
│
└── components/                   # React components
    ├── blog/                     # Blog core (Card, TableOfContents, Skeletons)
    │   ├── editorial/            # Layouts (CategorySection, FeaturedHero)
    │   └── BlogSkeletons.js      # Global loading state library
    └── portfolio/                # Portfolio UI (Experience, Education, Skills)
```

---

## 3. Database Schema

### 3.1 Blog Model (`Blog.js`)

Key fields include:
- **SEO Score**: Calculated 0-100 based on keyword density and structure.
- **Section Images**: Array of high-resolution images injected into the content.
- **Canonical URL**: Dynamic canonical mapping for cross-category search optimization.
- **Impact Metrics**: View counts and estimated reading time.

---

## 4. Blog Rendering System

### 4.1 Editorial Components

- **CategorySection**: A premium 2-column layout. Left side features a "Big" immersive card for top content; right side features a vertical list of 5 compact items with thumbnails and "Impact" metrics.
- **TrendingSidebar**: A fixed dark-editorial sidebar showing the most-read and latest articles with high-contrast typography.
- **TableOfContents**: A reactive navigation sidebar that auto-scrolls to keep the active section centered.

### 4.2 Skeleton System (`BlogSkeletons.js`)

A comprehensive library of components that mirror the exact layout of the blog. Used in:
- `app/blog/loading.js` (Main feed)
- `app/blog/[category]/loading.js` (Category hubs)
- `app/blog/[category]/[slug]/loading.js` (Articles)

---

## 5. SEO System

### 5.1 Dual-Purpose Sitemap

Located at `/blog/sitemap.xml`:
1. **Sitemap Index**: Root access lists all category sitemaps.
2. **Category Sitemap**: `?id={slug}` returns a full listing of articles including **Google Image extensions** for the featured image and all content images.

### 5.2 Dynamic Metadata

- **Articles**: Generates specific `seoTitle` and `seoDescription` with canonical URL mapping.
- **Categories**: Dynamic titles based on taxonomy depth.

---

## 6. Image System

### 6.1 Verified Asset Pipeline

To prevent 404 errors, the system utilizes a **Verified ID Pool** for Unsplash images.
- **Cleanup Utility**: `fix_404_images.mjs` identifies and replaces broken image IDs in the database with verified high-resolution alternatives.
- **Responsive Handling**: Images use specific aspect ratios (`16/10` for mobile, `4/3` for cards) to maintain vertical rhythm.

---

## 7. Development Guide

### 7.1 Typography System

All new components must use the semantic CSS variables defined in `globals.css`:
- **Headings**: `font-display` (mapped to Poppins, weight 600-800).
- **Body**: `font-body` (mapped to Karla, weight 400-700).

### 7.2 Adding New Editorial Sections

1. Create the component in `src/components/blog/editorial/`.
2. Implement an internal `loading` prop check.
3. Add a corresponding skeleton in `BlogSkeletons.js`.
4. Ensure the component is responsive from mobile (`grid-cols-1`) to large desktop.

---

**Document Version**: 1.5  
**Last Updated**: March 2026  
**Author**: Digital Manifesto Engineering Team
