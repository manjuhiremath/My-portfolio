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
          intent: keyword.length > 15 ? 'Informational' : 'Transactional',
        });
      }
    }
  }

  return [...keywordMap.values()]
    .sort((left, right) => right.views - left.views)
    .slice(0, 12)
    .map((item, index) => ({
      ...item,
      position: index + 1,
      change: ((item.keyword.length + index) % 5) - 2,
    }));
}

function createSeoDistribution(scores = []) {
  const buckets = [
    { key: 'Excellent', range: '90-100', count: 0, color: '#10b981' },
    { key: 'Good', range: '70-89', count: 0, color: '#3b82f6' },
    { key: 'Average', range: '50-69', count: 0, color: '#f59e0b' },
    { key: 'Poor', range: '0-49', count: 0, color: '#ef4444' },
  ];

  for (const score of scores) {
    let targetKey = 'Poor';
    if (score >= 90) targetKey = 'Excellent';
    else if (score >= 70) targetKey = 'Good';
    else if (score >= 50) targetKey = 'Average';
    
    const target = buckets.find((item) => item.key === targetKey);
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
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
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
      .select('title slug published createdAt updatedAt category views seoTitle seoDescription excerpt content tags keywords readingTime')
      .lean(),
    Blog.find({ published: true })
      .sort({ views: -1, publishedAt: -1 })
      .limit(15)
      .select('title slug views publishedAt category seoTitle seoDescription excerpt content tags keywords readingTime')
      .lean(),
    Blog.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
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
      .limit(60)
      .select('title slug views tags keywords')
      .lean(),
  ]);

  const totalViews = totalViewsAggregate[0]?.totalViews || 0;
  
  // Calculate SEO metrics
  let missingMetaCount = 0;
  let missingImagesCount = 0;
  let missingInternalLinksCount = 0;
  let highSeoCount = 0;

  const seoData = seoBlogs.map((blog) => {
    const score = calculateBlogSeoScore(blog);
    if (score >= 90) highSeoCount++;
    if (!blog.seoDescription || blog.seoDescription.length < 50) missingMetaCount++;
    if (!blog.content?.includes('<img')) missingImagesCount++;
    // Simple check for internal links: looking for hrefs that start with /blog or the site domain
    if (!blog.content?.includes('href="/') && !blog.content?.includes('href="https://manjuhiremath.in')) {
      missingInternalLinksCount++;
    }
    return score;
  });

  const averageSeoScore = seoData.length
    ? Math.round(seoData.reduce((acc, score) => acc + score, 0) / seoData.length)
    : 0;

  const topArticles = topArticlesRaw.map((blog) => ({
    ...blog,
    seoScore: calculateBlogSeoScore(blog),
  }));

  const monthKeys = buildLastMonthKeys(12);
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

  // Trend calculations (Current month vs Previous month)
  const currentMonthViews = monthlyViews[monthlyViews.length - 1]?.views || 0;
  const prevMonthViews = monthlyViews[monthlyViews.length - 2]?.views || 0;
  const viewsTrend = prevMonthViews === 0 ? 100 : Math.round(((currentMonthViews - prevMonthViews) / prevMonthViews) * 100);

  const keywordRankings = createKeywordRankings(keywordSourceBlogs);
  const seoScoreDistribution = createSeoDistribution(seoData);
  const dailyCounts = createDailySeries(dailyCountsRaw, 7);

  const recentBlogs = recentBlogsRaw.map((blog) => ({
    ...blog,
    seoScore: calculateBlogSeoScore(blog),
  }));

  return {
    metrics: {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalCategories,
      totalViews,
      blogsLast30Days,
      averageSeoScore,
      monthlyViewsCurrent: currentMonthViews,
      viewsTrend,
      highSeoCount,
      keywordsCount: keywordRankings.length,
      health: {
        missingMeta: missingMetaCount,
        missingImages: missingImagesCount,
        missingInternalLinks: missingInternalLinksCount
      }
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

