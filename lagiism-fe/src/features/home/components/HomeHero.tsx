import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { BRAND_INFO } from '../../../data/catalog';
import { ActiveView } from '../../../types/store';

interface HomeHeroProps {
  heroImage: string;
  heroHeadline: string;
  heroSubheadline: string;
  coordinates: string;
  primaryCta: string;
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  heroImage,
  heroHeadline,
  heroSubheadline,
  coordinates,
  primaryCta,
  onNavigate,
}) => {
  return (
    <section
      data-home-hero
      aria-label="LAGIISM Drop 01 Campaign Hero"
      className="pt-14 border-b border-[#111111] bg-[#0E0E0E]"
    >
      <div className="relative w-full min-h-[84svh] max-h-[960px] overflow-hidden flex flex-col justify-between">
        {/* Background Editorial Photography with restrained parallax wrapper */}
        <div
          data-hero-media
          className="absolute inset-0 will-change-transform"
          style={{ transformOrigin: '50% 45%' }}
        >
          <img
            src={heroImage}
            alt="LAGIISM Drop 01 coastal concrete campaign in La Gi"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center select-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#0E0E0E]/45 via-[#0E0E0E]/15 to-[#0E0E0E]/88"
          />
        </div>

        {/* Top Editorial Metadata Strip (Sparing Frosted Glass Pill) */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 md:px-8 pt-6 md:pt-8 flex flex-wrap items-center justify-between gap-3">
          <div
            data-hero-meta
            className="inline-flex items-center gap-2.5 bg-[#0E0E0E]/55 backdrop-blur-md border border-[#F4F3EF]/25 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#F4F3EF]"
          >
            <span className="w-1.5 h-1.5 bg-[#9E3E24] inline-block" aria-hidden="true" />
            <span>NEW ARRIVALS // {coordinates}</span>
          </div>

          <div
            data-hero-meta
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#EAE8E1]/90"
          >
            {BRAND_INFO.established} | {BRAND_INFO.locations}
          </div>
        </div>

        {/* Bottom Oversized Monochrome Editorial Composition */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 md:px-8 pb-8 md:pb-12 pt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <div className="overflow-hidden">
              <p
                data-hero-line
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#EAE8E1]"
              >
                {heroSubheadline}
              </p>
            </div>
            <div className="overflow-hidden mt-2">
              <h1
                data-hero-line
                className="text-4xl sm:text-6xl md:text-7xl xl:text-[84px] font-black uppercase tracking-[-0.045em] leading-[0.88] text-[#F4F3EF]"
              >
                {heroHeadline}
              </h1>
            </div>
            <div className="overflow-hidden mt-3">
              <p
                data-hero-line
                className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.12em] text-[#EAE8E1]/85"
              >
                COASTAL CONCRETE CAMPAIGN IN LA GI
              </p>
            </div>
          </div>

          <div
            data-hero-meta
            className="lg:col-span-4 flex flex-wrap lg:justify-end items-center gap-3"
          >
            <button
              type="button"
              onClick={() => onNavigate('HOME', 'drop-collection')}
              className="min-h-[48px] inline-flex items-center gap-2 bg-[#F4F3EF] text-[#0E0E0E] border border-[#F4F3EF] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] hover:border-[#9E3E24] hover:text-[#F4F3EF] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{primaryCta}</span>
              <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('ABOUT')}
              className="min-h-[48px] inline-flex items-center gap-2 bg-[#0E0E0E]/65 backdrop-blur-md text-[#F4F3EF] border border-[#F4F3EF]/70 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#F4F3EF] hover:text-[#0E0E0E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>EXPLORE STORY</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
