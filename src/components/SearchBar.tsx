import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, onClear }) => {
  return (
    <div className="mb-6 sm:mb-8 max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث عن سورة أو آية أو كلمة..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border border-border-input rounded-2xl font-amiri py-3 pr-11 pl-10 bg-accent/5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-text-base placeholder-text-muted transition-all shadow-xs"
        />
        <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading p-1 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
