import React from 'react';
import { ChapterInfo } from '../utils/types';

interface SurahCardProps {
  chapter: ChapterInfo;
  totalVerses: number;
  onSelect: (chapter: ChapterInfo) => void;
}

export const SurahCard: React.FC<SurahCardProps> = ({ chapter, totalVerses, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(chapter)}
      className="bg-bg-surface p-4 rounded-2xl border border-border-subtle hover:border-accent/60 hover:bg-bg-hover transition-all group flex items-center justify-between text-right shadow-xs active:scale-[0.99]"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
          <div className="absolute inset-0 bg-bg-base border border-border-subtle rounded-xl rotate-45 group-hover:rotate-0 transition-transform duration-300" />
          <span className="relative z-10 text-xs sm:text-sm text-text-heading font-bold font-sans">
            {new Intl.NumberFormat('ar-EG').format(chapter.chapter)}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-text-heading font-hafs-uthmanic truncate">
            سورة {chapter.arabicname.replace('سُوْرَةُ ', '')}
          </h3>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5 font-sans">
            <span>{chapter.revelation === 'Meccan' ? 'مكية' : 'مدنية'}</span>
            <span>•</span>
            <span>{new Intl.NumberFormat('ar-EG').format(totalVerses)} آية</span>
          </p>
        </div>
      </div>

      <span className="text-xs text-text-muted font-sans group-hover:text-accent transition-colors">
        {chapter.englishname}
      </span>
    </button>
  );
};
