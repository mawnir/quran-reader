import React from 'react';
import { Loader2, Info } from 'lucide-react';

export const LoadingState: React.FC = () => (
  <div dir="rtl" className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
    <Loader2 className="w-10 h-10 animate-spin text-accent mb-3" />
    <p className="text-base font-medium animate-pulse text-text-muted">
      جاري تحميل المصحف الشريف...
    </p>
  </div>
);

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => (
  <div dir="rtl" className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
    <div className="bg-bg-surface text-red-500 p-6 rounded-2xl max-w-md text-center border border-border-subtle shadow-xs">
      <Info className="w-10 h-10 mx-auto mb-3" />
      <p className="font-medium text-sm sm:text-base mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium transition-opacity hover:opacity-90 shadow-xs"
      >
        إعادة المحاولة
      </button>
    </div>
  </div>
);
