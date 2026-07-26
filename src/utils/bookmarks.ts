const STORAGE_KEY = 'quran-reader-bookmarks';

export interface Bookmark {
    id: string;           // unique: `${surahSlug}-${page}`
    surahSlug: string;
    page: number;
    surahArabicName: string;
    surahEnglishName: string;
    createdAt: number;    // Date.now()
}

function load(): Bookmark[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Bookmark[];
    } catch {
        return [];
    }
}

function save(bookmarks: Bookmark[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function getBookmarks(): Bookmark[] {
    return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function isBookmarked(surahSlug: string, page: number): boolean {
    const id = `${surahSlug}-${page}`;
    return load().some((b) => b.id === id);
}

export function addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): void {
    const bookmarks = load();
    const id = `${bookmark.surahSlug}-${bookmark.page}`;
    if (bookmarks.some((b) => b.id === id)) return;
    bookmarks.push({ ...bookmark, id, createdAt: Date.now() });
    save(bookmarks);
}

export function removeBookmark(surahSlug: string, page: number): void {
    const id = `${surahSlug}-${page}`;
    save(load().filter((b) => b.id !== id));
}

export function toggleBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): boolean {
    const id = `${bookmark.surahSlug}-${bookmark.page}`;
    const bookmarks = load();
    const existing = bookmarks.findIndex((b) => b.id === id);
    if (existing >= 0) {
        save(bookmarks.filter((b) => b.id !== id));
        return false;
    } else {
        bookmarks.push({ ...bookmark, id, createdAt: Date.now() });
        save(bookmarks);
        return true;
    }
}
