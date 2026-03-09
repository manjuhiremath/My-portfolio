import {connectDB} from "@/lib/mongodb"
import Blog from "@/models/Blog"
import Category from "@/models/Category"
import Tag from "@/models/Tag"
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
    
    if (published === 'all') {
      // no published filter
    } else if (published === null || published === '') {
      query.published = true
    } else {
      query.published = published === 'true'
    }
    
    // Handle category - can be ObjectId or string slug
    if (category && category !== 'all') {
      // Check if it's a valid ObjectId
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category)
      if (isObjectId) {
        query.category = category
      } else {
        // It's a slug - find category first
        const cat = await Category.findOne({ slug: category.toLowerCase() })
        if (cat) {
          query.category = cat._id
        }
      }
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
   
    // Use lean to avoid populate issues with legacy string categories
    // Only populate tags if they contain valid ObjectIds
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category')
      .lean()
    
    // Manually populate tags only if they are valid ObjectIds
    for (const blog of blogs) {
      if (blog.tags && blog.tags.length > 0) {
        const objectIdTags = blog.tags.filter(t => /^[0-9a-fA-F]{24}$/.test(String(t)))
        if (objectIdTags.length > 0) {
          const populatedTags = await Tag.find({ _id: { $in: objectIdTags } }).lean()
          blog.tags = populatedTags
        }
        // Keep string tags as-is if no valid ObjectIds found
      }
    }
    
   const total = await Blog.countDocuments(query)
   
   return Response.json({
     success: true,
     blogs: JSON.parse(JSON.stringify(blogs)),
     pagination: {
       page,
       limit,
       total,
       totalPages: Math.ceil(total / limit)
     }
   })

  } catch (error) {
   console.error('[API /blogs] Error:', error)
   return Response.json({success: false, error: error.message || 'Failed to fetch blogs'}, {status: 500})

  }

}

export async function POST(req){

 try {

  await connectDB()

  const data = await req.json()

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
  }

  const blog = await Blog.create(data)
  
  // Populate before returning
  await blog.populate('category')
  await blog.populate('tags')

  return Response.json(blog)

  } catch (error) {

   return Response.json({error: error.message}, {status: 500})

  }
}
