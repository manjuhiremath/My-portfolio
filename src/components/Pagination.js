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
    <nav className="mt-16 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : '#'}
        aria-disabled={currentPage <= 1}
        className={`inline-flex h-12 items-center rounded-2xl border px-6 text-[10px] font-black uppercase tracking-widest transition-all ${
          currentPage <= 1
            ? 'pointer-events-none border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-700'
            : 'border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 dark:border-gray-700 dark:text-gray-400'
        }`}
      >
        Prev
      </Link>

      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
        {pageNumbers.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-xs font-bold text-gray-400">
              ···
            </span>
          ) : (
            <Link
              key={page}
              href={`${baseUrl}?page=${page}`}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl text-[10px] font-black transition-all ${
                page === currentPage
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:text-orange-500'
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      <Link
        href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : '#'}
        aria-disabled={currentPage >= totalPages}
        className={`inline-flex h-12 items-center rounded-2xl border px-6 text-[10px] font-black uppercase tracking-widest transition-all ${
          currentPage >= totalPages
            ? 'pointer-events-none border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-700'
            : 'border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 dark:border-gray-700 dark:text-gray-400'
        }`}
      >
        Next
      </Link>
    </nav>
  );
}

