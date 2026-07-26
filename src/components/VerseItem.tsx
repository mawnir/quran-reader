import React from 'react';

interface VerseItemProps {
  verse: string;
  number: number;
  surahName?: string;
}

export const VerseItem: React.FC<VerseItemProps> = ({ verse, number, surahName }) => {
  return (
    <div className="bg-bg-surface p-4 sm:p-6 rounded-2xl shadow-xs border border-border-subtle mb-4 transition-all">
      {surahName && (
        <div className="flex justify-between items-center mb-3 text-xs sm:text-sm text-accent font-medium border-b border-border-subtle pb-2">
          <span>سورة {surahName}</span>
          <span>الآية {new Intl.NumberFormat('ar-EG').format(number)}</span>
        </div>
      )}
      <div className="flex gap-3 sm:gap-4 items-start">
        {!surahName && (
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-accent/40 text-accent bg-accent/10 flex items-center justify-center text-xs font-sans mt-1">
            {new Intl.NumberFormat('ar-EG').format(number)}
          </div>
        )}
        <div className="flex-grow">
          <p className="text-xl sm:text-2xl md:text-3xl leading-[2.2] sm:leading-[2.5] text-text-base font-hafs-uthmanic text-right">
            {verse}
          </p>
        </div>
      </div>
    </div>
  );
};
