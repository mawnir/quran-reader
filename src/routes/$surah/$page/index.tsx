import React, { useState, useEffect, useMemo } from 'react';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSurahInfo, fetchQuranText } from '../../../utils/api';
import { ChapterInfo, Verse } from '../../../utils/types';
import hizbData from '../../../data/hizb_data.json';
import { useTheme } from '../../../utils/useTheme';
import { findSurahBySlug } from '../../../utils/quranUtils';
import { Header } from '../../../components/Header';
import { Pagination } from '../../../components/Pagination';
import { SurahHeader } from '../../../components/SurahHeader';
import { LoadingState, ErrorState } from '../../../components/States';
import { X, Bookmark } from 'lucide-react';
import { isBookmarked, toggleBookmark } from '../../../utils/bookmarks';

interface HizbEntry {
    hizb: number;
    quarter: number;
    surah: number;
    verse: number;
}

type TafsirTab = 'tafsir' | 'wordByWord';

interface WordItem {
    id: number;
    arabic: string;
    transliteration: string | null;
    translation: string | null;
}

interface TafsirState {
    open: boolean;
    surah: number | null;
    verse: number | null;
    activeTab: TafsirTab;

    tafsirLoading: boolean;
    tafsirError: string | null;
    tafsirText: string | null;

    wordsLoading: boolean;
    wordsError: string | null;
    words: WordItem[] | null;
}

const initialTafsirState: TafsirState = {
    open: false,
    surah: null,
    verse: null,
    activeTab: 'wordByWord',
    tafsirLoading: false,
    tafsirError: null,
    tafsirText: null,
    wordsLoading: false,
    wordsError: null,
    words: null,
};

export const Route = createFileRoute('/$surah/$page/')({
    component: SurahPageRouteComponent,
})

function SurahPageRouteComponent() {
    const navigate = useNavigate();
    const params = useParams({ from: '/$surah/$page/' });
    const { surah, page } = params;

    const { theme, toggleTheme } = useTheme();

    const [chapters, setChapters] = useState<ChapterInfo[]>([]);
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
    const [bookmarked, setBookmarked] = useState(false);

    const [tafsir, setTafsir] = useState<TafsirState>(initialTafsirState);

    const pageIndex = Math.max(0, parseInt(page || '1', 10) - 1);

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

    useEffect(() => {
        if (!tafsir.open || tafsir.surah == null || tafsir.verse == null) return;

        if (
            tafsir.activeTab === 'tafsir' &&
            tafsir.tafsirText === null &&
            !tafsir.tafsirLoading &&
            !tafsir.tafsirError
        ) {
            fetchTafsirText(tafsir.surah, tafsir.verse);
        }

        if (
            tafsir.activeTab === 'wordByWord' &&
            tafsir.words === null &&
            !tafsir.wordsLoading &&
            !tafsir.wordsError
        ) {
            fetchWordByWord(tafsir.surah, tafsir.verse);
        }
    }, [tafsir.open, tafsir.surah, tafsir.verse, tafsir.activeTab, tafsir.tafsirText, tafsir.wordsLoading, tafsir.wordsError, tafsir.tafsirLoading, tafsir.words]);

    const totalPages = activeSurahPages.length;
    const safePageIndex = Math.min(pageIndex, Math.max(0, totalPages - 1));

    // Sync bookmark state whenever surah or page changes
    useEffect(() => {
        setBookmarked(isBookmarked(surah || '', safePageIndex + 1));
    }, [surah, safePageIndex]);

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
        if (safePageIndex < totalPages - 1) {
            navigate({
                to: '/$surah/$page',
                params: { surah, page: (safePageIndex + 2).toString() },
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
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

    const fetchTafsirText = async (surahNum: number, verseNum: number) => {
        setTafsir((prev) => ({ ...prev, tafsirLoading: true, tafsirError: null }));
        try {
            const res = await fetch(
                `https://api.alquran.cloud/v1/ayah/${surahNum}:${verseNum}/ar.muyassar`
            );
            if (!res.ok) throw new Error('network');
            const data = await res.json();
            const text = data?.data?.text as string | undefined;
            if (!text) throw new Error('empty');

            setTafsir((prev) => ({ ...prev, tafsirLoading: false, tafsirText: text }));
        } catch (err) {
            console.error(err);
            setTafsir((prev) => ({
                ...prev,
                tafsirLoading: false,
                tafsirError: 'تعذر تحميل التفسير. حاول مرة أخرى.',
            }));
        }
    };

    const fetchWordByWord = async (surahNum: number, verseNum: number) => {
        setTafsir((prev) => ({ ...prev, wordsLoading: true, wordsError: null }));
        try {
            const res = await fetch(
                `https://api.quran.com/api/v4/verses/by_key/${surahNum}:${verseNum}?words=true&word_fields=text_uthmani,transliteration&word_translation_language=en`
            );
            if (!res.ok) throw new Error('network');
            const data = await res.json();
            const rawWords = data?.verse?.words as any[] | undefined;
            if (!rawWords) throw new Error('empty');

            const words: WordItem[] = rawWords
                .filter((w) => w.char_type_name !== 'end') // drop the ayah-number marker "word"
                .map((w) => ({
                    id: w.id,
                    arabic: w.text_uthmani ?? w.text ?? '',
                    transliteration: w.transliteration?.text ?? null,
                    translation: w.translation?.text ?? null,
                }));

            setTafsir((prev) => ({ ...prev, wordsLoading: false, words }));
        } catch (err) {
            console.error(err);
            setTafsir((prev) => ({
                ...prev,
                wordsLoading: false,
                wordsError: 'Could not load word-by-word translation.',
            }));
        }
    };

    const openTafsir = (surahNum: number, verseNum: number) => {
        setTafsir({
            ...initialTafsirState,
            open: true,
            surah: surahNum,
            verse: verseNum,
        });
    };

    const closeTafsir = () => {
        setTafsir((prev) => ({ ...prev, open: false }));
    };

    const tafsirSurahInfo = useMemo(() => {
        if (tafsir.surah == null) return null;
        // Falls back to a lookup in case the dialog is ever opened for a
        // surah other than the one currently on screen.
        if (activeSurahInfo && activeSurahInfo.chapter === tafsir.surah) {
            return activeSurahInfo;
        }
        return chapters.find((c) => c.chapter === tafsir.surah) ?? null;
    }, [tafsir.surah, activeSurahInfo, chapters]);

    const switchTab = (tab: TafsirTab) => {
        setTafsir((prev) => ({ ...prev, activeTab: tab }));
    };

    const handleBookmarkToggle = () => {
        if (!activeSurahInfo) return;
        const added = toggleBookmark({
            surahSlug: surah || '',
            page: safePageIndex + 1,
            surahArabicName: activeSurahInfo.arabicname,
            surahEnglishName: activeSurahInfo.englishname,
        });
        setBookmarked(added);
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
                            showBismillah={safePageIndex === 0}
                            progressPercent={surahProgressPercent}
                            hizbInfo={currentHizbInfo}
                            showHizbInfo={safePageIndex !== 0}
                        />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={safePageIndex}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="bg-bg-surface border border-border-subtle rounded-2xl p-1 sm:p-8 md:p-12 shadow-xs mb-8"
                            >
                                <p className="font-hafs-uthmanic font-bold text-2xl sm:text-2xl md:text-3xl leading-[2.3] sm:leading-[2.6] md:leading-[2.8] text-text-base text-justify">
                                    {versesOnCurrentPage.map((verse) => (
                                        <React.Fragment key={verse.verse}>
                                            <span
                                                className="inline"
                                            //className="inline cursor-pointer hover:bg-accent/10 rounded transition-colors duration-150"
                                            //onClick={() => openTafsir(verse.chapter, verse.verse)}
                                            >
                                                {verse.text}
                                            </span>
                                            <span
                                                className="inline-flex font-hafs-uthmanic mx-1.5 text-accent text-md cursor-pointer"
                                                onClick={() => openTafsir(verse.chapter, verse.verse)}
                                            >
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

                        {/* Bookmark button */}
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleBookmarkToggle}
                                aria-label={bookmarked ? 'إزالة الإشارة المرجعية' : 'إضافة إشارة مرجعية'}
                                title={bookmarked ? 'إزالة الإشارة المرجعية' : 'حفظ موضع القراءة'}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${bookmarked
                                    ? 'bg-accent text-white border-accent shadow-sm shadow-accent/30 hover:bg-accent/90'
                                    : 'bg-bg-surface text-text-muted border-border-subtle hover:border-accent/40 hover:text-accent'
                                    }`}
                            >
                                <Bookmark
                                    className="w-4 h-4"
                                    fill={bookmarked ? 'currentColor' : 'none'}
                                />
                                {bookmarked ? 'تمت الإشارة' : 'إشارة مرجعية'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-text-muted bg-bg-surface rounded-3xl border border-border-subtle p-6">
                        <p className="text-base font-medium">السورة غير موجودة</p>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {tafsir.open && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeTafsir}
                    >
                        <motion.div
                            className="bg-bg-surface w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl border border-border-subtle p-6 max-h-[80vh] flex flex-col"
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div dir="rtl" className="flex items-center justify-between mb-4">
                                <div className='flex items-baseline gap-2'>
                                    {tafsirSurahInfo && (
                                        <p className="text-sm font-semibold text-accent">
                                            سورة {tafsirSurahInfo.arabicname}
                                        </p>
                                    )}
                                    <p className="text-sm text-text-muted">
                                        · الآية {tafsir.verse ? new Intl.NumberFormat('ar-EG').format(tafsir.verse) : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={closeTafsir}
                                    className="text-text-muted hover:text-text-base transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-4 border-b border-border-subtle">
                                <button
                                    onClick={() => switchTab('wordByWord')}
                                    className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tafsir.activeTab === 'wordByWord'
                                        ? 'border-accent text-accent'
                                        : 'border-transparent text-text-muted hover:text-text-base'
                                        }`}
                                >
                                    Word by Word
                                </button>

                                <button
                                    onClick={() => switchTab('tafsir')}
                                    className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tafsir.activeTab === 'tafsir'
                                        ? 'border-accent text-accent'
                                        : 'border-transparent text-text-muted hover:text-text-base'
                                        }`}
                                >
                                    التفسير الميسر
                                </button>

                            </div>

                            <div className="overflow-y-auto flex-1">

                                {tafsir.activeTab === 'wordByWord' && (
                                    <div dir="ltr">
                                        {tafsir.wordsLoading && (
                                            <div className="py-8 text-center text-text-muted">
                                                Loading...
                                            </div>
                                        )}
                                        {tafsir.wordsError && (
                                            <div className="py-8 text-center text-red-500">
                                                {tafsir.wordsError}
                                            </div>
                                        )}
                                        {tafsir.words && (
                                            <div className="flex flex-wrap gap-1 justify-start" dir="rtl">
                                                {tafsir.words.map((word) => (
                                                    <div
                                                        key={word.id}
                                                        className="flex flex-col items-center bg-bg-base border border-border-subtle rounded-xl px-1 py-2 min-w-11"
                                                    >
                                                        <span className="font-hafs-uthmanic text-xl text-text-base mb-1">
                                                            {word.arabic}
                                                        </span>

                                                        {word.translation && (
                                                            <span className="text-xs text-accent">
                                                                {word.translation}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {tafsir.activeTab === 'tafsir' && (
                                    <div dir="rtl">
                                        {tafsir.tafsirLoading && (
                                            <div className="py-8 text-center text-text-muted">
                                                جارٍ التحميل...
                                            </div>
                                        )}
                                        {tafsir.tafsirError && (
                                            <div className="py-8 text-center text-red-500">
                                                {tafsir.tafsirError}
                                            </div>
                                        )}
                                        {tafsir.tafsirText && (
                                            <p className="text-base leading-loose text-text-base text-justify">
                                                {tafsir.tafsirText}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}