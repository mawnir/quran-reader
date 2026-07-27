<div align="center">

# 📖 القرآن الكريم — Quran Reader

**تطبيق ويب أنيق وعصري لقراءة القرآن الكريم بخط حفص العثماني**

*A clean, modern web app for reading the Holy Quran with Uthmani Hafs typography*

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## ✨ المميزات — Features

### 📚 القراءة — Reading
- **📖 قراءة صفحة بصفحة** — Paginated reading following the traditional Mus-haf layout, with smooth animated page transitions.
- **🕌 خط حفص العثماني** — Authentic Uthmani Hafs script rendered at comfortable sizes for immersive reading.
- **بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ** — Basmala displayed automatically at the start of every Surah.

### 🔍 البحث — Search
- **🔍 بحث عربي فوري** — Real-time search across all **114 Surahs** by Arabic name, English name, or verse text.
- **🧹 تطبيع النص** — Arabic text normalization (removes tashkeel/diacritics) for accurate, forgiving search results.
- **نتائج الآيات** — Verse-level search results with up to 50 matching ayahs shown instantly.

### 📊 متابعة القراءة — Progress & Navigation
- **📊 مؤشر الحزب والتقدم** — Live display of the current **Hizb number** and **Surah completion percentage** per page.
- **📱 التمرير باللمس** — Touch and swipe gesture navigation (left/right) on mobile and desktop.
- **⌨️ التنقل بالأزرار** — Previous/Next pagination controls with keyboard-accessible buttons.

### 🔖 الإشارات المرجعية — Bookmarks
- **🔖 حفظ موضع القراءة** — Bookmark any page within any Surah with a single tap.
- **📋 صفحة المفضلة** — Dedicated bookmarks page (`/bookmarks`) with a grid view of all saved positions.
- **🗑️ حذف الإشارات** — Remove individual bookmarks or clear all at once.
- **💾 التخزين المحلي** — Bookmarks persisted in `localStorage` — no account required.

### 📖 التفسير والترجمة — Tafsir & Word-by-Word
- **📝 التفسير الميسر** — Tap any verse number to open a panel with **Al-Tafsir Al-Muyassar** (simplified Arabic explanation) via the AlQuran.cloud API.
- **🔤 كلمة بكلمة** — **Word-by-word** English translation (with transliteration) via the Quran.com API, shown as individual cards for each word.

### 🌙 المظهر — Theming
- **🌙 الوضع الليلي** — Seamless **dark / light** theme toggle, persisted across sessions.
- **🎨 تصميم عصري** — RTL-first layout with a refined design system using CSS custom properties (via Tailwind v4).

---

## 🛠️ التقنيات المستخدمة — Tech Stack

| Layer | Library / Tool |
|---|---|
| UI Framework | **React 19** |
| Language | **TypeScript 5.8** |
| Build Tool | **Vite 6** |
| Routing | **TanStack Router v1** (file-based) |
| Styling | **Tailwind CSS v4** |
| Animations | **Framer Motion** (`motion`) |
| Icons | **Lucide React** |
| Package Manager | **Bun** (or npm) |
| Deployment | **Netlify** |

---

## 🚀 البدء — Getting Started

### 1. تثبيت التبعيات — Install dependencies

```bash
bun install
# or
npm install
```

### 2. إعداد متغيرات البيئة — Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="your_gemini_api_key_here"
APP_URL="http://localhost:3000"
```

> `GEMINI_API_KEY` is only needed if Gemini AI features are in use. The core Quran reading experience works without it.

### 3. تشغيل خادم التطوير — Run the dev server

```bash
bun dev
# or
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 هيكل المشروع — Project Structure

```
quran-reader/
├── public/                        # Static assets
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── Header.tsx             # Sticky header with theme toggle
│   │   ├── SearchBar.tsx          # Arabic search input
│   │   ├── SearchResultsView.tsx  # Search results panel
│   │   ├── SurahCard.tsx          # Surah list card
│   │   ├── SurahHeader.tsx        # Hizb / progress display
│   │   ├── Pagination.tsx         # Page navigation controls
│   │   ├── VerseItem.tsx          # Single verse display
│   │   └── States.tsx             # Loading & error states
│   ├── data/
│   │   └── hizb_data.json         # Hizb quarter boundary data
│   ├── routes/
│   │   ├── index.tsx              # Home — Surah list & search
│   │   ├── bookmarks.tsx          # Saved bookmarks page
│   │   └── $surah/$page/
│   │       └── index.tsx          # Surah reading view + tafsir
│   └── utils/
│       ├── api.ts                 # Quran data fetching
│       ├── bookmarks.ts           # localStorage bookmark helpers
│       ├── quranUtils.ts          # Slug & Arabic normalization utils
│       ├── types.ts               # Shared TypeScript types
│       └── useTheme.ts            # Dark/light theme hook
├── .env.example
├── netlify.toml
├── vite.config.ts
└── package.json
```

---

## 📜 السكريبتات — Scripts

| Command | Description |
|---|---|
| `bun dev` / `npm run dev` | Start dev server on port 3000 |
| `bun run build` / `npm run build` | Build production bundle to `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Type-check with `tsc --noEmit` |
| `bun run clean` | Remove `dist/` and `server.js` |

---

## 🌐 واجهات برمجية خارجية — External APIs

| API | Usage |
|---|---|
| [AlQuran.cloud](https://alquran.cloud/api) | Quran text, Surah metadata & Tafsir Al-Muyassar |
| [Quran.com API v4](https://api-docs.quran.com) | Word-by-word translation & transliteration |

> All API calls are made at runtime from the browser. No API key is required for these public endpoints.

---

## 🤝 المساهمة — Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

<div align="center">

صُنع بـ ❤️ للقرآن الكريم

*Made with ❤️ for the Holy Quran*

</div>
