import {connectDB} from "@/lib/mongodb"
import Blog from "@/models/Blog"
import mongoose from "mongoose"

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id
}

export async function GET(req,{params}){

  try {

    await connectDB()

    let blog

    if (isValidObjectId(params.slug)) {
      // It's an ID, find by ID
      blog = await Blog.findById(params.slug)
    } else {
      // It's a slug, find by slug
      blog = await Blog.findOne({slug: params.slug})
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

    const blog = await Blog.findByIdAndUpdate(params.slug, data, {
      new: true,
      runValidators: true
    })

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

    const blog = await Blog.findByIdAndDelete(params.slug)

    if (!blog) {
      return Response.json({error: "Blog not found"}, {status: 404})
    }

    return Response.json({message: "Blog deleted successfully"})

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}