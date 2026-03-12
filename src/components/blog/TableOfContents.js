'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  if (!headings?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 backdrop-blur-md">
      <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Outline</h2>
      <ul className="space-y-2.5">
        {headings
          .filter((item) => item.level <= 3)
          .map((item) => (
            <li key={item.id} className="relative">
              {activeId === item.id && (
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-orange-500 rounded-full animate-in fade-in duration-300" />
              )}
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`block text-[11px] font-bold transition-all leading-tight ${
                  activeId === item.id
                    ? 'text-slate-900 dark:text-white translate-x-0.5'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                } ${item.level === 3 ? 'pl-3 opacity-80 font-medium' : ''}`}
              >
                {item.text}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}
