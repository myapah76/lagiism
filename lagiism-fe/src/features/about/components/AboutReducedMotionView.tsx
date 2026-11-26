import React from 'react';
import { ArrowUpRight, Users } from 'lucide-react';
import { ABOUT_MEDIA, ABOUT_STORY_COPY, KICKFLIP_FRAMES } from '../data/aboutStory';

interface AboutReducedMotionViewProps {
  onShopDrop: () => void;
  onOpenArchive: () => void;
  onOpenCrew: () => void;
}

/**
 * Automatic readable static editorial experience when OS prefers-reduced-motion: reduce.
 * Presents all 5 scenes exactly once in order with zero duplicate copy and zero manual toggles.
 */
export const AboutReducedMotionView: React.FC<AboutReducedMotionViewProps> = ({
  onShopDrop,
  onOpenArchive,
  onOpenCrew,
}) => {
  return (
    <div className="pt-14 bg-[#F4F3EF] text-[#111111]">
      {/* SCENE 01 — THE GATHERING */}
      <section className="border-b border-[#111111]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-6">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#9E3E24]">
              {ABOUT_STORY_COPY.scene01.label}
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-[-0.04em] leading-[0.92] text-[#0E0E0E] mt-3">
              {ABOUT_STORY_COPY.scene01.headline}
            </h1>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#6E6D68] mt-4">
              {ABOUT_STORY_COPY.scene01.subhead}
            </p>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-3">
            <img
              src={ABOUT_MEDIA.detailShoesBoard}
              alt="Skateboard deck grip and cuffed denim detail"
              className="w-full aspect-[4/3] object-cover border border-[#111111] bg-[#EAE8E1]"
            />
            <img
              src={ABOUT_MEDIA.detailWheelsStance}
              alt="Urethane skate wheels on concrete slab"
              className="w-full aspect-[4/3] object-cover border border-[#111111] bg-[#EAE8E1]"
            />
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 pb-14">
          <div className="relative border border-[#111111] overflow-hidden bg-[#EAE8E1]">
            <img
              src={ABOUT_MEDIA.bgGathering}
              alt="Illustrated La Gi coastal concrete skatepark"
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        </div>
      </section>

      {/* SCENE 02 — THE MOVEMENT */}
      <section className="border-b border-[#111111] bg-[#EAE8E1]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D2B44]">
              {ABOUT_STORY_COPY.scene02.label}
            </p>
            <p className="text-base md:text-lg leading-relaxed text-[#111111] font-medium">
              {ABOUT_STORY_COPY.scene02.paragraph}
            </p>
            <dl className="grid grid-cols-3 border border-[#111111] bg-[#F4F3EF] divide-x divide-[#D4D2CA] font-mono text-[10px] uppercase">
              {ABOUT_STORY_COPY.scene02.materials.map((m) => (
                <div key={m.label} className="p-3">
                  <dt className="text-[#6E6D68]">{m.label}</dt>
                  <dd className="font-bold text-[#111111] mt-1">{m.spec}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-7 border border-[#111111] bg-[#F4F3EF] overflow-hidden">
            <img
              src={ABOUT_MEDIA.bgMovement}
              alt="Illustrated Saigon urban streetscape"
              loading="lazy"
              decoding="async"
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        </div>
      </section>

      {/* SCENE 03 — THE KICKFLIP */}
      <section className="border-b border-[#111111] bg-[#F4F3EF]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-14 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E3E24]">
              {ABOUT_STORY_COPY.scene03.label}
            </p>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.04em] text-[#0E0E0E] mt-2">
              {ABOUT_STORY_COPY.scene03.headline}
            </h2>
          </div>
          <div className="mt-8 relative border border-[#111111] overflow-hidden bg-[#EAE8E1] aspect-[16/9] flex items-center justify-center">
            <img
              src={ABOUT_MEDIA.bgKickflip}
              alt="Low-angle Saigon concrete stair set"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
            <img
              src={KICKFLIP_FRAMES[5]}
              alt="Skateboard kickflip apex rotation overhead"
              loading="lazy"
              decoding="async"
              className="relative z-10 max-h-[88%] w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* SCENE 04 — CREW & IDENTITY */}
      <section className="border-b border-[#111111] bg-[#EAE8E1]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 border border-[#111111] bg-[#F4F3EF] overflow-hidden">
            <img
              src={ABOUT_MEDIA.crewReference}
              alt="LAGIISM 5-skater crew lineup"
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#9E3E24]">
              {ABOUT_STORY_COPY.scene04.label}
            </p>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[-0.03em] text-[#0E0E0E]">
              {ABOUT_STORY_COPY.scene04.brandLine}
            </h2>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#6E6D68]">
              {ABOUT_STORY_COPY.scene04.locations}
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#111111]">
              {ABOUT_STORY_COPY.scene04.paragraph}
            </p>
          </div>
        </div>
      </section>

      {/* SCENE 05 — ARCHIVE REVEAL */}
      <section className="bg-[#F4F3EF]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E3E24]">
              {ABOUT_STORY_COPY.scene05.label}
            </p>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-[-0.05em] leading-[0.86] text-[#0E0E0E] mt-2">
              {ABOUT_STORY_COPY.scene05.wordmark}
            </h2>
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#6E6D68] mt-3">
              {ABOUT_STORY_COPY.scene05.subhead}
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#111111] mt-4 max-w-[54ch]">
              {ABOUT_STORY_COPY.scene05.paragraph}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onShopDrop}
                className="min-h-[48px] inline-flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] transition-colors cursor-pointer"
              >
                SHOP DROP 01
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenArchive}
                className="min-h-[48px] inline-flex items-center gap-2 bg-[#EAE8E1] text-[#111111] border border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] transition-colors cursor-pointer"
              >
                ARCHIVE
              </button>
              <button
                type="button"
                onClick={onOpenCrew}
                className="min-h-[48px] inline-flex items-center gap-2 bg-[#F4F3EF] text-[#111111] border border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#1D2B44] hover:text-[#F4F3EF] transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" aria-hidden="true" />
                CREW ARCHIVE (05)
              </button>
            </div>
          </div>

          <dl className="mt-12 grid grid-cols-2 md:grid-cols-4 border border-[#111111] bg-[#EAE8E1] divide-y md:divide-y-0 md:divide-x divide-[#D4D2CA] font-mono text-[11px] uppercase">
            {ABOUT_STORY_COPY.scene05.specs.map((spec) => (
              <div key={spec.label} className="p-4">
                <dt className="text-[#6E6D68] text-[10px]">{spec.label}</dt>
                <dd className="font-bold text-[#111111] mt-1">
                  {'href' in spec && spec.href ? (
                    <a href={spec.href} className="hover:text-[#9E3E24] transition-colors">
                      {spec.value}
                    </a>
                  ) : (
                    spec.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
};
