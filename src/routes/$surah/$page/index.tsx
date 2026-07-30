import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSurahInfo, fetchQuranText } from '../../../services/api';
import { ChapterInfo, Verse } from '../../../utils/types';
import hizbData from '../../../data/hizb_data.json';
import { useTheme } from '../../../utils/useTheme';
import { findSurahBySlug } from '../../../utils/quranUtils';
import { Header } from '../../../components/Header';
import { Pagination } from '../../../components/Pagination';
import { SurahHeader } from '../../../components/SurahHeader';
import { LoadingState, ErrorState } from '../../../components/States';
import { X, Bookmark, MoreHorizontal, ChevronRight, MoreVertical } from 'lucide-react';
import { isBookmarked, toggleBookmark } from '../../../utils/bookmarks';
import { explainWord } from '@/src/services/groqService';

interface HizbEntry {
    hizb: number;
    quarter: number;
    surah: number;
    verse: number;
}

interface WordExplanationState {
    open: boolean;
    word: string | null;
    verseText: string | null;
    loading: boolean;
    error: string | null;
    explanation: string[] | null;
}

const initialWordExplanationState: WordExplanationState = {
    open: false,
    word: null,
    verseText: null,
    loading: false,
    error: null,
    explanation: null,
};

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

interface WordPopoverState {
    open: boolean;
    word: string | null;
    translation: string | null;
    loading: boolean;
    error: string | null;
    x: number;
    y: number;
    surah: number | null;
    verse: number | null;
}

const initialWordPopoverState: WordPopoverState = {
    open: false,
    word: null,
    translation: null,
    loading: false,
    error: null,
    x: 0,
    y: 0,
    surah: null,
    verse: null,
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
    const [wordExplanation, setWordExplanation] = useState<WordExplanationState>(initialWordExplanationState);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressFired = useRef(false);

    const [tafsir, setTafsir] = useState<TafsirState>(initialTafsirState);

    const [wordPopover, setWordPopover] = useState<WordPopoverState>(initialWordPopoverState);
    // Caches word-by-word data per "surah:verse" key so re-tapping the same
    // verse doesn't refire the network request.
    const verseWordsCache = useRef<Map<string, WordItem[]>>(new Map());

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

    // Close any open word popover whenever the page/surah changes so it
    // doesn't linger over stale content after navigation.
    useEffect(() => {
        setWordPopover((prev) => (prev.open ? { ...prev, open: false } : prev));
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

    // Shared parser: normalizes the quran.com verse response into WordItem[].
    // Used by both the tafsir dialog's word-by-word tab and the tap popover,
    // and backed by a per-verse cache to avoid duplicate requests.
    const getVerseWords = useCallback(async (surahNum: number, verseNum: number): Promise<WordItem[]> => {
        const key = `${surahNum}:${verseNum}`;
        const cached = verseWordsCache.current.get(key);
        if (cached) return cached;

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

        verseWordsCache.current.set(key, words);
        return words;
    }, []);

    const fetchWordByWord = async (surahNum: number, verseNum: number) => {
        setTafsir((prev) => ({ ...prev, wordsLoading: true, wordsError: null }));
        try {
            const words = await getVerseWords(surahNum, verseNum);
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

    const openWordExplanation = async (word: string, verseText: string) => {
        setWordExplanation({
            open: true,
            word,
            verseText,
            loading: true,
            error: null,
            explanation: null,
        });
        try {
            const explanation = await explainWord(word, verseText, surah);
            setWordExplanation((prev) => ({ ...prev, loading: false, explanation }));
        } catch {
            setWordExplanation((prev) => ({
                ...prev,
                loading: false,
                error: 'تعذر تحميل الشرح. حاول مرة أخرى.',
            }));
        }
    };

    const closeWordExplanation = () => {
        setWordExplanation((prev) => ({ ...prev, open: false }));
    };

    const handleWordTouchStart = (word: string, verseText: string) => {
        longPressFired.current = false;
        longPressTimer.current = setTimeout(() => {
            longPressFired.current = true;
            if (navigator.vibrate) navigator.vibrate(10);
            openWordExplanation(word, verseText);
        }, 500);
    };

    const cancelLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleWordContextMenu = (
        e: React.MouseEvent,
        word: string,
        verseText: string,
    ) => {
        e.preventDefault();
        openWordExplanation(word, verseText);
    };

    // Quick tap-to-translate popover: shows a small pill with an arrow
    // pointing at the tapped word, positioned via the word span's own
    // bounding rect so it works regardless of line wrapping.
    const closeWordPopover = useCallback(() => {
        setWordPopover((prev) => (prev.open ? { ...prev, open: false } : prev));
    }, []);

    const handleWordClick = useCallback(
        async (
            e: React.MouseEvent<HTMLSpanElement>,
            wordIndex: number,
            surahNum: number,
            verseNum: number,
            word: string,
        ) => {
            // Long-press already opened the AI explanation dialog for this tap;
            // don't also pop up the quick-translate pill.
            if (longPressFired.current) {
                longPressFired.current = false;
                return;
            }

            const rect = e.currentTarget.getBoundingClientRect();

            setWordPopover({
                open: true,
                word,
                translation: null,
                loading: true,
                error: null,
                x: rect.left + rect.width / 2,
                y: rect.top,
                surah: surahNum,
                verse: verseNum,
            });

            try {
                const words = await getVerseWords(surahNum, verseNum);
                const match = words[wordIndex];
                setWordPopover((prev) =>
                    prev.open
                        ? { ...prev, loading: false, translation: match?.translation ?? 'No translation' }
                        : prev
                );
            } catch (err) {
                console.error(err);
                setWordPopover((prev) =>
                    prev.open ? { ...prev, loading: false, error: 'Could not load translation.' } : prev
                );
            }
        },
        [getVerseWords]
    );

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
                                    {versesOnCurrentPage.map((verse) => {
                                        const words = verse.text.trim().split(/\s+/).filter(Boolean);
                                        return (
                                            <React.Fragment key={verse.verse}>
                                                {words.map((w, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline rounded transition-colors active:bg-accent/15 select-none"
                                                        onClick={(e) => handleWordClick(e, i, verse.chapter, verse.verse, w)}
                                                        onContextMenu={(e) => handleWordContextMenu(e, w, verse.text)}
                                                        onTouchStart={() => handleWordTouchStart(w, verse.text)}
                                                        onTouchEnd={cancelLongPress}
                                                        onTouchMove={cancelLongPress}
                                                    >
                                                        {w}{i < words.length - 1 ? ' ' : ''}
                                                    </span>
                                                ))}
                                                {' '}
                                                <span
                                                    className="inline-flex font-hafs-uthmanic mx-1.5 text-accent text-md cursor-pointer"
                                                    onClick={() => openTafsir(verse.chapter, verse.verse)}
                                                >
                                                    {new Intl.NumberFormat('ar-EG').format(verse.verse)}
                                                </span>
                                            </React.Fragment>
                                        );
                                    })}
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
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 font-amiri ${bookmarked
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

            {/* Quick tap-to-translate popover */}
            <AnimatePresence>
                {wordPopover.open && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={closeWordPopover} />
                        <div
                            className="fixed z-50 -translate-x-1/2 -translate-y-full pb-1 pointer-events-none"
                            style={{
                                left: wordPopover.x,
                                top: wordPopover.y,
                            }}
                        >
                            <motion.div
                                className="pointer-events-auto"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.12 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative flex items-center justify-center">
                                    {/* <button
                                        onClick={() => {
                                            closeWordPopover();
                                            if (wordPopover.surah && wordPopover.verse) {
                                                openTafsir(wordPopover.surah, wordPopover.verse);
                                            }
                                        }}
                                        aria-label="More options"
                                        className="absolute right-[calc(100%+6px)] top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white shadow-lg shrink-0"
                                    >
                                        <MoreVertical size={16} />
                                    </button> */}

                                    <div
                                        className="relative bg-accent text-white cursor-pointer rounded-xl px-3 py-2 shadow-lg flex items-center gap-1.5 whitespace-nowrap"
                                        dir="ltr"
                                        onClick={() => {
                                            closeWordPopover();
                                            if (wordPopover.surah && wordPopover.verse) {
                                                openTafsir(wordPopover.surah, wordPopover.verse);
                                            }
                                        }}
                                    >
                                        {wordPopover.loading && <span className="text-sm">...</span>}
                                        {wordPopover.error && <span className="text-sm">{wordPopover.error}</span>}
                                        {!wordPopover.loading && !wordPopover.error && (
                                            <>
                                                <span className="text-sm font-medium">
                                                    {wordPopover.translation}
                                                </span>
                                                <ChevronRight size={14} />
                                            </>
                                        )}
                                        <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-accent rotate-45" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

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
            <AnimatePresence>
                {wordExplanation.open && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeWordExplanation}
                    >
                        <motion.div
                            dir="rtl"
                            className="bg-bg-surface w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl border border-border-subtle p-6 max-h-[70vh] flex flex-col"
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="font-hafs-uthmanic text-2xl text-accent">
                                    {wordExplanation.word}
                                </p>
                                <button
                                    onClick={closeWordExplanation}
                                    className="text-text-muted hover:text-text-base transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                {wordExplanation.loading && (
                                    <div className="py-8 text-center text-text-muted">
                                        جارٍ التحميل...
                                    </div>
                                )}
                                {wordExplanation.error && (
                                    <div className="py-8 text-center text-red-500">
                                        {wordExplanation.error}
                                    </div>
                                )}
                                {wordExplanation.explanation && (
                                    <ul className="space-y-3">
                                        {wordExplanation.explanation.map((point, i) => (
                                            <li
                                                key={i}
                                                className="text-base leading-relaxed text-text-base text-justify"
                                            >
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}