import {connectDB} from "@/lib/mongodb"
import Blog from "@/models/Blog"
import { normalizeFeaturedImageUrl } from "@/lib/cloudinary"

export async function GET(req){
  try {
    await connectDB()
    
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 100
    const published = searchParams.get('published')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const query = {}
    
    // Default to fetching only published blogs for public API
    if (published === null || published === '') {
      query.published = true
    } else {
      query.published = published === 'true'
    }
    
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') }
    }
   
   if (startDate || endDate) {
     query.createdAt = {}
     if (startDate) {
       query.createdAt.$gte = new Date(startDate)
     }
     if (endDate) {
       const end = new Date(endDate)
       end.setHours(23, 59, 59, 999)
       query.createdAt.$lte = end
     }
   }
   
   const skip = (page - 1) * limit
   
   const blogs = await Blog.find(query)
     .sort({ createdAt: -1 })
     .skip(skip)
     .limit(limit)
   
   const total = await Blog.countDocuments(query)
   
   return Response.json({
     blogs,
     pagination: {
       page,
       limit,
       total,
       totalPages: Math.ceil(total / limit)
     }
   })

 } catch (error) {

  return Response.json({error: error.message}, {status: 500})

 }

}

export async function POST(req){

 try {

  await connectDB()

  const data = await req.json()

  if (data.featuredImage) {
    data.featuredImage = await normalizeFeaturedImageUrl(data.featuredImage, "blog-featured")
  }

  if (data.published === true) {
    data.publishedAt = new Date()
  }

  const blog = await Blog.create(data)

  return Response.json(blog)

 } catch (error) {

  return Response.json({error: error.message}, {status: 500})

 }

}
