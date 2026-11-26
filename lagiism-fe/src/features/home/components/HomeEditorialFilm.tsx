import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BRAND_INFO } from '../../../data/catalog';
import { ActiveView } from '../../../types/store';

interface HomeEditorialFilmProps {
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

export const HomeEditorialFilm: React.FC<HomeEditorialFilmProps> = ({ onNavigate }) => {
  return (
    <section
      data-home-section="editorial-film"
      aria-label="LAGIISM About Story Film Preview"
      className="border-y border-[#111111] bg-[#EAE8E1] overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Asymmetric Illustrated Film Frame */}
        <div className="lg:col-span-7 relative border border-[#111111] bg-[#F4F3EF] overflow-hidden">
          <div data-film-media className="will-change-transform">
            <img
              src="/images/about/scene01-skatepark-bg.jpg"
              alt="Illustrated La Gi coastal concrete skatepark editorial preview"
              loading="lazy"
              decoding="async"
              className="w-full aspect-[16/10] object-cover scale-[1.06]"
            />
          </div>
          <div className="absolute bottom-3 left-3 bg-[#0E0E0E]/85 backdrop-blur-sm text-[#F4F3EF] border border-[#F4F3EF]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em]">
            LA GI BREAKWATER // {BRAND_INFO.coordinates}
          </div>
        </div>

        {/* Editorial Storytelling Copy & Route Entry */}
        <div data-reveal-block className="lg:col-span-5 space-y-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#9E3E24]">
            EDITORIAL FILM // LA GI — SAIGON
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[-0.04em] text-[#0E0E0E] leading-[0.94]">
            THE SKATEBOARDING STORY BEHIND DROP 01
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-[#111111]/85 max-w-[44ch]">
            Scroll through four illustrated 2.5D scenes—from the concrete seawall
            gathering in La Gi to a slow-motion stair kickflip in Saigon.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('ABOUT')}
              className="min-h-[48px] inline-flex items-center gap-3 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] transition-colors cursor-pointer"
            >
              <span>ENTER ABOUT STORY</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
