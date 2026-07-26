import React from 'react';
import { Verse } from '../utils/types';
import { VerseItem } from './VerseItem';
import { SurahCard } from './SurahCard';
import { ChapterInfo } from '../utils/types';
import { Search } from 'lucide-react';

interface SearchResultsViewProps {
  searchQuery: string;
  matchingSurahs: ChapterInfo[];
  searchResults: Verse[];
  chapters: ChapterInfo[];
  verses: Verse[];
  onSelectSurah: (chapter: ChapterInfo) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  searchQuery,
  matchingSurahs,
  searchResults,
  chapters,
  verses,
  onSelectSurah,
}) => {
  return (
    <div>
      {/* Matching Surahs Section */}
      {matchingSurahs.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center border-b border-border-subtle pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-text-heading">السور المطابقة</h2>
            <span className="text-xs sm:text-sm text-text-muted bg-bg-surface px-3 py-1 rounded-full border border-border-subtle">
              {new Intl.NumberFormat('ar-EG').format(matchingSurahs.length)} سورة
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {matchingSurahs.map((chapter) => {
              const totalVerses =
                chapter.verses?.length || verses.filter((v) => v.chapter === chapter.chapter).length;
              return (
                <SurahCard
                  key={chapter.chapter}
                  chapter={chapter}
                  totalVerses={totalVerses}
                  onSelect={onSelectSurah}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Verse Results Section */}
      <div className="mb-6 flex justify-between items-center border-b border-border-subtle pb-3">
        <h2 className="text-lg sm:text-xl font-bold text-text-heading">نتائج البحث في الآيات</h2>
        <span className="text-xs sm:text-sm text-text-muted bg-bg-surface px-3 py-1 rounded-full border border-border-subtle">
          {new Intl.NumberFormat('ar-EG').format(searchResults.length)} نتيجة
        </span>
      </div>
      {searchResults.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {searchResults.map((verse) => {
            const surah = chapters.find((c) => c.chapter === verse.chapter);
            return (
              <VerseItem
                key={`${verse.chapter}-${verse.verse}`}
                verse={verse.text}
                number={verse.verse}
                surahName={surah ? `${surah.arabicname.replace('سُوْرَةُ ', '')}` : undefined}
              />
            );
          })}
        </div>
      ) : matchingSurahs.length === 0 ? (
        <div className="text-center py-16 text-text-muted bg-bg-surface rounded-3xl border border-border-subtle p-6">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">لم نجد أي نتائج تطابق "{searchQuery}"</p>
        </div>
      ) : (
        <p className="text-center py-8 text-sm text-text-muted">
          لا توجد آيات مطابقة، جرّب البحث عن كلمة مختلفة
        </p>
      )}
    </div>
  );
};
