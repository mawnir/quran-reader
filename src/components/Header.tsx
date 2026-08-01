import React from 'react';
import { ArrowRight, Moon, Sun, Settings } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useSettingsSheet } from '../context/SettingsSheetContext';

interface HeaderProps {
  surahTitle?: string | null;
  onGoHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme?: () => void;
  bookmark?: boolean;
  showSettings?: boolean;
  progressPercent?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  surahTitle,
  onGoHome,
  theme,
  onToggleTheme,
  bookmark,
  showSettings,
  progressPercent,
}) => {
  const navigate = useNavigate();
  const handleSettings = () => navigate({ to: '/settings' });
  const { open } = useSettingsSheet();
  return (
    <header className="bg-bg-surface/95 backdrop-blur-md border-b border-border-subtle sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {surahTitle ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <IconButton onClick={onGoHome} label="الرجوع لقائمة السور">
              <ArrowRight className="w-5 h-5" />
            </IconButton>

            <span className="text-lg sm:text-2xl font-bold font-hafs-uthmanic text-accent truncate">
              {bookmark ? surahTitle : `سورة ${surahTitle.replace('سُوْرَةُ ', '')}`}
            </span>
            {progressPercent != null && (
              <span className="text-md font-medium text-accent tabular-nums" dir="ltr">
                {new Intl.NumberFormat('ar-EG').format(progressPercent)}٪
              </span>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[auto_1fr_auto] items-center w-full">
            <img
              src="/quran-icon-192.png"
              alt="quran-logo"
              className="w-10 h-10 rounded-xl border-2 border-accent/20 p-0.5"
            />
            <span
              className="font-bold tracking-tight font-amiri text-green-800 dark:text-green-500 text-lg sm:text-2xl text-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={onGoHome}
            >
              القرآن الكريم
            </span>
            <div /> {/* spacer to balance the trailing button's width */}
          </div>
        )}

        <div className="flex items-center gap-2">

          <IconButton onClick={open} label="الإعدادات" variant="accent">
            <Settings className="w-5 h-5" />
          </IconButton>

        </div>
      </div>
    </header>
  );
};

function IconButton({
  onClick,
  label,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  variant?: 'default' | 'accent';
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-10 h-10 flex items-center justify-center rounded-full border border-border-subtle transition-all duration-150 flex-shrink-0 active:scale-95 ${variant === 'accent'
        ? 'text-text-muted hover:text-accent hover:border-accent/20 hover:bg-accent/10'
        : 'text-text-muted hover:text-text-heading hover:bg-bg-hover'
        }`}
    >
      {children}
    </button>
  );
}