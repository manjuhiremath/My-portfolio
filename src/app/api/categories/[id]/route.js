import { connectDB } from "@/lib/mongodb"
import Category from "@/models/Category"
import Tag from "@/models/Tag"
import Blog from "@/models/Blog"

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB()
    const category = await Category.findById(id).populate('tags')
    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 })
    }
    return Response.json(category)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB()
    const data = await req.json()

    const original = await Category.findById(id)
    if (!original) {
      return Response.json({ error: "Category not found" }, { status: 404 })
    }

    const isNameChanged = data.name && data.name !== original.name
    const isCategory = !original.parent

    // Generate slug if name changed
    let slug = original.slug
    if (data.name && data.name !== original.name) {
      slug = data.name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }

    // Handle tags update (only for categories)
    let updateData = { ...data }
    if (data.tags && isCategory) {
      // Remove category from old tags
      await Tag.updateMany(
        { categories: id },
        { $pull: { categories: id } }
      )
      // Add to new tags
      if (data.tags.length > 0) {
        await Tag.updateMany(
          { _id: { $in: data.tags } },
          { $addToSet: { categories: id } }
        )
      }
      updateData.tags = data.tags
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: data.name || original.name,
        slug: slug,
        color: data.color || original.color,
        description: data.description || original.description,
        seoTitle: data.seoTitle || original.seoTitle,
        seoDescription: data.seoDescription || original.seoDescription,
        keywords: data.keywords || original.keywords,
        tags: updateData.tags,
      },
      { new: true }
    ).populate('tags')

    // Blogs automatically reflect category changes via ObjectId reference
    // No manual update needed since we store the reference, not the name

    return Response.json(updatedCategory)
  } catch (error) {
    console.error('[API /categories/:id] PUT Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB()

    const category = await Category.findById(id)
    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 })
    }

    const isCategory = !category.parent

    if (isCategory) {
      // Remove category reference from all blogs
      await Blog.updateMany(
        { category: id },
        { $unset: { category: 1 } }
      )

      // Remove category from all tags
      await Tag.updateMany(
        { categories: id },
        { $pull: { categories: id } }
      )
    } else {
      // It's a tag - remove from categories and blogs
      await Category.updateMany(
        { tags: id },
        { $pull: { tags: id } }
      )
      await Blog.updateMany(
        { tags: id },
        { $pull: { tags: id } }
      )
      await Tag.findByIdAndDelete(id)
    }

    await Category.findByIdAndDelete(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('[API /categories/:id] DELETE Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
