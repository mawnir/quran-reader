import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, ArrowRight, Loader2, Info, Moon, Sun, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSurahInfo, fetchQuranText } from './api';
import { ChapterInfo, Verse } from './types';
import hizbData from '../public/data/hizb_data.json';

interface HizbEntry {
  hizb: number;
  quarter: number;
  surah: number;
  verse: number;
}

// Helper to normalize strings for flexible URL matching
const normalizeForMatch = (text: string) => {
  return text
    .toLowerCase()
    .replace(/^al-|^at-|^an-|^as-|^az-|^ar-|^ad-|^ash-|^adh-|^al|^sura-|^surah-/, '')
    .replace(/q/g, 'k')
    .replace(/[^a-z0-9]/g, '');
};

const getSurahSlug = (chapter: ChapterInfo) => {
  return chapter.englishname
    .toLowerCase()
    .replace(/['\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const findSurahBySlug = (slug: string, chapterList: ChapterInfo[]): ChapterInfo | null => {
  if (!slug || slug === '/') return null;

  const cleanSlug = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!cleanSlug) return null;

  const num = parseInt(cleanSlug, 10);
  if (!isNaN(num) && num >= 1 && num <= 114) {
    const found = chapterList.find((c) => c.chapter === num);
    if (found) return found;
  }

  const exactMatch = chapterList.find((c) => getSurahSlug(c) === cleanSlug);
  if (exactMatch) return exactMatch;

  const normalizedInput = normalizeForMatch(cleanSlug);
  const fuzzyMatch = chapterList.find((c) => {
    const normName = normalizeForMatch(c.englishname);
    return normName === normalizedInput || normName.startsWith(normalizedInput) || normalizedInput.startsWith(normName);
  });

  return fuzzyMatch || null;
};

interface VerseItemProps {
  verse: string;
  number: number;
  surahName?: string;
}

const VerseItem: React.FC<VerseItemProps> = ({ verse, number, surahName }) => {
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

export default function App() {
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Persistence for Dark Mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('quran_theme') as 'light' | 'dark';
      if (savedTheme) return savedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('quran_theme', theme);
  }, [theme]);

  // Load Quran Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [infoData, quranData] = await Promise.all([
          fetchSurahInfo(),
          fetchQuranText(),
        ]);
        setChapters(infoData.chapters);
        setVerses(quranData.quran);
      } catch (err) {
        setError('تعذر تحميل بيانات المصحف الشريف. يرجى التحقق من الاتصال.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Synchronize URL Route with Selected Surah
  useEffect(() => {
    if (chapters.length === 0) return;

    const handleLocationChange = () => {
      const path = window.location.pathname;
      const matched = findSurahBySlug(path, chapters);
      if (matched) {
        setSelectedSurah(matched.chapter);
      } else {
        setSelectedSurah(null);
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [chapters]);

  // Navigation handlers
  const navigateToSurah = (chapter: ChapterInfo) => {
    const slug = getSurahSlug(chapter);
    window.history.pushState({}, '', `/${slug}`);
    setSelectedSurah(chapter.chapter);
    setCurrentPageIndex(0);
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setSelectedSurah(null);
    setSearchQuery('');
    setCurrentPageIndex(0);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return verses.filter((v) => v.text.toLowerCase().includes(query)).slice(0, 50);
  }, [searchQuery, verses]);

  const activeSurahVerses = useMemo(() => {
    if (!selectedSurah) return [];
    return verses.filter((v) => v.chapter === selectedSurah);
  }, [selectedSurah, verses]);

  const activeSurahInfo = useMemo(() => {
    if (!selectedSurah) return null;
    return chapters.find((c) => c.chapter === selectedSurah);
  }, [selectedSurah, chapters]);

  // Split Surah verses into pages of ~100 words each
  const activeSurahPages = useMemo(() => {
    if (!activeSurahVerses.length) return [];

    const pages: Verse[][] = [];
    let currentChunk: Verse[] = [];
    let currentWordCount = 0;

    for (const verse of activeSurahVerses) {
      const verseWordCount = verse.text.trim().split(/\s+/).filter(Boolean).length;
      if (currentChunk.length > 0 && currentWordCount + verseWordCount > 100) {
        pages.push(currentChunk);
        currentChunk = [verse];
        currentWordCount = verseWordCount;
      } else {
        currentChunk.push(verse);
        currentWordCount += verseWordCount;
      }
    }
    if (currentChunk.length > 0) {
      pages.push(currentChunk);
    }
    return pages;
  }, [activeSurahVerses]);

  const totalPages = activeSurahPages.length;
  const safePageIndex = Math.min(currentPageIndex, Math.max(0, totalPages - 1));

  const surahProgressPercent = useMemo(() => {
    if (!totalPages) return 0;
    return Math.round(((safePageIndex + 1) / totalPages) * 100);
  }, [safePageIndex, totalPages]);

  const versesOnCurrentPage = useMemo(() => {
    if (!totalPages) return [];
    return activeSurahPages[safePageIndex] || [];
  }, [activeSurahPages, safePageIndex, totalPages]);

  // 2. Compute the current Hizb dynamically from the first verse on current page
  // Compute current Hizb and Quarter dynamically from the first verse on current page
  const currentHizbInfo = useMemo(() => {
    if (!versesOnCurrentPage.length) return { hizb: 1, quarter: 1 };

    const firstVerse = versesOnCurrentPage[0];
    let matched = { hizb: 1, quarter: 1 };

    for (const item of (hizbData as HizbEntry[])) {
      if (
        item.surah < firstVerse.chapter ||
        (item.surah === firstVerse.chapter && item.verse <= firstVerse.verse)
      ) {
        matched = { hizb: item.hizb, quarter: item.quarter };
      } else {
        break;
      }
    }

    return matched;
  }, [versesOnCurrentPage]);

  const handleNextPage = () => {
    if (safePageIndex < totalPages - 1) {
      setCurrentPageIndex(safePageIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (safePageIndex > 0) {
      setCurrentPageIndex(safePageIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-3" />
        <p className="text-base font-medium animate-pulse text-text-muted">
          جاري تحميل المصحف الشريف...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
        <div className="bg-bg-surface text-red-500 p-6 rounded-2xl max-w-md text-center border border-border-subtle shadow-xs">
          <Info className="w-10 h-10 mx-auto mb-3" />
          <p className="font-medium text-sm sm:text-base mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium transition-opacity hover:opacity-90 shadow-xs"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-bg-base text-text-base flex flex-col transition-colors duration-300 font-sans">
      {/* Header Bar */}
      <header className="bg-bg-surface/95 backdrop-blur-md border-b border-border-subtle sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {selectedSurah && activeSurahInfo ? (
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <button
                onClick={navigateToHome}
                className="flex items-center justify-center w-10 h-10 rounded-full text-text-muted hover:text-text-heading hover:bg-bg-hover transition-colors border border-border-subtle flex-shrink-0"
                aria-label="الرجوع للقائمة"
                title="الرجوع لقائمة السور"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
                <span className="text-lg sm:text-2xl font-bold font-hafs-uthmanic text-accent truncate">
                  سورة {activeSurahInfo.arabicname.replace('سُوْرَةُ ', '')}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted bg-bg-hover/60 border border-border-subtle px-2.5 py-1 rounded-full flex-shrink-0">
                  <span>{new Intl.NumberFormat('ar-EG').format(surahProgressPercent)}٪</span>
                  <span className="w-1 h-1 rounded-full bg-accent opacity-50" />

                  <span>
                    الحزب {new Intl.NumberFormat('ar-EG').format(currentHizbInfo.hizb)}
                    {currentHizbInfo.quarter !== 1 && (
                      <>
                        {' - '}
                        الربع {new Intl.NumberFormat('ar-EG').format(currentHizbInfo.quarter)}
                      </>
                    )}
                  </span>

                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-text-heading cursor-pointer hover:opacity-90 transition-opacity"
              onClick={navigateToHome}
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
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border-subtle text-text-muted hover:text-text-heading hover:bg-bg-hover transition-colors flex-shrink-0"
              aria-label="تغيير المظهر"
              title="تغيير المظهر"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-24 w-full flex-1">
        {/* Search Input Bar */}
        {!selectedSurah && (
          <div className="mb-6 sm:mb-8 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن آية أو كلمة في القرآن الكريم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-surface border border-border-input rounded-2xl py-3 pr-11 pl-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-text-base placeholder-text-muted transition-all shadow-xs"
              />
              <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery ? (
          <div>
            <div className="mb-6 flex justify-between items-center border-b border-border-subtle pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-text-heading">نتائج البحث</h2>
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
            ) : (
              <div className="text-center py-16 text-text-muted bg-bg-surface rounded-3xl border border-border-subtle p-6">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-base font-medium">لم نجد أي آيات تطابق "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : selectedSurah && activeSurahInfo ? (
          /* Surah Detail View */
          <div className="animate-in fade-in duration-300">
            {/* Bismillah Header */}
            {currentPageIndex === 0 && selectedSurah !== 9 && selectedSurah !== 1 && (
              <div className="text-center my-6 sm:my-10">
                <p className="text-2xl sm:text-3xl md:text-4xl font-hafs-uthmanic text-text-heading leading-relaxed">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <div className="w-16 h-0.5 bg-accent/30 mx-auto mt-4 rounded-full" />
              </div>
            )}

            {/* Verses Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-1 sm:p-8 md:p-12 shadow-xs mb-8"
              >
                <p className="font-hafs-uthmanic font-bold text-2xl sm:text-2xl md:text-3xl leading-[2.3] sm:leading-[2.6] md:leading-[2.8] text-text-base text-justify">
                  {versesOnCurrentPage.map((verse) => (
                    <React.Fragment key={verse.verse}>
                      <span className="inline">{verse.text}</span>
                      <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border border-accent/40 text-accent bg-accent/10 rounded-full text-xs font-sans mx-1.5 align-middle select-none">
                        {new Intl.NumberFormat('ar-EG').format(verse.verse)}
                      </span>
                    </React.Fragment>
                  ))}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Page Navigation */}
            {totalPages > 1 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-md bg-bg-surface/95 backdrop-blur-md border border-border-subtle p-2.5 rounded-full shadow-lg flex items-center justify-between">
                <button
                  onClick={handlePrevPage}
                  disabled={safePageIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-text-heading text-xs sm:text-sm font-medium"
                >
                  <ChevronRight className="w-5 h-5" />
                  <span className="hidden xs:inline">السابقة</span>
                </button>

                <div className="text-xs sm:text-sm font-medium text-text-muted flex items-center gap-2">
                  <span>صفحة {new Intl.NumberFormat('ar-EG').format(safePageIndex + 1)}</span>
                  <span className="w-1 h-1 rounded-full bg-border-input" />
                  <span>
                    {new Intl.NumberFormat('ar-EG').format(safePageIndex + 1)} / {new Intl.NumberFormat('ar-EG').format(totalPages)}
                  </span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={safePageIndex === totalPages - 1}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-text-heading text-xs sm:text-sm font-medium"
                >
                  <span className="hidden xs:inline">التالية</span>
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Surah List View */
          <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex justify-between items-end border-b border-border-subtle pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-heading">سور القرآن الكريم</h1>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">برواية حفص عن عاصم</p>
              </div>
              <span className="text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
                ١١٤ سورة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {chapters.map((chapter) => {
                const totalVerses = chapter.verses?.length || verses.filter((v) => v.chapter === chapter.chapter).length;
                return (
                  <button
                    key={chapter.chapter}
                    onClick={() => {
                      navigateToSurah(chapter);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}