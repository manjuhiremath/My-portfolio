import { connectDB } from '@/lib/mongodb';
import { getDashboardStats } from '@/lib/admin/dashboard-stats';

export async function GET() {
  try {
    await connectDB();
    const stats = await getDashboardStats();

    return new Response(
      JSON.stringify({
        success: true,
        data: stats,
        ...stats,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[admin.dashboard.stats] failed', {
      message: error?.message,
      stack: error?.stack,
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch dashboard stats',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
