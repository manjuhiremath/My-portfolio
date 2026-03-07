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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">On this page</h2>
      <ul className="mt-3 space-y-2">
        {headings
          .filter((item) => item.level <= 3)
          .map((item) => (
            <li key={item.id} className="text-xs">
              <a
                href={`#${item.id}`}
                className={`block truncate transition-colors duration-200 ${
                  activeId === item.id
                    ? 'font-medium text-orange-600'
                    : 'text-slate-600 hover:text-orange-600'
                } ${item.level === 3 ? 'pl-3' : ''}`}
              >
                {item.text}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}
