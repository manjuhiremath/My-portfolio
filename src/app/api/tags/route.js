import { connectDB } from "@/lib/mongodb"
import Tag from "@/models/Tag"
import Blog from "@/models/Blog"
import Category from "@/models/Category"

export async function GET(req) {
  try {
    await connectDB()
    const tagsRaw = await Tag.find().populate('categories').sort({ name: 1 }).lean()

    // Get blog counts and views per tag
    const stats = await Blog.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          views: { $sum: { $ifNull: ["$views", 0] } }
        }
      }
    ])

    const statsMap = {}
    stats.forEach(s => {
      if (s._id) statsMap[s._id.toString()] = s
    })

    const tags = tagsRaw.map(tag => {
      const tagStats = statsMap[tag._id.toString()] || { count: 0, views: 0 }
      return {
        ...tag,
        blogCount: tagStats.count,
        totalViews: tagStats.views
      }
    })

    return Response.json(tags)
  } catch (error) {
    console.error('[API /tags] GET Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectDB()
    const data = await req.json()
    
    const slug = (data.slug || data.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    
    const tag = await Tag.create({
      name: data.name,
      slug: slug,
      color: data.color || "#6366f1",
      categories: data.categoryId ? [data.categoryId] : (data.categories || []),
    })

    // If category provided, add tag to category's tags array
    if (data.categoryId) {
      await Category.findByIdAndUpdate(data.categoryId, {
        $addToSet: { tags: tag._id }
      })
    }

    return Response.json(tag)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
