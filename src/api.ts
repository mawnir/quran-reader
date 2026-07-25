import { QuranEdition, QuranInfo, Verse, ChapterInfo } from './types';

const QURAN_DATA_URL = '/data/quran_data.json';

interface QuranJsonSurah {
  id: number;
  name: string;
  transliteration: string;
  type: string; // "meccan" | "medinan"
  total_verses: number;
  verses: Array<{
    id: number;
    text: string;
  }>;
}

let cachedQuranData: QuranJsonSurah[] | null = null;

async function fetchFullQuran(): Promise<QuranJsonSurah[]> {
  if (cachedQuranData) {
    return cachedQuranData;
  }

  const response = await fetch(QURAN_DATA_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch Quran data');
  }
  cachedQuranData = await response.json();
  return cachedQuranData!;
}

export async function fetchSurahInfo(): Promise<QuranInfo> {
  const surahs = await fetchFullQuran();
  const chapters: ChapterInfo[] = surahs.map((s) => ({
    chapter: s.id,
    name: s.name,
    englishname: s.transliteration,
    arabicname: s.name,
    revelation: s.type === 'meccan' ? 'Meccan' : 'Medinan',
  }));

  return { chapters };
}

export async function fetchQuranText(): Promise<QuranEdition> {
  const surahs = await fetchFullQuran();
  const quran: Verse[] = [];

  for (const surah of surahs) {
    for (const v of surah.verses) {
      quran.push({
        chapter: surah.id,
        verse: v.id,
        text: v.text,
      });
    }
  }

  return { quran };
}

