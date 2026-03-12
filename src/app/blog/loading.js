export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-500">
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 overflow-hidden shadow-sm">
              <div className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="p-5 space-y-4">
                <div className="h-4 w-1/4 rounded bg-orange-100 dark:bg-orange-900/20 animate-pulse" />
                <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


