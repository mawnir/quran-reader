// context/SettingsSheetContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

const SettingsSheetContext = createContext<{
    isOpen: boolean;
    open: () => void;
    close: () => void;
} | null>(null);

export function SettingsSheetProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <SettingsSheetContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
            {children}
        </SettingsSheetContext.Provider>
    );
}

export function useSettingsSheet() {
    const ctx = useContext(SettingsSheetContext);
    if (!ctx) throw new Error('useSettingsSheet must be used within SettingsSheetProvider');
    return ctx;
}