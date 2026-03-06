'use client';

import Link from 'next/link';

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let index = 1; index <= totalPages; index += 1) {
      pages.push(index);
    }
    return pages;
  }

  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, '...', totalPages);
    return pages;
  }

  if (currentPage >= totalPages - 2) {
    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    return pages;
  }

  pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  return pages;
}

export default function Pagination({ currentPage, totalPages, baseUrl }) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : '#'}
        aria-disabled={currentPage <= 1}
        className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors ${
          currentPage <= 1
            ? 'pointer-events-none border-slate-200 text-slate-400'
            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        Previous
      </Link>

      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-xs text-slate-500">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={`${baseUrl}?page=${page}`}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors ${
              page === currentPage
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : '#'}
        aria-disabled={currentPage >= totalPages}
        className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors ${
          currentPage >= totalPages
            ? 'pointer-events-none border-slate-200 text-slate-400'
            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        Next
      </Link>
    </nav>
  );
}

