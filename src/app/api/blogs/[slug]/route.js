import {connectDB} from "@/lib/mongodb"
import Blog from "@/models/Blog"
import Category from "@/models/Category"
import Tag from "@/models/Tag"
import mongoose from "mongoose"
import { normalizeFeaturedImageUrl } from "@/lib/cloudinary"

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id
}

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    await connectDB();

    let blog;

    // Use lean() to avoid populate issues with legacy string categories
    if (isValidObjectId(slug)) {
      blog = await Blog.findByIdAndUpdate(slug, { $inc: { views: 1 } }, { returnDocument: 'after' }).lean();
    } else {
      blog = await Blog.findOneAndUpdate({ slug: slug }, { $inc: { views: 1 } }, { returnDocument: 'after' }).lean();
    }

    if (!blog) {
      return Response.json({error: "Blog not found"}, {status: 404})
    }

    return Response.json(blog)

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}

export async function PUT(req, { params }) {
  try {
    const { slug } = await params;
    await connectDB();

    const data = await req.json();

    if (data.featuredImage) {
      data.featuredImage = await normalizeFeaturedImageUrl(data.featuredImage, "blog-featured")
    }

    // Convert category name to ObjectId if provided as string
    if (data.category) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(data.category)
      if (!isObjectId) {
        const cat = await Category.findOne({ name: data.category })
        if (cat) {
          data.category = cat._id
        }
      }
    }

    // Convert tag names to ObjectIds if provided as strings
    if (data.tags && Array.isArray(data.tags)) {
      const tagIds = []
      for (const tag of data.tags) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(tag)
        if (isObjectId) {
          tagIds.push(tag)
        } else {
          const t = await Tag.findOne({ name: tag })
          if (t) {
            tagIds.push(t._id)
          }
        }
      }
      data.tags = tagIds
    }

    if (data.published === true) {
      data.publishedAt = new Date()
    } else if (data.published === false) {
      data.publishedAt = null
    }

    let blog
    
    if (isValidObjectId(slug)) {
      blog = await Blog.findByIdAndUpdate(slug, data, { returnDocument: "after", runValidators: true })
    } else {
      blog = await Blog.findOneAndUpdate({ slug: slug }, data, { returnDocument: "after", runValidators: true })
    }

    if (!blog) {
      return Response.json({error: "Blog not found"}, {status: 404})
    }

    // Try to populate, but don't fail if it doesn't work (legacy data)
    try {
      await blog.populate('category')
      await blog.populate('tags')
    } catch (e) {
      console.warn('Failed to populate blog:', e.message)
    }

    return Response.json(blog)

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}

export async function DELETE(req, { params }) {
  try {
    const { slug } = await params;
    await connectDB();

    let blog;

    if (isValidObjectId(slug)) {
      blog = await Blog.findByIdAndDelete(slug);
    } else {
      blog = await Blog.findOneAndDelete({ slug: slug });
    }

    if (!blog) {
      return Response.json({error: "Blog not found"}, {status: 404})
    }

    return Response.json({message: "Blog deleted successfully"})

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}
