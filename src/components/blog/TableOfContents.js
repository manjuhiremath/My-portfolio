'use client';

import { useEffect, useState, useRef, Fragment } from 'react';

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');
  const [progress, setProgress] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync TOC scroll position with active heading
  useEffect(() => {
    if (!activeId || !scrollContainerRef.current) return;

    // Small delay to ensure React has finished rendering the 'active' class
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      const activeLink = container.querySelector(`.toc-link.active`);
      
      if (activeLink) {
        const containerRect = container.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        
        // Calculate the position of the link relative to the container's top
        const relativeTop = linkRect.top - containerRect.top + container.scrollTop;
        
        // Target position to center the link
        const targetTop = relativeTop - (container.offsetHeight / 2) + (linkRect.height / 2);

        container.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  if (!headings?.length) return null;

  const filtered = headings.filter((h) => h.level <= 3);
  const activeIndex = filtered.findIndex((h) => h.activeId === activeId);

  return (
    <aside className="toc-root">
      <style>{`
        .toc-root {
          --toc-bg: #fafaf8;
          --toc-border: #e8e4dc;
          --toc-text-muted: #a09888;
          --toc-text-base: #6b6055;
          --toc-text-active: #1a1614;
          --toc-accent: #c4622d;
          --toc-accent-light: #fdf0e8;
          --toc-track: #ede9e0;
          --toc-line: #ddd8cc;
          font-family: var(--font-mono), monospace;
        }

        @media (prefers-color-scheme: dark) {
          .toc-root {
            --toc-bg: #141210;
            --toc-border: #2a2520;
            --toc-text-muted: #5a534a;
            --toc-text-base: #8a8070;
            --toc-text-active: #f0ebe2;
            --toc-accent: #e07840;
            --toc-accent-light: #1f1610;
            --toc-track: #1e1a16;
            --toc-line: #2a2520;
          }
        }

        .toc-wrap {
          position: relative;
          background: var(--toc-bg);
          border: 1px solid var(--toc-border);
          border-radius: 4px;
          padding: 20px 0 16px;
          max-height: 60vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #f97316 transparent;
        }

        /* Custom Scrollbar for Webkit */
        .toc-wrap::-webkit-scrollbar {
          width: 2px;
        }
        .toc-wrap::-webkit-scrollbar-track {
          background: transparent;
        }
        .toc-wrap::-webkit-scrollbar-thumb {
          background-color: #f97316;
          border-radius: 20px;
        }

        /* Left progress bar */
        .toc-progress-track {
          position: absolute;
          left: 0;
          top: 0;
          width: 2px;
          height: 100%;
          background: var(--toc-track);
        }
        .toc-progress-fill {
          width: 100%;
          background: var(--toc-accent);
          transition: height 0.1s linear;
          border-radius: 0 0 2px 2px;
        }

        /* Header */
        .toc-header {
          padding: 0 20px 14px;
          border-bottom: 1px solid var(--toc-line);
          margin-bottom: 14px;
        }
        .toc-label {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--toc-text-muted);
          margin: 0 0 4px;
        }
        .toc-progress-text {
          font-family: var(--font-display), serif;
          font-size: 11px;
          font-weight: 400;
          color: var(--toc-accent);
          letter-spacing: 0.01em;
        }

        /* List */
        .toc-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        /* Item */
        .toc-item {
          position: relative;
        }

        .toc-link {
          display: flex;
          align-items: baseline;
          gap: 8px;
          padding: 5px 20px 5px 22px;
          text-decoration: none;
          transition: background 0.15s ease;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .toc-link:hover {
          background: var(--toc-accent-light);
        }
        .toc-link.active {
          background: var(--toc-accent-light);
        }

        /* Active accent bar */
        .toc-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: trangrayY(-50%);
          width: 2px;
          height: 60%;
          background: var(--toc-accent);
          border-radius: 0 1px 1px 0;
        }

        /* Number */
        .toc-num {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          font-weight: 400;
          color: var(--toc-text-muted);
          min-width: 18px;
          flex-shrink: 0;
          padding-top: 1px;
          transition: color 0.2s;
        }
        .toc-link.active .toc-num {
          color: var(--toc-accent);
        }

        /* Text */
        .toc-text {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          line-height: 1.45;
          transition: color 0.2s;
          color: var(--toc-text-base);
        }
        .toc-link:hover .toc-text {
          color: var(--toc-text-active);
        }
        .toc-link.active .toc-text {
          color: var(--toc-text-active);
          font-weight: 500;
        }

        /* Level 2 */
        .toc-item.level-2 .toc-link {
          padding-left: 34px;
        }
        .toc-item.level-2 .toc-text {
          font-size: 10.5px;
          opacity: 0.85;
        }

        /* Level 3 */
        .toc-item.level-3 .toc-link {
          padding-left: 46px;
        }
        .toc-item.level-3 .toc-text {
          font-size: 10px;
          opacity: 0.7;
        }

        /* Section dividers between h2 groups */
        .toc-divider {
          height: 1px;
          background: var(--toc-line);
          margin: 6px 20px;
          opacity: 0.6;
        }

        /* Footer count */
        .toc-footer {
          padding: 12px 20px 0;
          border-top: 1px solid var(--toc-line);
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .toc-count {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--toc-text-muted);
        }
        .toc-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--toc-accent);
          opacity: 0.5;
        }
      `}</style>

      <div className="toc-wrap" ref={scrollContainerRef}>
        {/* Left progress track */}
        <div className="toc-progress-track">
          <div
            className="toc-progress-fill"
            style={{ height: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="toc-header">
          <p className="toc-label">Contents</p>
          <span className="toc-progress-text">{Math.round(progress)}% read</span>
        </div>

        {/* List */}
        <ul className="toc-list">
          {filtered.map((item, i) => {
            const isActive = activeId === item.id;
            const prevItem = filtered[i - 1];
            const showDivider =
              i > 0 && item.level === 2 && prevItem?.level !== 3;

            // sequential number for h2s only
            const h2Index =
              item.level === 2
                ? filtered.filter((h, j) => h.level === 2 && j <= i).length
                : null;

            return (
              <div key={item.id}>
                {showDivider && <div className="toc-divider" />}
                <li
                  className={`toc-item level-${item.level}`}
                >
                  <a
                    href={`#${item.id}`}
                    className={`toc-link${isActive ? ' active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById(item.id)
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {item.level === 1 && (
                      <span className="toc-num">§</span>
                    )}
                    {item.level === 2 && (
                      <span className="toc-num">
                        {String(h2Index).padStart(2, '0')}
                      </span>
                    )}
                    {item.level === 3 && (
                      <span className="toc-num">—</span>
                    )}
                    <span className="toc-text">{item.text}</span>
                  </a>
                </li>
              </div>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="toc-footer">
          <span className="toc-count">
            {filtered.length} section{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="toc-dot" />
        </div>
      </div>
    </aside>
  );
}