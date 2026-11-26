import React from 'react';
import { m } from 'motion/react';
import { Users } from 'lucide-react';
import { SCENE_CHAPTERS, SceneChapter } from '../data/aboutEditorialData';

interface EditorialChromeProps {
  activeSceneIndex: number;
  onSelectChapter: (chapter: SceneChapter) => void;
  onOpenCrewSheet: () => void;
  reducedMotion: boolean;
}

export const EditorialChrome: React.FC<EditorialChromeProps> = ({
  activeSceneIndex,
  onSelectChapter,
  onOpenCrewSheet,
  reducedMotion,
}) => {
  return (
    <>
      {/* Subtle screen-print / paper grain texture overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 opacity-[0.055] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Right-hand editorial chapter rail (>=44px touch targets, LazyMotion m.button) */}
      <nav
        aria-label="About Us story chapters"
        className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-end gap-2"
      >
        <div className="bg-[#F4F3EF]/92 backdrop-blur-sm border border-[#111111] p-1.5 flex flex-col gap-1">
          {SCENE_CHAPTERS.map((chapter, idx) => {
            const isActive = idx === activeSceneIndex;
            return (
              <m.button
                key={chapter.id}
                type="button"
                whileHover={reducedMotion ? undefined : { x: -3 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                onClick={() => onSelectChapter(chapter)}
                className={`min-h-[40px] min-w-[40px] flex items-center justify-end gap-2 px-2.5 py-2 text-right font-mono text-[10px] uppercase tracking-[0.08em] cursor-pointer ${
                  isActive
                    ? 'bg-[#0E0E0E] text-[#F4F3EF]'
                    : 'text-[#6E6D68] hover:text-[#111111] hover:bg-[#EAE8E1]'
                }`}
              >
                <span className="hidden lg:inline">{chapter.title}</span>
                <span className={`font-bold ${isActive ? 'text-[#9E3E24]' : 'text-[#111111]'}`}>
                  {chapter.index}
                </span>
              </m.button>
            );
          })}
        </div>

        <m.button
          type="button"
          whileHover={reducedMotion ? undefined : { y: -2 }}
          whileTap={reducedMotion ? undefined : { scale: 0.97 }}
          onClick={onOpenCrewSheet}
          aria-label="Open 5-skater crew reference sheet"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] hover:bg-[#9E3E24] cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden md:inline">CREW // 05</span>
        </m.button>
      </nav>
    </>
  );
};
