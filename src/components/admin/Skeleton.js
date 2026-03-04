'use client';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-slate-200 rounded mb-3"></div>
          <div className="h-8 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="h-5 w-32 bg-slate-200 rounded"></div>
      </div>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded"></div>
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-100 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ items = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
            <div className="h-3 w-32 bg-slate-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return (
    <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-slate-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        ></div>
      ))}
    </div>
  );
}
