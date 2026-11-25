import React from 'react';
import { BRAND_INFO } from '../data/catalog';
import { ActiveView } from '../types/store';

interface FooterProps {
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-black bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-lg font-black uppercase tracking-[-0.04em] text-black">
            {BRAND_INFO.name}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-[#555555] mt-1">
            {BRAND_INFO.established} | {BRAND_INFO.locations}
          </p>
          <p className="font-mono text-[10px] uppercase text-[#777777] mt-1">
            {BRAND_INFO.coordinates}
          </p>
        </div>

        <nav
          aria-label="Footer Navigation"
          className="flex flex-wrap items-center gap-6"
        >
          <button
            type="button"
            onClick={() => onNavigate('HOME', 'drop-collection')}
            className="font-mono text-[11px] font-bold uppercase hover:underline cursor-pointer"
          >
            NEW IN
          </button>
          <button
            type="button"
            onClick={() => onNavigate('SHOP_ALL')}
            className="font-mono text-[11px] font-bold uppercase hover:underline cursor-pointer"
          >
            SHOP ALL
          </button>
          <button
            type="button"
            onClick={() => onNavigate('HOME', 'shop-the-set')}
            className="font-mono text-[11px] font-bold uppercase hover:underline cursor-pointer"
          >
            SETS
          </button>
          <button
            type="button"
            onClick={() => onNavigate('ABOUT')}
            className="font-mono text-[11px] font-bold uppercase hover:underline cursor-pointer"
          >
            ABOUT
          </button>
        </nav>

        <div className="font-mono text-[10px] uppercase text-[#555555]">
          © 2026 LAGIISM. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};
