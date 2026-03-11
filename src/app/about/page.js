import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: "About Us | Manjunath M",
  description: "Learn more about Manjunath M and our mission to provide high-quality technology and science content.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">
          About Us
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Welcome to <strong>manjuhiremath.in</strong>, your premier destination for insightful analysis on technology, science, and global trends.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Our mission is to provide accurate, up-to-date, and high-quality content that helps our readers navigate the rapidly evolving world of technology and science. From the latest Apple launches to celestial events and global economic shifts, we aim to deliver information that matters.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Who is Manjunath M?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Manjunath M is a Full Stack Developer and technology enthusiast with a passion for building scalable web applications and sharing knowledge. With years of experience in the MERN stack (MongoDB, Express, React, Node.js) and Next.js, Manjunath brings a technical perspective to the blog content.
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 my-10 border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">What We Cover</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Latest Gadgets and Tech News
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Science and Astronomy Updates
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Programming and Web Development
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Global Policy and Economic Analysis
              </li>
            </ul>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Our Commitment</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We are committed to editorial integrity and transparency. All our articles are researched and written with the goal of providing value to our community. We believe in the power of information to empower individuals and drive progress.
          </p>
          
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-bold uppercase tracking-wider text-sm">
              ← Back to Home
            </Link>
            <Link href="/contact" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors uppercase tracking-widest">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
