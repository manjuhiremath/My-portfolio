import {connectDB} from "@/lib/mongodb"
import Blog from "@/models/Blog"
import mongoose from "mongoose"
import { normalizeFeaturedImageUrl } from "@/lib/cloudinary"

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id
}

export async function GET(req,{params}){

  try {

    await connectDB()

    let blog

    if (isValidObjectId(params.slug)) {
      blog = await Blog.findByIdAndUpdate(params.slug, { $inc: { views: 1 } }, { returnDocument: 'after' })
    } else {
      blog = await Blog.findOneAndUpdate({ slug: params.slug }, { $inc: { views: 1 } }, { returnDocument: 'after' })
    }

    if (!blog) {
      return Response.json({error: "Blog not found"}, {status: 404})
    }

    return Response.json(blog)

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}

export async function PUT(req,{params}){

  try {

    await connectDB()

    const data = await req.json()

    if (data.featuredImage) {
      data.featuredImage = await normalizeFeaturedImageUrl(data.featuredImage, "blog-featured")
    }

    if (data.published === true) {
      data.publishedAt = new Date()
    } else if (data.published === false) {
      data.publishedAt = null
    }

    let blog
    
    if (isValidObjectId(params.slug)) {
      blog = await Blog.findByIdAndUpdate(params.slug, data, { returnDocument: "after", runValidators: true })
    } else {
      blog = await Blog.findOneAndUpdate({ slug: params.slug }, data, { returnDocument: "after", runValidators: true })
    }

    if (!blog) {
      return Response.json({error: "Blog not found"}, {status: 404})
    }

    return Response.json(blog)

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}

export async function DELETE(req,{params}){

  try {

    await connectDB()

    let blog

    if (isValidObjectId(params.slug)) {
      blog = await Blog.findByIdAndDelete(params.slug)
    } else {
      blog = await Blog.findOneAndDelete({ slug: params.slug })
    }

    if (!blog) {
      return Response.json({error: "Blog not found"}, {status: 404})
    }

    return Response.json({message: "Blog deleted successfully"})

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}
