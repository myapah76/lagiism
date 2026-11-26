import React from 'react';
import { BRAND_INFO } from '../data/catalog';
import { ActiveView } from '../types/store';

interface FooterProps {
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t-2 border-[#111111] bg-[#0E0E0E] text-[#F4F3EF]">
      {/* Oversized Editorial Wordmark Band */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-14 md:pt-20 pb-10 border-b border-[#6E6D68]/30">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="text-5xl sm:text-7xl md:text-[96px] font-black uppercase tracking-[-0.05em] leading-[0.84] text-[#F4F3EF]">
            {BRAND_INFO.name}
          </div>
          <div className="lg:text-right font-mono text-[11px] uppercase tracking-[0.1em]">
            <p className="text-[#EAE8E1]">
              {BRAND_INFO.established} // {BRAND_INFO.locations}
            </p>
            <p className="text-[#9E3E24] mt-1.5">
              GPS {BRAND_INFO.coordinates}
            </p>
          </div>
        </div>
      </div>

      {/* Archive Index & Atelier Contact */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[#6E6D68]/30">
        <div className="md:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6E6D68] mb-4">
            ARCHIVE INDEX
          </p>
          <nav
            aria-label="Footer Navigation"
            className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6"
          >
            <button
              type="button"
              onClick={() => onNavigate('HOME', 'drop-collection')}
              className="min-h-[40px] text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              01 // NEW IN
            </button>
            <button
              type="button"
              onClick={() => onNavigate('SHOP_ALL')}
              className="min-h-[40px] text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              02 // SHOP ALL
            </button>
            <button
              type="button"
              onClick={() => onNavigate('HOME', 'shop-the-set')}
              className="min-h-[40px] text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              03 // SETS
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ABOUT')}
              className="min-h-[40px] text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              04 // ABOUT STORY
            </button>
            <button
              type="button"
              onClick={() => onNavigate('RUNWAY')}
              className="min-h-[40px] text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              05 // RUNWAY
            </button>
          </nav>
        </div>

        <div className="md:col-span-5 md:text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6E6D68] mb-4">
            ATELIER CONTACT
          </p>
          <a
            href="mailto:STUDIO@LAGIISM.VN"
            className="font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors"
          >
            STUDIO@LAGIISM.VN
          </a>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6E6D68] mt-2">
            LA GI, BÌNH THUẬN — TP.HCM
          </p>
        </div>
      </div>

      {/* Bottom Legal & Campaign Strip */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6E6D68]">
        <span>© 2026 {BRAND_INFO.name}. ALL RIGHTS RESERVED.</span>
        <span>DROP 01 // COASTAL CONCRETE &amp; URBAN ASPHALT</span>
      </div>
    </footer>
  );
};
