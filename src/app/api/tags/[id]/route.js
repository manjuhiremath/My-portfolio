import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import Tag from "@/models/Tag"
import Blog from "@/models/Blog"
import Category from "@/models/Category"

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid tag ID" }, { status: 400 })
    }
    
    const tag = await Tag.findById(id).populate('categories')
    if (!tag) {
      return Response.json({ error: "Tag not found" }, { status: 404 })
    }
    return Response.json(tag)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid tag ID" }, { status: 400 })
    }
    
    const data = await req.json()

    const oldTag = await Tag.findById(id)
    if (!oldTag) {
      return Response.json({ error: "Tag not found" }, { status: 404 })
    }

    // Update slug if name changed
    let slug = oldTag.slug
    if (data.name && data.name !== oldTag.name) {
      slug = data.name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }

    // Update tag
    const tag = await Tag.findByIdAndUpdate(
      id,
      {
        name: data.name || oldTag.name,
        slug: slug,
        color: data.color || oldTag.color,
      },
      { new: true }
    )

    // Update categories relationship if provided
    if (data.categories) {
      // Remove tag from old categories
      await Category.updateMany(
        { tags: id },
        { $pull: { tags: id } }
      )
      // Add to new categories
      await Category.updateMany(
        { _id: { $in: data.categories } },
        { $addToSet: { tags: id } }
      )
      // Update tag's categories
      await Tag.findByIdAndUpdate(id, { categories: data.categories })
    }

    // Blogs automatically reflect the change since they store ObjectId references
    // When populated, the new name will appear

    return Response.json(tag)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid tag ID" }, { status: 400 })
    }

    // Remove tag from all categories
    await Category.updateMany(
      { tags: id },
      { $pull: { tags: id } }
    )

    // Remove tag reference from all blogs (keep the tag in blog's keywords or handle separately)
    await Blog.updateMany(
      { tags: id },
      { $pull: { tags: id } }
    )

    // Delete the tag
    await Tag.findByIdAndDelete(id)

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
