import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, ArrowLeft, Loader2, Info, Moon, Sun, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSurahInfo, fetchQuranText } from './api';
import { ChapterInfo, Verse } from './types';

interface VerseItemProps {
  verse: string;
  number: number;
  surahName?: string;
}

const VerseItem: React.FC<VerseItemProps> = ({ verse, number, surahName }) => {
  return (
    <div className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-subtle mb-4 hover:shadow-md transition-shadow">
      {surahName && (
        <div className="flex justify-between items-center mb-4 text-sm text-accent font-medium border-b border-border-subtle pb-2">
          <span>Surah {surahName}</span>
          <span>Verse {number}</span>
        </div>
      )}
      <div className="flex gap-4 items-start">
        {!surahName && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full border border-accent flex items-center justify-center text-text-muted text-xs font-sans mt-2">
            {number}
          </div>
        )}
        <div className="flex-grow">
          <p className="text-[1.35rem] md:text-2xl leading-[2.5] md:leading-[3] text-text-base font-amiri text-right" dir="rtl">
            {verse}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
        setError('Failed to load Quran data. Please check your connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return verses.filter((v) => v.text.toLowerCase().includes(query)).slice(0, 50); // Limit to 50 results for performance
  }, [searchQuery, verses]);

  const activeSurahVerses = useMemo(() => {
    if (!selectedSurah) return [];
    return verses.filter((v) => v.chapter === selectedSurah);
  }, [selectedSurah, verses]);

  const activeSurahInfo = useMemo(() => {
    if (!selectedSurah) return null;
    return chapters.find((c) => c.chapter === selectedSurah);
  }, [selectedSurah, chapters]);

  const activeSurahPages = useMemo(() => {
    if (!activeSurahInfo || !activeSurahInfo.verses) return [];
    const pages = new Set<number>();
    activeSurahInfo.verses.forEach(v => pages.add(v.page));
    return Array.from(pages).sort((a, b) => a - b);
  }, [activeSurahInfo]);

  const currentSurahPageNumber = activeSurahPages[currentPageIndex] || null;

  const currentVerseInfo = useMemo(() => {
    if (!activeSurahInfo?.verses || !currentSurahPageNumber) return null;
    return activeSurahInfo.verses.find((v) => v.page === currentSurahPageNumber);
  }, [activeSurahInfo, currentSurahPageNumber]);
  const currentHizb = useMemo(() => {
    if (!currentVerseInfo?.maqra) return null;
    return Math.ceil(currentVerseInfo.maqra / 4);
  }, [currentVerseInfo]);
  const surahProgressPercent = useMemo(() => {
    if (!activeSurahPages.length) return 0;
    return Math.round(((currentPageIndex + 1) / activeSurahPages.length) * 100);
  }, [currentPageIndex, activeSurahPages.length]);

  const versesOnCurrentPage = useMemo(() => {
    if (!activeSurahInfo?.verses || activeSurahPages.length === 0) return activeSurahVerses;

    const verseNumbers = new Set(
      activeSurahInfo.verses
        .filter(v => v.page === currentSurahPageNumber)
        .map(v => v.verse)
    );

    return activeSurahVerses.filter(v => verseNumbers.has(v.verse));
  }, [activeSurahVerses, activeSurahInfo, currentSurahPageNumber, activeSurahPages]);

  const handleNextPage = () => {
    if (currentPageIndex < activeSurahPages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center text-accent">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg font-medium animate-pulse text-text-muted">Loading Quran Reader...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
        <div className="bg-bg-surface text-red-500 p-6 rounded-2xl max-w-md text-center border border-red-900/20">
          <Info className="w-10 h-10 mx-auto mb-3" />
          <p className="font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-bg-hover hover:opacity-80 rounded-lg transition-colors text-text-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base font-serif text-text-base pb-12 flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <header className="bg-bg-surface border-b border-border-subtle sticky top-0 z-10 shadow-sm transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2 font-bold text-2xl text-text-heading cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
            onClick={() => {
              setSelectedSurah(null);
              setSearchQuery('');
              setCurrentPageIndex(0);
            }}
          >
            <BookOpen className="w-6 h-6 text-accent" />
            <span className="hidden sm:inline">Quran Reader</span>
          </div>

          <div className="grow max-w-md relative">
            <input
              type="text"
              placeholder="Search verses (Arabic)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setSelectedSurah(null);
              }}
              className="w-full bg-bg-base border border-border-input rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-text-base placeholder-text-muted transition-all"
              dir="rtl"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full border border-border-subtle hover:bg-bg-hover transition-colors text-text-muted hover:text-text-heading flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 w-full flex-1">
        {/* Search Results View */}
        {searchQuery ? (
          <div>
            <div className="mb-6 flex justify-between items-end">
              <h2 className="text-2xl font-bold text-text-heading">Search Results</h2>
              <p className="text-text-muted text-sm">Found {searchResults.length} matches</p>
            </div>
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((verse) => {
                  const surah = chapters.find((c) => c.chapter === verse.chapter);
                  return (
                    <VerseItem
                      key={`${verse.chapter}-${verse.verse}`}
                      verse={verse.text}
                      number={verse.verse}
                      surahName={surah ? `${surah.englishname} (${surah.arabicname})` : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted bg-bg-surface rounded-3xl shadow-sm border border-border-subtle">
                <Search className="w-12 h-12 mx-auto mb-4 text-border-input" />
                <p className="text-lg">No verses found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : selectedSurah && activeSurahInfo ? (
          /* Surah Detail View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={() => {
                  setSelectedSurah(null);
                  setCurrentPageIndex(0);
                }}
                className="flex items-center gap-2 text-text-muted hover:text-text-heading font-medium transition-colors border border-border-subtle bg-bg-surface px-4 py-1 md:py-2 mt-2 rounded-full hover:bg-bg-hover"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:block">Back to Surahs</span>
              </button>

              {currentPageIndex !== 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex mt-2 items-center gap-2 text-xs md:text-sm font-medium text-text-muted bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-full shadow-sm">
                    {currentHizb && (
                      <>
                        <span>Hizb {currentHizb}</span>
                        <span className="w-1 h-1 rounded-full bg-accent opacity-60" />
                      </>
                    )}
                    <span>{surahProgressPercent}%</span>
                  </div>
                  <span className="text-xl md:text-2xl font-amiri-quran text-accent">
                    {activeSurahInfo.arabicname}
                  </span>
                </div>
              )}
            </div>

            {currentPageIndex === 0 && (
              <>
                <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 mb-8 text-center relative overflow-hidden shadow-sm">
                  <div className="relative">
                    <h1 className="text-5xl md:text-6xl font-amiri-quran text-text-heading mb-4 mt-2">
                      {activeSurahInfo.arabicname}
                    </h1>
                    {/* <h2 className="text-2xl font-bold mb-2 tracking-wide text-text-heading">
                      {activeSurahInfo.name} ({activeSurahInfo.englishname})
                    </h2> */}
                    {/* <div className="flex items-center justify-center gap-4 text-text-muted text-sm font-medium uppercase tracking-wider">
                      <span>{activeSurahInfo.revelation}</span>
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>{activeSurahVerses.length} Verses</span>
                    </div> */}
                  </div>
                </div>

                {/* Bismillah for all surahs except At-Tawbah (9) and Al-Fatihah (1) which has it as verse 1 */}
                {selectedSurah !== 9 && selectedSurah !== 1 && (
                  <div className="text-center mb-10 mt-6">
                    <p className="text-4xl font-hafs-uthmanic text-text-heading">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    <div className="w-16 h-0.5 bg-accent mx-auto mt-4 opacity-30" />
                  </div>
                )}
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-0.5 md:p-12 mb-4 select-text"
              >
                <p className="font-hafs-uthmanic text-[1.5rem] md:text-3xl leading-[2.5] md:leading-[3] text-text-base text-justify" dir="rtl">
                  {versesOnCurrentPage.map((verse) => (
                    <React.Fragment key={verse.verse}>
                      <span className="inline">{verse.text}</span>
                      <span className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 border border-accent rounded-full text-xs md:text-sm font-sans text-text-muted mx-2 align-middle mt-1 mb-1 relative top-[2px]">
                        {new Intl.NumberFormat('ar-EG').format(verse.verse)}
                      </span>
                    </React.Fragment>
                  ))}
                </p>
              </motion.div>
            </AnimatePresence>

            {activeSurahPages.length > 1 && (
              <div className="flex items-center justify-between bg-bg-surface border border-border-subtle p-4 rounded-2xl mb-12 max-w-sm mx-auto shadow-sm">
                <button
                  onClick={handleNextPage}
                  disabled={currentPageIndex === activeSurahPages.length - 1}
                  className="p-2 rounded-full hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-text-heading"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-sm font-medium text-text-muted flex items-center gap-2">
                  <span>Page {currentSurahPageNumber}</span>
                  <span className="w-1 h-1 rounded-full bg-border-input" />
                  <span>{currentPageIndex + 1} / {activeSurahPages.length}</span>
                </div>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0}
                  className="p-2 rounded-full hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-text-heading"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Surah List View */
          <div className="animate-in fade-in duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-heading mb-2">Surahs</h1>
              <p className="text-text-muted">Uthmani Edition</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => (
                <button
                  key={chapter.chapter}
                  onClick={() => {
                    setSelectedSurah(chapter.chapter);
                    setCurrentPageIndex(0);
                  }}
                  className="bg-bg-surface p-5 rounded-2xl shadow-sm border border-border-subtle hover:border-accent hover:bg-bg-hover transition-all group flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 bg-bg-base border border-border-subtle rounded-xl rotate-45 group-hover:bg-bg-surface transition-colors" />
                      <span className="relative z-10 text-text-heading font-bold">{chapter.chapter}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-heading transition-colors">
                        {chapter.englishname}
                      </h3>
                      <p className="text-sm text-text-muted uppercase tracking-wider text-[10px] mt-1 font-semibold">
                        {chapter.revelation} • {chapter.verses?.length || (verses.filter(v => v.chapter === chapter.chapter).length)} Verses
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-amiri-quran text-accent group-hover:scale-105 transition-transform" dir="rtl">
                    {chapter.arabicname.replace('سُوْرَةُ ', '')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .pattern-dots {
          background-image: radial-gradient(currentColor 2px, transparent 2px);
          background-size: 20px 20px;
        }
      `}} />
    </div>
  );
}
