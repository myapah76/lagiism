import React from 'react';
import { ABOUT_STORY, BRAND_INFO } from '../data/catalog';
import { ActiveView } from '../types/store';

interface AboutViewProps {
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 pt-24 pb-20">
      {/* Header Manifest */}
      <div className="border-b border-black pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#555555]">
          {ABOUT_STORY.subhead}
        </p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[-0.03em] text-black mt-2 max-w-4xl">
          {ABOUT_STORY.headline}
        </h1>
        <p className="font-mono text-xs uppercase text-black mt-3">
          {ABOUT_STORY.coordinates}
        </p>
      </div>

      {/* Editorial Story & Coordinates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-b border-black">
        <div className="lg:col-span-6 p-6 md:p-10 space-y-5 border-b lg:border-b-0 lg:border-r border-black bg-white">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[#555555]">
            01 // MANIFESTO
          </div>
          {ABOUT_STORY.paragraphs.map((p, idx) => (
            <p key={idx} className="text-sm md:text-base leading-relaxed text-black">
              {p}
            </p>
          ))}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => onNavigate('SHOP_ALL')}
              className="bg-black text-white border border-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.08em] hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              SHOP DROP 01 ARCHIVE
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#F4F4F4] p-6 md:p-10 flex flex-col justify-between">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[#555555] mb-4">
            02 // ORIGIN & ATELIER SPECS
          </div>
          <dl className="border border-black bg-white divide-y divide-[#E0E0E0] font-mono text-xs">
            <div className="grid grid-cols-2 px-4 py-3">
              <dt className="text-[#555555]">ENTITY</dt>
              <dd className="text-right font-bold">{BRAND_INFO.name}</dd>
            </div>
            <div className="grid grid-cols-2 px-4 py-3">
              <dt className="text-[#555555]">FOUNDED</dt>
              <dd className="text-right font-bold">{BRAND_INFO.established}</dd>
            </div>
            <div className="grid grid-cols-2 px-4 py-3">
              <dt className="text-[#555555]">COASTAL BASE</dt>
              <dd className="text-right font-bold">LA GI, BÌNH THUẬN</dd>
            </div>
            <div className="grid grid-cols-2 px-4 py-3">
              <dt className="text-[#555555]">URBAN STUDIO</dt>
              <dd className="text-right font-bold">TP.HCM (QUẬN 1)</dd>
            </div>
            <div className="grid grid-cols-2 px-4 py-3">
              <dt className="text-[#555555]">GPS MARKER</dt>
              <dd className="text-right font-bold">{BRAND_INFO.coordinates}</dd>
            </div>
            <div className="grid grid-cols-2 px-4 py-3">
              <dt className="text-[#555555]">CONTACT</dt>
              <dd className="text-right font-bold">STUDIO@LAGIISM.VN</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Lookbook Photos */}
      <div className="mt-14">
        <div className="flex items-center justify-between pb-3 border-b border-black">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[-0.02em]">
            DROP 01 // LOOKBOOK ARCHIVE
          </h2>
          <span className="font-mono text-[11px] uppercase text-[#555555]">
            LA GI — SAIGON
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {ABOUT_STORY.lookbookShots.map((shot) => (
            <figure key={shot.id} className="border border-black bg-[#F4F4F4]">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={shot.image}
                  alt={shot.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 border-t border-black bg-white flex items-center justify-between gap-2 font-mono text-[10px] uppercase">
                <span className="font-bold text-black">{shot.caption}</span>
                <span className="text-[#555555] shrink-0">
                  {shot.coordinates}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
