import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages: number[] = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl mt-6">
      <div className="text-xs text-slate-400">
        Showing <span className="font-semibold text-slate-200">{startIdx}</span> to{' '}
        <span className="font-semibold text-slate-200">{endIdx}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-850 disabled:hover:text-slate-400 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                currentPage === 1
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
              }`}
            >
              1
            </button>
            {startPage > 2 && <span className="text-xs text-slate-500 px-1">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
              currentPage === p
                ? 'bg-brand-600 text-white shadow'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-xs text-slate-500 px-1">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                currentPage === totalPages
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-850 disabled:hover:text-slate-400 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default Pagination;
