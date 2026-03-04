import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();

    // Get blog counts
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ published: true });
    const draftBlogs = await Blog.countDocuments({ published: false });
    const totalCategories = await Category.countDocuments();

    // Get recent blogs
    const recentBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title slug published createdAt updatedAt category subcategory')
      .lean();

    // Get blogs by category
    const blogsByCategory = await Blog.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get blogs created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const blogsLast7Days = await Blog.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get daily blog counts for chart
    const dailyCounts = await Blog.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return new Response(
      JSON.stringify({
        metrics: {
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalCategories,
          blogsLast7Days
        },
        recentBlogs,
        blogsByCategory,
        dailyCounts
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch dashboard stats' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
