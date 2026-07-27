import React from 'react';
import { ArrowRight, BookOpen, Moon, Sun, Bookmark } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface HeaderProps {
  surahTitle?: string | null;
  onGoHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  bookmark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  surahTitle,
  onGoHome,
  theme,
  onToggleTheme,
  bookmark
}) => {

  return (
    <header className="bg-bg-surface/95 backdrop-blur-md border-b border-border-subtle sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {surahTitle ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={onGoHome}
              className="flex items-center justify-center w-10 h-10 rounded-full text-text-muted hover:text-text-heading hover:bg-bg-hover transition-colors border border-border-subtle flex-shrink-0"
              aria-label="الرجوع للقائمة"
              title="الرجوع لقائمة السور"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
              {bookmark ?
                <span className="text-lg sm:text-2xl font-bold font-hafs-uthmanic text-accent truncate">
                  {surahTitle}
                </span>
                :
                <span className="text-lg sm:text-2xl font-bold font-hafs-uthmanic text-accent truncate">
                  سورة {surahTitle.replace('سُوْرَةُ ', '')}
                </span>
              }
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-text-heading cursor-pointer hover:opacity-90 transition-opacity"
            onClick={onGoHome}
          >
            <div className="">
              {/* <BookOpen className="w-5 h-5" /> */}
              <img src="/quran-icon-512.png" alt="Logo" className="w-10 h-10 border-2 border-accent/20 rounded-xl" />
            </div>
            <span className="font-bold tracking-tight">القرآن الكريم</span>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full border border-border-subtle text-text-muted hover:text-text-heading hover:bg-bg-hover transition-colors flex-shrink-0"
            aria-label="تغيير المظهر"
            title="تغيير المظهر"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
