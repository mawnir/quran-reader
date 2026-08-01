import { useSettingsSheet } from '../context/SettingsSheetContext';
import { Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
    Moon,
    Sun,
    Bookmark,
    Key,
    Eye,
    EyeOff,
    Check,
    Trash2,
    ArrowLeft,
    AlertCircle,
    Settings,
} from 'lucide-react';
import { useTheme } from '../utils/useTheme';
import { GROK_API_KEY_STORAGE } from '../services/groqService';
export function SettingsSheet() {
    const { isOpen, close } = useSettingsSheet();
    const { theme, toggleTheme } = useTheme();

    const [apiKey, setApiKey] = useState('');
    const [savedKey, setSavedKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

    useEffect(() => {
        const stored = localStorage.getItem(GROK_API_KEY_STORAGE) ?? '';
        setSavedKey(stored);
        setApiKey(stored);
    }, []);

    const handleSaveKey = () => {
        const trimmed = apiKey.trim();
        if (!trimmed) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 2000);
            return;
        }
        localStorage.setItem(GROK_API_KEY_STORAGE, trimmed);
        setSavedKey(trimmed);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
    };

    const handleRemoveKey = () => {
        localStorage.removeItem(GROK_API_KEY_STORAGE);
        setSavedKey('');
        setApiKey('');
        setSaveStatus('idle');
    };

    const maskedKey = (key: string) =>
        key.length > 8 ? `${key.slice(0, 4)}${'•'.repeat(key.length - 8)}${key.slice(-4)}` : '••••••••';


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                    />
                    <motion.div
                        dir="rtl"
                        className="fixed bottom-0 inset-x-0 z-50 bg-bg-base rounded-t-3xl max-h-[85vh] overflow-y-auto"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.15}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) close();
                        }}
                    >
                        <div className="w-10 h-1.5 bg-border-subtle rounded-full mx-auto mt-3 mb-2" />

                        <main className="max-w-2xl mx-auto w-full px-3 sm:px-6 pt-6 sm:pt-10 pb-28 flex-1">
                            <div className="mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 text-accent">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-text-heading font-amiri">الإعدادات</h1>
                                    <p className="text-xs text-text-muted mt-0.5">تخصيص تجربة القراءة</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* General: theme + bookmarks, flattened into one card */}
                                <div className="bg-bg-surface border border-border-subtle rounded-2xl divide-y divide-border-subtle">
                                    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-bg-hover flex items-center justify-center flex-shrink-0">
                                                {theme === 'dark' ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-accent" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-heading">
                                                    {theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}
                                                </p>
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    {theme === 'dark' ? 'انقر للتبديل إلى الوضع النهاري' : 'انقر للتبديل إلى الوضع الليلي'}
                                                </p>
                                            </div>
                                        </div>
                                        <ThemeToggle theme={theme} onToggle={toggleTheme} />
                                    </div>

                                    <Link
                                        to="/bookmarks"
                                        className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-bg-hover transition-colors group"
                                        onClick={close}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-bg-hover flex items-center justify-center flex-shrink-0">
                                                <Bookmark className="w-4 h-4 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-heading">المفضلة</p>
                                                <p className="text-xs text-text-muted mt-0.5">الصفحات المحفوظة</p>
                                            </div>
                                        </div>
                                        <ArrowLeft className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                                    </Link>
                                </div>

                                {/* API Key */}
                                <div className="bg-bg-surface border border-border-subtle rounded-2xl px-4 py-4 space-y-4">
                                    <AnimatePresence>
                                        {savedKey && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                className="flex items-center justify-between gap-3 bg-accent/10 border border-accent/20 rounded-xl px-3.5 py-2.5"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Key className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                                    <span className="text-xs font-mono text-accent truncate">{maskedKey(savedKey)}</span>
                                                </div>
                                                <button
                                                    onClick={handleRemoveKey}
                                                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-red-500/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                    aria-label="حذف مفتاح API"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-2">
                                        <label htmlFor="api-key" className="text-xs font-medium text-text-muted block">
                                            مفتاح Groq API
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="api-key"
                                                type={showKey ? 'text' : 'password'}
                                                value={apiKey}
                                                onChange={(e) => {
                                                    setApiKey(e.target.value);
                                                    setSaveStatus('idle');
                                                }}
                                                placeholder="•••••••••••••••••••••••"
                                                dir="ltr"
                                                className={`w-full pr-4 pl-10 py-2.5 rounded-xl text-sm font-mono bg-bg-base border transition-all duration-200 outline-none placeholder:text-text-muted/40 text-text-heading ${saveStatus === 'error'
                                                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                                                    : 'border-border-input focus:border-accent focus:ring-2 focus:ring-accent/20'
                                                    }`}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKey((v) => !v)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading transition-colors"
                                                aria-label={showKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                                            >
                                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {saveStatus === 'error' && (
                                            <p className="flex items-center gap-1.5 text-xs text-red-500">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                يرجى إدخال مفتاح صالح
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSaveKey}
                                        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2 active:scale-95 ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-accent text-white hover:bg-accent/90'
                                            }`}
                                    >
                                        {saveStatus === 'saved' ? (
                                            <>
                                                <Check className="w-4 h-4" /> تم الحفظ
                                            </>
                                        ) : (
                                            <>
                                                <Key className="w-4 h-4" /> حفظ المفتاح
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-text-muted leading-relaxed">
                                        يُستخدم المفتاح لتفسير الكلمات القرآنية بالذكاء الاصطناعي. يُخزَّن محلياً على جهازك فقط ولا يُرسَل لأي خادم.
                                    </p>
                                </div>
                            </div>
                        </main>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


function ThemeToggle({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
    const isDark = theme === 'dark';
    const { close } = useSettingsSheet();

    return (
        <button
            onClick={() => { close(); onToggle(); }}
            role="switch"
            aria-checked={isDark}
            aria-label="تبديل الوضع"
            className={`relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${isDark ? 'bg-accent' : 'bg-border-input'
                }`}
        >
            <span
                className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? '-translate-x-5 ' : 'translate-x-0'
                    }`}
            >
                {isDark ? <Moon className="w-3 h-3 text-accent" /> : <Sun className="w-3 h-3 text-amber-500" />}
            </span>
        </button>
    );
}