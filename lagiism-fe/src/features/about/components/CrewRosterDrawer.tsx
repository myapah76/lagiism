import React, { useEffect } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X, ArrowUpRight } from 'lucide-react';
import { ABOUT_ASSETS, CREW_PROFILES } from '../data/aboutEditorialData';

interface CrewRosterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreShop: () => void;
  reducedMotion: boolean;
}

export const CrewRosterDrawer: React.FC<CrewRosterDrawerProps> = ({
  isOpen,
  onClose,
  onExploreShop,
  reducedMotion,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="LAGIISM Skate Crew Reference Sheet"
        >
          <m.div
            key="crew-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0E0E0E]/75 backdrop-blur-sm"
          />

          <m.div
            key="crew-panel"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#F4F3EF] border-2 border-[#111111] text-[#111111]"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-7 py-4 bg-[#F4F3EF] border-b border-[#111111]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#9E3E24] font-bold">
                  CHARACTER ART SHEET // 05 SKATERS
                </p>
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-[-0.02em]">
                  THE LAGIISM CREW — DROP 01 UNIFORMS
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close crew reference sheet"
                className="w-11 h-11 flex items-center justify-center border border-[#111111] bg-[#EAE8E1] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="border-b border-[#111111] bg-[#F4F3EF] p-4 md:p-6">
              <div className="border border-[#111111] overflow-hidden bg-[#F4F3EF]">
                <img
                  src={ABOUT_ASSETS.crewReference}
                  alt="LAGIISM 5-skater illustrated crew lineup: Khoa, Linh, Minh, Tuấn, and Hà"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#D4D2CA]">
              {CREW_PROFILES.map((member, idx) => (
                <div key={member.id} className="p-4 flex flex-col justify-between bg-[#F4F3EF]">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-[#6E6D68]">
                        0{idx + 1}
                      </span>
                      <span
                        className="w-3 h-3 border border-[#111111]"
                        style={{ backgroundColor: member.accentHex }}
                        title={member.accentHex}
                      />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-[-0.02em]">
                      {member.name}
                    </h3>
                    <p className="font-mono text-[10px] uppercase text-[#9E3E24] mt-0.5">
                      {member.role}
                    </p>
                    <p className="text-xs leading-relaxed text-[#111111] mt-2.5">
                      {member.silhouette}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#D4D2CA] space-y-1">
                    {member.garments.map((garment) => (
                      <div
                        key={garment}
                        className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#6E6D68]"
                      >
                        • {garment}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 md:px-7 py-4 bg-[#EAE8E1] border-t border-[#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase text-[#111111]">
                DROP 01 GARMENTS WORN BY THE LAGIISM CREW.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreShop();
                }}
                className="min-h-[44px] inline-flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#9E3E24] transition-colors cursor-pointer"
              >
                SHOP DROP 01
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};
