import React from 'react';
import { m } from 'motion/react';
import { ArrowUpRight, Users } from 'lucide-react';
import { BRAND_INFO } from '../../../data/catalog';

interface StageArchiveRevealProps {
  onExploreShop: () => void;
  onOpenCrewSheet: () => void;
}

/**
 * STAGE 05 — FINAL BRAND / ARCHIVE REVEAL
 * Clean unpinned section immediately after the cinematic story finishes.
 * Holds official establishment/atelier metadata ONCE and keeps all shopping
 * and crew archive actions immediately accessible.
 */
export const StageArchiveReveal: React.FC<StageArchiveRevealProps> = ({
  onExploreShop,
  onOpenCrewSheet,
}) => {
  return (
    <section
      id="stage-05-archive"
      aria-label="Final brand archive reveal"
      className="relative w-full bg-[#EAE8E1] border-t-2 border-[#111111] text-[#111111]"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end border-b border-[#111111] pb-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E3E24]">
              05 — FINAL BRAND / ARCHIVE REVEAL
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.9] text-[#0E0E0E] mt-3">
              {BRAND_INFO.dropLabel}
            </h2>
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#6E6D68] mt-3">
              {BRAND_INFO.name} — {BRAND_INFO.established} // {BRAND_INFO.locations}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
            <m.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExploreShop}
              className="min-h-[48px] inline-flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border-2 border-[#111111] px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] cursor-pointer"
            >
              SHOP DROP 01 ARCHIVE
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </m.button>

            <m.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenCrewSheet}
              className="min-h-[48px] inline-flex items-center gap-2 bg-[#F4F3EF] text-[#111111] border-2 border-[#111111] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#1D2B44] hover:text-[#F4F3EF] cursor-pointer"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              CREW ARCHIVE (05)
            </m.button>
          </div>
        </div>

        {/* Single Source of Atelier & Origin Specs (Never duplicated in Scenes 01–04) */}
        <dl className="grid grid-cols-2 md:grid-cols-4 border-x border-b border-[#111111] bg-[#F4F3EF] divide-y md:divide-y-0 md:divide-x divide-[#D4D2CA] font-mono text-[11px] uppercase">
          <div className="p-5">
            <dt className="text-[#6E6D68] text-[10px]">COASTAL BASE</dt>
            <dd className="font-bold text-[#111111] mt-1">LA GI, BÌNH THUẬN</dd>
          </div>
          <div className="p-5">
            <dt className="text-[#6E6D68] text-[10px]">URBAN STUDIO</dt>
            <dd className="font-bold text-[#111111] mt-1">TP.HCM (QUẬN 1)</dd>
          </div>
          <div className="p-5">
            <dt className="text-[#6E6D68] text-[10px]">COORDINATES</dt>
            <dd className="font-bold text-[#1D2B44] mt-1">{BRAND_INFO.coordinates}</dd>
          </div>
          <div className="p-5">
            <dt className="text-[#6E6D68] text-[10px]">ATELIER CONTACT</dt>
            <dd className="font-bold text-[#111111] mt-1">STUDIO@LAGIISM.VN</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};
