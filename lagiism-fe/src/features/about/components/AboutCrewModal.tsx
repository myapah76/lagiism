import React, { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { ABOUT_MEDIA, CREW_ROSTER } from '../data/aboutStory';

interface AboutCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopDrop: () => void;
}

export const AboutCrewModal: React.FC<AboutCrewModalProps> = ({
  isOpen,
  onClose,
  onShopDrop,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="LAGIISM Crew Archive"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0E0E0E]/75 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#F4F3EF] border-2 border-[#111111] text-[#111111]">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 md:px-7 py-4 bg-[#F4F3EF] border-b border-[#111111]">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E3E24]">
              CREW ARCHIVE (05)
            </p>
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-[-0.03em]">
              LAGIISM SKATE CREW — DROP 01
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close crew archive"
            className="w-11 h-11 inline-flex items-center justify-center border border-[#111111] bg-[#EAE8E1] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 md:p-6 border-b border-[#111111]">
          <div className="border border-[#111111] bg-[#F4F3EF] overflow-hidden">
            <img
              src={ABOUT_MEDIA.crewReference}
              alt="Five LAGIISM skateboarders wearing Drop 01 garments"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#D4D2CA]">
          {CREW_ROSTER.map((member, idx) => (
            <div key={member.id} className="p-4 flex flex-col justify-between bg-[#F4F3EF]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-[#6E6D68]">
                    0{idx + 1}
                  </span>
                  <span
                    className="w-3 h-3 border border-[#111111]"
                    style={{ backgroundColor: member.accent }}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-base font-black uppercase tracking-[-0.02em]">
                  {member.name}
                </h3>
                <p className="font-mono text-[10px] uppercase text-[#9E3E24] mt-0.5">
                  {member.role}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#D4D2CA] space-y-1">
                {member.garments.map((item) => (
                  <div
                    key={item}
                    className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#6E6D68]"
                  >
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 md:px-7 py-4 bg-[#EAE8E1] border-t border-[#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6E6D68]">
            LA GI, BÌNH THUẬN — TP.HCM
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onShopDrop();
            }}
            className="min-h-[44px] inline-flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] transition-colors cursor-pointer"
          >
            SHOP DROP 01
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
