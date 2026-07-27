import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { fetchSurahInfo, fetchQuranText } from '../utils/api';
import { ChapterInfo, Verse } from '../utils/types';
import { useTheme } from '../utils/useTheme';
import { normalizeArabic, getSurahSlug } from '../utils/quranUtils';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { SurahCard } from '../components/SurahCard';
import { SearchResultsView } from '../components/SearchResultsView';
import { LoadingState, ErrorState } from '../components/States';
import { Bookmark } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: IndexRouteComponent,
});

function IndexRouteComponent() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const navigateToSurah = (chapter: ChapterInfo) => {
    const slug = getSurahSlug(chapter);
    navigate({ to: '/$surah/$page', params: { surah: slug, page: '1' } });
  };

  const handleBookmark = () => {
    navigate({
      to: '/bookmarks',
    });
  };
  const normalizedVerses = useMemo(() => {
    return verses.map((v) => ({ ...v, normalizedText: normalizeArabic(v.text) }));
  }, [verses]);

  const matchingSurahs = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return [];
    const query = trimmed.toLowerCase();
    const normalizedQuery = normalizeArabic(trimmed);
    return chapters.filter((c) => {
      const englishMatch = c.englishname.toLowerCase().includes(query);
      const arabicMatch = normalizeArabic(c.arabicname).includes(normalizedQuery);
      return englishMatch || arabicMatch;
    });
  }, [searchQuery, chapters]);

  const searchResults = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return [];
    const normalizedQuery = normalizeArabic(trimmed);
    return normalizedVerses.filter((v) => v.normalizedText.includes(normalizedQuery)).slice(0, 50);
  }, [searchQuery, normalizedVerses]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div dir="rtl" className="min-h-screen bg-bg-base text-text-base flex flex-col transition-colors duration-300 font-sans">
      <Header
        onGoHome={() => setSearchQuery('')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-24 w-full flex-1">

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {searchQuery ? (
          <SearchResultsView
            searchQuery={searchQuery}
            matchingSurahs={matchingSurahs}
            searchResults={searchResults}
            chapters={chapters}
            verses={verses}
            onSelectSurah={(c) => {
              navigateToSurah(c);
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex justify-between items-end border-b border-border-subtle pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-heading">سور القرآن الكريم</h1>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">برواية حفص عن عاصم</p>
              </div>

              <div className='flex items-center gap-2'>
                <span className="text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
                  ١١٤ سورة
                </span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {chapters.map((chapter) => {
                const totalVerses = chapter.verses?.length || verses.filter((v) => v.chapter === chapter.chapter).length;
                return (
                  <SurahCard
                    key={chapter.chapter}
                    chapter={chapter}
                    totalVerses={totalVerses}
                    onSelect={(c) => navigateToSurah(c)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
