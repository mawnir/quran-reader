import { ChapterInfo } from './types';

// Strips Arabic diacritics (tashkeel) and unifies common letter variants
// so searches match regardless of diacritics/hamza differences.
export const normalizeArabic = (text: string) => {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF]/g, '') // diacritics
    .replace(/\u0640/g, '') // tatweel
    .replace(/[إأآا]/g, 'ا') // unify alef forms
    .replace(/ى/g, 'ي') // alef maksura -> ya
    .replace(/ة/g, 'ه') // ta marbuta -> ha
    .trim();
};

// Helper to normalize strings for flexible URL matching
export const normalizeForMatch = (text: string) => {
  return text
    .toLowerCase()
    .replace(/^al-|^at-|^an-|^as-|^az-|^ar-|^ad-|^ash-|^adh-|^al|^sura-|^surah-/, '')
    .replace(/q/g, 'k')
    .replace(/[^a-z0-9]/g, '');
};

export const getSurahSlug = (chapter: ChapterInfo) => {
  return chapter.englishname
    .toLowerCase()
    .replace(/['\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

export const findSurahBySlug = (slug: string, chapterList: ChapterInfo[]): ChapterInfo | null => {
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
