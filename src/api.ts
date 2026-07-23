import { QuranEdition, QuranInfo } from './types';

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1';

export async function fetchSurahInfo(): Promise<QuranInfo> {
  const response = await fetch(`${CDN_BASE}/info.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch Surah info');
  }
  return response.json();
}

export async function fetchQuranText(): Promise<QuranEdition> {
  const response = await fetch(`${CDN_BASE}/editions/ara-quranuthmanihaf.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch Quran text');
  }
  return response.json();
}
