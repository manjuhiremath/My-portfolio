import { config } from 'dotenv';
import mongoose from 'mongoose';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

/**
 * Blog Migration Script
 * =====================
 * Migrates all existing blogs to the new structure:
 * 1. Converts subcategory → tag (if not already in tags)
 * 2. Computes readingTime from content
 * 3. Strips ```html code fences from content (Issue 10)
 * 4. Auto-generates tags from category + keywords if tags are empty
 * 5. Cleans excerpt of raw HTML (Issue 11)
 * 6. Ensures ogImage is set (falls back to featuredImage)
 * 7. Scans for broken internal links and creates draft blogs (Issues 6 & 12)
 */

// We connect directly to mongoose and use raw collection updates
// since we removed `subcategory` from the schema.
// Using raw MongoDB operations to read the old subcategory field.

function stripHtml(text = '') {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripCodeFences(content = '') {
  let c = content.trim();
  c = c.replace(/^```(?:html)?\s*\n?/i, '');
  c = c.replace(/\n?```\s*$/i, '');
  return c.trim();
}

function calculateReadingTime(content = '') {
  const plain = stripHtml(content);
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 220));
}

function cleanExcerpt(text = '') {
  if (!text) return '';
  let clean = text.replace(/```(?:html)?/gi, '').replace(/```/g, '');
  clean = stripHtml(clean);
  if (clean.length > 300) clean = clean.substring(0, 297) + '...';
  return clean;
}

function slugify(text = '') {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function migrate() {
  console.log('🚀 Starting Blog Migration...\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Use raw collection to read subcategory field (not in schema anymore)
  const db = mongoose.connection.db;
  const blogsCollection = db.collection('blogs');

  const allBlogs = await blogsCollection.find({}).toArray();
  console.log(`📚 Found ${allBlogs.length} blogs to migrate\n`);

  let updated = 0;
  let errors = 0;
  const allSlugs = new Set(allBlogs.map(b => b.slug));
  const draftsCreated = [];

  for (const blog of allBlogs) {
    try {
      const updates = {};
      const unsetFields = {};

      // 1. Convert subcategory to tag
      if (blog.subcategory && blog.subcategory.trim()) {
        const subTag = blog.subcategory.trim();
        const currentTags = blog.tags || [];
        const tagExists = currentTags.some(t =>
          t.toLowerCase() === subTag.toLowerCase()
        );

        if (!tagExists) {
          updates.tags = [...currentTags, subTag];
          console.log(`  📌 [${blog.slug}] Added subcategory "${subTag}" as tag`);
        } else {
          updates.tags = currentTags;
        }

        // Remove subcategory field entirely
        unsetFields.subcategory = '';
      }

      // 2. Compute reading time
      const readingTime = calculateReadingTime(blog.content || '');
      if (blog.readingTime !== readingTime) {
        updates.readingTime = readingTime;
      }

      // 3. Strip code fences from content
      if (blog.content) {
        const cleaned = stripCodeFences(blog.content);
        if (cleaned !== blog.content) {
          updates.content = cleaned;
          console.log(`  🧹 [${blog.slug}] Stripped code fences from content`);
        }
      }

      // 4. Auto-generate tags if empty
      const finalTags = updates.tags || blog.tags || [];
      if (finalTags.length === 0 && blog.category) {
        const autoTags = [blog.category];
        if (blog.keywords && blog.keywords.length > 0) {
          autoTags.push(...blog.keywords.slice(0, 3));
        }
        updates.tags = [...new Set(autoTags)];
        console.log(`  🏷️  [${blog.slug}] Auto-generated tags: ${updates.tags.join(', ')}`);
      }

      // 5. Clean excerpt
      if (blog.excerpt) {
        const cleanedExcerpt = cleanExcerpt(blog.excerpt);
        if (cleanedExcerpt !== blog.excerpt) {
          updates.excerpt = cleanedExcerpt;
          console.log(`  📝 [${blog.slug}] Cleaned excerpt`);
        }
      }

      // 6. Ensure ogImage
      if (!blog.ogImage && blog.featuredImage) {
        updates.ogImage = blog.featuredImage;
      }

      // 7. Scan for internal links and track missing ones
      if (blog.content) {
        const linkRegex = /(?:href=["']|]\()\/blog\/([^"'\s)]+)/gi;
        let match;
        while ((match = linkRegex.exec(blog.content)) !== null) {
          const path = match[1];
          const segments = path.split('/').filter(Boolean);
          const linkedSlug = segments[segments.length - 1];

          if (linkedSlug && !allSlugs.has(linkedSlug)) {
            allSlugs.add(linkedSlug); // prevent duplicates
            const title = linkedSlug
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());

            draftsCreated.push({
              title,
              slug: linkedSlug,
              category: blog.category || 'General',
              excerpt: `Draft article for "${title}".`,
              content: `<p>This is a draft article for "${title}". Content coming soon.</p>`,
              tags: (blog.tags || []).slice(0, 2),
              published: false,
              seoTitle: title,
              seoDescription: `Learn about ${title.toLowerCase()} in this upcoming article.`,
              readingTime: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            console.log(`  🔗 [${blog.slug}] Found missing internal link → "${linkedSlug}" (will create draft)`);
          }
        }
      }

      // Apply updates
      const updateOps = {};
      if (Object.keys(updates).length > 0) {
        updateOps.$set = updates;
      }
      if (Object.keys(unsetFields).length > 0) {
        updateOps.$unset = unsetFields;
      }

      if (Object.keys(updateOps).length > 0) {
        await blogsCollection.updateOne(
          { _id: blog._id },
          updateOps
        );
        updated++;
        console.log(`  ✅ [${blog.slug}] Updated`);
      } else {
        console.log(`  ⏭️  [${blog.slug}] No changes needed`);
      }
    } catch (error) {
      errors++;
      console.error(`  ❌ [${blog.slug}] Error: ${error.message}`);
    }
  }

  // Create draft blogs for missing internal links
  if (draftsCreated.length > 0) {
    console.log(`\n📝 Creating ${draftsCreated.length} draft blog(s) for missing internal links...`);
    for (const draft of draftsCreated) {
      try {
        const exists = await blogsCollection.findOne({ slug: draft.slug });
        if (!exists) {
          await blogsCollection.insertOne(draft);
          console.log(`  ✅ Created draft: "${draft.title}" (${draft.slug})`);
        } else {
          console.log(`  ⏭️  Draft already exists: "${draft.slug}"`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to create draft "${draft.slug}": ${error.message}`);
      }
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   Total blogs: ${allBlogs.length}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Drafts created: ${draftsCreated.length}`);
  console.log('─'.repeat(50));
  console.log('\n✨ Migration Complete!\n');

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
