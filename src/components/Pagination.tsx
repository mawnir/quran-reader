import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-md bg-bg-surface/95 backdrop-blur-md border border-border-subtle p-2.5 rounded-full shadow-lg flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={currentPage === 0}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-text-heading text-xs sm:text-sm font-medium"
      >
        <ChevronRight className="w-5 h-5" />
        <span className="hidden xs:inline">السابقة</span>
      </button>

      <div className="text-xs sm:text-sm font-medium text-text-muted flex items-center gap-2">
        <span>صفحة {new Intl.NumberFormat('ar-EG').format(currentPage + 1)}</span>
        <span className="w-1 h-1 rounded-full bg-border-input" />
        <span>
          {new Intl.NumberFormat('ar-EG').format(currentPage + 1)} / {new Intl.NumberFormat('ar-EG').format(totalPages)}
        </span>
      </div>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages - 1}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-text-heading text-xs sm:text-sm font-medium"
      >
        <span className="hidden xs:inline">التالية</span>
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
};
