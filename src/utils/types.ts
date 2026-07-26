export interface Verse {
  chapter: number;
  verse: number;
  text: string;
}

export interface QuranEdition {
  quran: Verse[];
}

export interface VerseInfo {
  verse: number;
  line: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  maqra: number;
  sajda: boolean;
}

export interface ChapterInfo {
  chapter: number;
  name: string;
  englishname: string;
  arabicname: string;
  revelation: string;
  verses?: VerseInfo[];
}

export interface QuranInfo {
  chapters: ChapterInfo[];
}
