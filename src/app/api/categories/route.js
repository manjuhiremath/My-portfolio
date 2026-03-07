import {connectDB} from "@/lib/mongodb"
import Tag from "@/models/Tag"
import Category from "@/models/Category"
import Blog from "@/models/Blog"

export async function GET(){

  try {

    await connectDB()

    const categoriesRaw = await Category.find()
      .populate({ path: 'tags', select: 'name slug', strictPopulate: false })
      .sort({ name: 1 })
      .lean()

    // Get blog counts and views per category
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          views: { $sum: { $ifNull: ["$views", 0] } }
        }
      }
    ])

    const statsMap = {}
    stats.forEach(s => {
      if (s._id) statsMap[s._id.toString()] = s
    })

    const categories = categoriesRaw.map(cat => {
      const catStats = statsMap[cat._id.toString()] || { count: 0, views: 0 }
      return {
        ...cat,
        blogCount: catStats.count,
        totalViews: catStats.views
      }
    })

    return Response.json(categories || [])

  } catch (error) {
    console.error('[API /categories] GET Error:', error)
    return Response.json({error: error.message}, {status: 500})

  }

}

export async function POST(req){

  try {

    await connectDB()

    const data = await req.json()

    // Support tags array in the request
    const { tags, ...categoryData } = data

    const category = await Category.create(categoryData)

    // If tags are provided, assign them
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await Category.updateMany(
        { _id: { $in: tags } },
        { $push: { tags: category._id } }
      )
    }

    const populated = await Category.findById(category._id).populate({ path: 'tags', select: 'name slug', strictPopulate: false })

    return Response.json(populated)

  } catch (error) {
    console.error('[API /categories] POST Error:', error)
    return Response.json({error: error.message}, {status: 500})

  }

}