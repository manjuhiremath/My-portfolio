export const metadata = {
  title: 'Blog | Tech, Design & Business Insights',
  description: 'Explore insightful articles on technology, web development, AI, UI/UX design, and business. Get the latest tips, tutorials, and trends from industry experts.',
  keywords: ['blog', 'technology', 'web development', 'AI', 'design', 'business', 'tutorials', 'insights', 'programming'],
  verification: {
    google: '2JGk2Vu-1qinl19o3imuPSwhZHcSP7i0zt4ovjzcIpc',
  },
  openGraph: {
    title: 'Blog | Tech, Design & Business Insights',
    description: 'Explore insightful articles on technology, web development, AI, UI/UX design, and business.',
    type: 'website',
    url: '/blog',
    siteName: 'Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Tech, Design & Business Insights',
    description: 'Explore insightful articles on technology, web development, AI, UI/UX design, and business.',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function BlogLayout({ children }) {
  return children;
}