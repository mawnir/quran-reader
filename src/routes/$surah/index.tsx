import React, { useState, useEffect, useMemo } from 'react';
import { createFileRoute, useNavigate, useParams, Outlet, useChildMatches } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSurahInfo, fetchQuranText } from '../../services/api';
import { ChapterInfo, Verse } from '../../utils/types';
import hizbData from '../../data/hizb_data.json';
import { useTheme } from '../../utils/useTheme';
import { findSurahBySlug } from '../../utils/quranUtils';
import { Header } from '../../components/Header';
import { Pagination } from '../../components/Pagination';
import { SurahHeader } from '../../components/SurahHeader';
import { LoadingState, ErrorState } from '../../components/States';

interface HizbEntry {
  hizb: number;
  quarter: number;
  surah: number;
  verse: number;
}

export const Route = createFileRoute('/$surah/')({
  component: SurahSlugRouteComponent,
})

function SurahSlugRouteComponent() {
  const navigate = useNavigate();
  const params = useParams({ from: '/$surah/' });
  const { surah } = params;

  console.log("surah", surah);
  const { theme, toggleTheme } = useTheme();

  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

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

  useEffect(() => {
    if (chapters.length === 0) return;

    const matched = findSurahBySlug(surah || '', chapters);
    if (matched) {
      setSelectedSurah(matched.chapter);
    } else {
      setSelectedSurah(null);
    }
  }, [chapters, surah]);

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

  const currentHizbInfo = useMemo(() => {
    if (!versesOnCurrentPage.length) return { hizb: 1, quarter: 1 };

    const lastVerse = versesOnCurrentPage[versesOnCurrentPage.length - 1];
    let matched = { hizb: 1, quarter: 1 };

    for (const item of (hizbData as HizbEntry[])) {
      if (
        item.surah < lastVerse.chapter ||
        (item.surah === lastVerse.chapter && item.verse <= lastVerse.verse)
      ) {
        matched = { hizb: item.hizb, quarter: item.quarter };
      } else {
        break;
      }
    }

    return matched;
  }, [versesOnCurrentPage]);

  const handleNextPage = () => {
    // if (safePageIndex < totalPages - 1) {
    //   setCurrentPageIndex(safePageIndex + 1);
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    // }

    if (safePageIndex < totalPages - 1) {
      navigate({
        to: '/$surah/$page',
        params: { surah, page: (safePageIndex + 2).toString() },
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    // if (safePageIndex > 0) {
    //   setCurrentPageIndex(safePageIndex - 1);
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    // }

    if (safePageIndex > 0) {
      navigate({
        to: '/$surah/$page',
        params: { surah, page: safePageIndex.toString() },
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToHome = () => {
    navigate({ to: '/' });
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div dir="rtl" className="min-h-screen bg-bg-base text-text-base flex flex-col transition-colors duration-300 font-sans">
      <Header
        surahTitle={activeSurahInfo ? activeSurahInfo.arabicname : null}
        onGoHome={navigateToHome}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-24 w-full flex-1">
        {selectedSurah && activeSurahInfo ? (
          <div className="animate-in fade-in duration-300">
            <SurahHeader
              surahNumber={selectedSurah}
              showBismillah={currentPageIndex === 0}
              progressPercent={surahProgressPercent}
              hizbInfo={currentHizbInfo}
              showHizbInfo={currentPageIndex !== 0}
            />

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
                      <span className="inline-flex font-hafs-uthmanic mx-1.5 text-accent text-md">
                        {new Intl.NumberFormat('ar-EG').format(verse.verse)}
                      </span>
                    </React.Fragment>
                  ))}
                </p>
              </motion.div>
            </AnimatePresence>

            <Pagination
              currentPage={safePageIndex}
              totalPages={totalPages}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          </div>
        ) : (
          <div className="text-center py-16 text-text-muted bg-bg-surface rounded-3xl border border-border-subtle p-6">
            <p className="text-base font-medium">السورة غير موجودة</p>
          </div>
        )}
      </main>
    </div>
  );
}


