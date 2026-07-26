import React from 'react';
import { ArrowRight, BookOpen, Moon, Sun, Bookmark } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface HeaderProps {
  surahTitle?: string | null;
  onGoHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  surahTitle,
  onGoHome,
  theme,
  onToggleTheme,
}) => {
  const navigate = useNavigate();
  const handleBookmark = () => {
    navigate({
      to: '/bookmarks',
    });
  };
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
              <span className="text-lg sm:text-2xl font-bold font-hafs-uthmanic text-accent truncate">
                سورة {surahTitle.replace('سُوْرَةُ ', '')}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-text-heading cursor-pointer hover:opacity-90 transition-opacity"
            onClick={onGoHome}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              <BookOpen className="w-5 h-5" />
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

          <button
            onClick={handleBookmark}
            className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full border border-border-subtle text-text-muted hover:text-text-heading hover:bg-bg-hover transition-colors flex-shrink-0"
            aria-label="bookmarks"
            title="bookmarks"
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
