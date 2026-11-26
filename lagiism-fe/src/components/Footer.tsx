import React from 'react';
import { BRAND_INFO } from '../data/catalog';
import { ActiveView } from '../types/store';

interface FooterProps {
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t-2 border-[#111111] bg-[#0E0E0E] text-[#F4F3EF]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-[#6E6D68]/30">
        {/* Column 1: Brand Origin */}
        <div className="md:col-span-5">
          <div className="text-2xl md:text-3xl font-black uppercase tracking-[-0.04em] text-[#F4F3EF]">
            {BRAND_INFO.name}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#EAE8E1] mt-2">
            {BRAND_INFO.established} // {BRAND_INFO.locations}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#9E3E24] mt-2">
            GPS {BRAND_INFO.coordinates}
          </p>
        </div>

        {/* Column 2: Storefront Index */}
        <div className="md:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6E6D68] mb-3">
            ARCHIVE INDEX
          </p>
          <nav
            aria-label="Footer Navigation"
            className="grid grid-cols-2 gap-y-2.5 gap-x-6"
          >
            <button
              type="button"
              onClick={() => onNavigate('HOME', 'drop-collection')}
              className="text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              01 // NEW IN
            </button>
            <button
              type="button"
              onClick={() => onNavigate('SHOP_ALL')}
              className="text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              02 // SHOP ALL
            </button>
            <button
              type="button"
              onClick={() => onNavigate('HOME', 'shop-the-set')}
              className="text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              03 // SETS
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ABOUT')}
              className="text-left font-mono text-xs font-bold uppercase text-[#F4F3EF] hover:text-[#9E3E24] transition-colors cursor-pointer"
            >
              04 // ABOUT STORY
            </button>
          </nav>
        </div>

        {/* Column 3: Atelier Specs */}
        <div className="md:col-span-3 md:text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6E6D68] mb-3">
            ATELIER CONTACT
          </p>
          <p className="font-mono text-xs uppercase text-[#EAE8E1]">
            STUDIO@LAGIISM.VN
          </p>
          <p className="font-mono text-[10px] uppercase text-[#6E6D68] mt-2">
            LA GI, BÌNH THUẬN — TP.HCM
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6E6D68]">
        <span>© 2026 {BRAND_INFO.name}. ALL RIGHTS RESERVED.</span>
        <span>DROP 01 // COASTAL CONCRETE &amp; URBAN ASPHALT</span>
      </div>
    </footer>
  );
};
