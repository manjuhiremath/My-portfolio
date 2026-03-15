import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title featuredImage')
      .lean();
    
    return Response.json({
      blogs: blogs.map(b => ({
        title: b.title,
        featuredImage: b.featuredImage,
        type: typeof b.featuredImage
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message });
  }
}
