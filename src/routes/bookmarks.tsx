import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, BookmarkX, BookOpen, Trash2 } from 'lucide-react';
import { getBookmarks, removeBookmark, Bookmark as BookmarkType } from '../utils/bookmarks';
import { useTheme } from '../utils/useTheme';
import { Header } from '../components/Header';

export const Route = createFileRoute('/bookmarks')({
    component: BookmarksRouteComponent,
});

function BookmarksRouteComponent() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

    useEffect(() => {
        setBookmarks(getBookmarks());
    }, []);

    const handleNavigate = (bm: BookmarkType) => {
        navigate({
            to: '/$surah/$page',
            params: { surah: bm.surahSlug, page: bm.page.toString() },
        });
    };

    const handleDelete = (e: React.MouseEvent, bm: BookmarkType) => {
        e.stopPropagation();
        removeBookmark(bm.surahSlug, bm.page);
        setBookmarks(getBookmarks());
    };

    const handleClearAll = () => {
        bookmarks.forEach((bm) => removeBookmark(bm.surahSlug, bm.page));
        setBookmarks([]);
    };

    return (
        <div dir="rtl" className="min-h-screen bg-bg-base text-text-base flex flex-col transition-colors duration-300 font-sans">


            <Header
                surahTitle={"المفضلة"}
                onGoHome={() => navigate({ to: '/' })}
                theme={theme}
                onToggleTheme={toggleTheme}
                bookmark={true}
            />

            <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-24 w-full flex-1">
                {/* Page heading */}
                <div className="mb-6 flex justify-between items-end border-b border-border-subtle pb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-text-heading flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-accent" />
                            الصفحات المحفوظة
                        </h1>
                    </div>

                    {bookmarks.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full px-3 py-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            حذف الكل
                        </button>
                    )}
                </div>

                {bookmarks.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center gap-4 py-24 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <BookmarkX className="w-8 h-8 text-accent/60" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-text-heading">لا توجد علامات مرجعية بعد</p>
                            <p className="text-sm text-text-muted mt-1">
                                افتح أي سورة واضغط على زر الإشارة المرجعية لحفظ موضعك
                            </p>
                        </div>
                        <button
                            onClick={() => navigate({ to: '/' })}
                            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                        >
                            <BookOpen className="w-4 h-4" />
                            تصفح السور
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <AnimatePresence initial={false}>
                            {bookmarks.map((bm) => (
                                <motion.div
                                    key={bm.id}
                                    layout
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={() => handleNavigate(bm)}
                                    className="group relative bg-bg-surface border border-border-subtle rounded-2xl p-4 cursor-pointer hover:border-accent/50 hover:shadow-sm transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-hafs-uthmanic text-lg font-bold text-text-heading leading-relaxed truncate">
                                                سورة {bm.surahArabicName.replace('سُوْرَةُ ', '')}
                                            </p>
                                            <span className="inline-flex items-center mt-2 text-xs font-medium text-accent bg-accent/10 rounded-full px-2.5 py-0.5">
                                                الصفحة {new Intl.NumberFormat('ar-EG').format(bm.page)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => handleDelete(e, bm)}
                                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100" aria-label="حذف الإشارة المرجعية"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
