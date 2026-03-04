export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b border-slate-200 bg-white" />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
          <div className="h-10 w-full rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-[300px] md:h-[400px] rounded-2xl bg-slate-200 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="h-4 w-full rounded bg-slate-200 animate-pulse" />
          ))}
        </div>
      </article>
    </div>
  );
}

