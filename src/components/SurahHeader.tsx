import React from 'react';

interface SurahHeaderProps {
  surahNumber: number;
  showBismillah?: boolean;
  progressPercent: number;
  hizbInfo: { hizb: number; quarter: number };
  showHizbInfo?: boolean;
}

export const SurahHeader: React.FC<SurahHeaderProps> = ({
  surahNumber,
  showBismillah = true,
  progressPercent,
  hizbInfo,
  showHizbInfo = false,
}) => {
  return (
    <>
      {showBismillah && surahNumber !== 9 && surahNumber !== 1 && (
        <div className="text-center my-6 sm:my-10">
          <p className="text-2xl sm:text-3xl md:text-4xl font-hafs-uthmanic text-text-heading leading-relaxed">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="w-16 h-0.5 bg-accent/30 mx-auto mt-4 rounded-full" />
        </div>
      )}

      {showHizbInfo && (
        <div className="flex justify-end ml-4 mb-0.5">
          <div dir="ltr" className="flex items-center gap-1.5 text-sm font-medium text-text-base">
            {/* <span>{new Intl.NumberFormat('ar-EG').format(progressPercent)}٪</span> */}
            {/* <span className="w-1 h-1 rounded-full bg-accent opacity-50" /> */}
            <span dir="rtl">
              الحزب {new Intl.NumberFormat('ar-EG').format(hizbInfo.hizb)}
              {hizbInfo.quarter !== 1 && (
                <>
                  {' - '}
                  الربع {new Intl.NumberFormat('ar-EG').format(hizbInfo.quarter)}
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
