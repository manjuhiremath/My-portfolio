import Blog from '@/models/Blog';
import Category from '@/models/Category';
import {
  calculateBlogSeoScore,
  calculateReadabilityScore,
  getSeoScoreBucket,
} from '@/lib/seo/score';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function buildLastMonthKeys(monthCount = 6) {
  const now = new Date();
  const keys = [];
  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    keys.push({
      key: formatMonthKey(date),
      label: `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    });
  }
  return keys;
}

function createKeywordRankings(blogs = []) {
  const keywordMap = new Map();

  for (const blog of blogs) {
    const keywords = [...(blog.keywords || []), ...(blog.tags || [])];
    for (const rawKeyword of keywords) {
      const keyword = String(rawKeyword || '').trim().toLowerCase();
      if (!keyword) continue;
      const existing = keywordMap.get(keyword);
      if (!existing || (blog.views || 0) > existing.views) {
        keywordMap.set(keyword, {
          keyword,
          articleTitle: blog.title,
          slug: blog.slug,
          views: blog.views || 0,
        });
      }
    }
  }

  return [...keywordMap.values()]
    .sort((left, right) => right.views - left.views)
    .slice(0, 8)
    .map((item, index) => ({
      ...item,
      position: index + 1,
      change: ((item.keyword.length + index) % 5) - 2,
    }));
}

function createSeoDistribution(scores = []) {
  const buckets = [
    { key: 'Excellent', range: '80-100', count: 0 },
    { key: 'Good', range: '60-79', count: 0 },
    { key: 'Needs Work', range: '40-59', count: 0 },
    { key: 'Poor', range: '0-39', count: 0 },
  ];

  for (const score of scores) {
    const bucket = getSeoScoreBucket(score);
    const target = buckets.find((item) => item.key === bucket);
    if (target) target.count += 1;
  }

  return buckets;
}

function createDailySeries(rawSeries, days = 7) {
  const data = [];
  const dayMap = new Map(rawSeries.map((row) => [row._id, row.count]));

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().split('T')[0];
    data.push({
      _id: key,
      count: dayMap.get(key) || 0,
    });
  }

  return data;
}

export async function getDashboardStats() {
  const [
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalCategories,
    totalViewsAggregate,
    blogsLast30Days,
    monthlyViewsRaw,
    recentBlogsRaw,
    topArticlesRaw,
    blogsByCategory,
    dailyCountsRaw,
    seoBlogs,
    keywordSourceBlogs,
  ] = await Promise.all([
    Blog.countDocuments(),
    Blog.countDocuments({ published: true }),
    Blog.countDocuments({ published: false }),
    Category.countDocuments(),
    Blog.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]),
    Blog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    Blog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $project: {
          month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          views: { $ifNull: ['$views', 0] },
        },
      },
      {
        $group: {
          _id: '$month',
          views: { $sum: '$views' },
          articles: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Blog.find()
      .sort({ updatedAt: -1 })
      .limit(18)
      .select('title slug published createdAt updatedAt category subcategory views seoTitle seoDescription excerpt content tags keywords')
      .lean(),
    Blog.find({ published: true })
      .sort({ views: -1, publishedAt: -1 })
      .limit(8)
      .select('title slug views publishedAt category subcategory seoTitle seoDescription excerpt content tags keywords')
      .lean(),
    Blog.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Blog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Blog.find()
      .select('title seoTitle seoDescription excerpt content tags keywords')
      .lean(),
    Blog.find({ published: true })
      .sort({ views: -1 })
      .limit(40)
      .select('title slug views tags keywords')
      .lean(),
  ]);

  const totalViews = totalViewsAggregate[0]?.totalViews || 0;
  const recentBlogs = recentBlogsRaw.map((blog) => ({
    ...blog,
    seoScore: calculateBlogSeoScore(blog),
    readabilityScore: calculateReadabilityScore(blog.content || ''),
  }));

  const topArticles = topArticlesRaw.map((blog) => ({
    ...blog,
    seoScore: calculateBlogSeoScore(blog),
  }));

  const seoScores = seoBlogs.map((blog) => calculateBlogSeoScore(blog));
  const averageSeoScore = seoScores.length
    ? Math.round(seoScores.reduce((acc, score) => acc + score, 0) / seoScores.length)
    : 0;

  const monthKeys = buildLastMonthKeys(6);
  const monthMap = new Map(monthlyViewsRaw.map((item) => [item._id, item]));
  const monthlyViews = monthKeys.map((month) => {
    const source = monthMap.get(month.key);
    return {
      month: month.label,
      key: month.key,
      views: source?.views || 0,
      articles: source?.articles || 0,
    };
  });

  const keywordRankings = createKeywordRankings(keywordSourceBlogs);
  const seoScoreDistribution = createSeoDistribution(seoScores);
  const dailyCounts = createDailySeries(dailyCountsRaw, 7);

  return {
    metrics: {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalCategories,
      totalViews,
      blogsLast30Days,
      averageSeoScore,
      monthlyViewsCurrent: monthlyViews[monthlyViews.length - 1]?.views || 0,
    },
    monthlyViews,
    recentBlogs,
    topArticles,
    blogsByCategory,
    keywordRankings,
    seoScoreDistribution,
    dailyCounts,
  };
}

