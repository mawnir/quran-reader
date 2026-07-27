import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../utils/useInstallPrompt';

const DISMISS_KEY = 'installPromptDismissedAt';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // don't re-nag for 7 days

export function InstallPrompt() {
    const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        const lastDismissed = localStorage.getItem(DISMISS_KEY);
        const recentlyDismissed =
            lastDismissed && Date.now() - Number(lastDismissed) < DISMISS_COOLDOWN_MS;
        setDismissed(!!recentlyDismissed);
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
        setDismissed(true);
    };

    const handleInstall = async () => {
        await promptInstall();
    };

    if (isInstalled || !isInstallable || dismissed) return null;

    return (
        <div
            dir="rtl"
            className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-sm z-50 bg-bg-surface border border-border-subtle rounded-2xl shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/10 text-accent flex-shrink-0">
                <img src="/quran-icon-512.png" alt="Logo" className="w-10 h-10 rounded-xl" />
            </div>

            <div className="flex-1 min-w-0">
                {/* <p className="text-sm font-semibold text-text-base">ثبّت التطبيق</p> */}
                <p className="text-sm font-semibold text-text-base">
                    ثبّت المصحف على جهازك لقراءته دون اتصال بالإنترنت
                </p>

                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleInstall}
                        className="px-3 py-1.5 rounded-full bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
                    >
                        تثبيت
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-3 py-1.5 rounded-full text-text-muted text-xs font-medium hover:text-text-base transition-colors"
                    >
                        لاحقًا
                    </button>
                </div>
            </div>

            <button
                onClick={handleDismiss}
                className="text-text-muted hover:text-text-base transition-colors flex-shrink-0"
                aria-label="إغلاق"
            >
                <X size={16} />
            </button>
        </div>
    );
}