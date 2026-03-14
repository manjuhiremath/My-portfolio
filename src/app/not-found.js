import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 relative">
          <h1 className="text-9xl font-black text-gray-200 dark:text-gray-500 select-none" style={{ fontFamily: 'var(--font-display), serif' }}>
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-orange-500 text-white px-4 py-1 rounded-lg font-bold text-sm uppercase tracking-widest shadow-xl transform -rotate-3">
              Page Not Found
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'var(--font-display), serif' }}>
          Lost in the Digital Wild?
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          The article or page you&apos;re searching for seems to have moved or doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/blog" 
            className="w-full sm:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 hover:-trangray-y-0.5"
          >
            Explore Blog
          </Link>
          <Link 
            href="/" 
            className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
          >
            Back Home
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 dark:text-gray-700 uppercase tracking-[0.4em] font-black">
            The Digital Manifesto Editorial
          </p>
        </div>
      </div>
    </div>
  );
}
