import React from 'react';
import { m } from 'motion/react';
import { ArrowUpRight, Users } from 'lucide-react';
import { ABOUT_STORY, BRAND_INFO } from '../../../data/catalog';
import { ABOUT_ASSETS, KICKFLIP_SEQUENCE } from '../data/aboutEditorialData';
import { KickflipCanvasHandle, KickflipSequenceCanvas } from './KickflipSequenceCanvas';

interface SceneKickflipFinaleProps {
  kickflipCanvasRef: React.RefObject<KickflipCanvasHandle | null>;
  phaseLabelRef: React.RefObject<HTMLSpanElement | null>;
  reducedMotion: boolean;
  manualFrame: number;
  onSelectManualFrame: (idx: number) => void;
  onExploreShop: () => void;
  onOpenCrewSheet: () => void;
}

/**
 * Unified continuous Scene 03 (The Kickflip) + Scene 04 (The Crew & Identity Reveal).
 * Driven by ONE single pinned GSAP ScrollTrigger timeline so the transition from:
 *   0–20% Approach -> 20–35% Camera Drop -> 35–60% Slow-Mo Kickflip ->
 *   60–75% Landing -> 75–100% Crew Continuation + Wide Pullback + Official Logo
 * happens with zero scene cuts and zero competing pins.
 */
export const SceneKickflipFinale: React.FC<SceneKickflipFinaleProps> = ({
  kickflipCanvasRef,
  phaseLabelRef,
  reducedMotion,
  manualFrame,
  onSelectManualFrame,
  onExploreShop,
  onOpenCrewSheet,
}) => {
  return (
    <section
      id="scene-03-kickflip"
      data-scene="kickflip-finale"
      className="relative w-full h-[100svh] min-h-[680px] max-h-[1120px] overflow-hidden bg-[#F4F3EF]"
    >
      {/* Anchor marker for Scene 04 accessibility / reduced-motion jump */}
      <span id="scene-04-identity" className="sr-only">
        Scene 04 — The Crew and Identity Reveal
      </span>

      {/* LAYER 01A — LOW-ANGLE URBAN STAIR PLAZA (0–75%) */}
      <div
        data-kf-bg-park
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: '50% 68%' }}
      >
        <img
          src={ABOUT_ASSETS.scene03Bg}
          alt="Illustrated urban concrete stair set and skate plaza from low angle"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center select-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#F4F3EF]/85 via-transparent to-[#F4F3EF]/30"
        />
      </div>

      {/* LAYER 01B — WIDE PULLED-BACK ENVIRONMENT FRAME (75–100% continuous reveal) */}
      <div
        data-kf-bg-wide
        className="absolute inset-0 will-change-transform"
        style={{
          transformOrigin: '50% 62%',
          opacity: reducedMotion ? 0.35 : 0,
        }}
      >
        <img
          src={ABOUT_ASSETS.scene04Bg}
          alt="Wide pulled-back illustrated La Gi concrete breakwater and urban horizon"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center select-none"
        />
      </div>

      {/* LAYER 02 — BACKGROUND CREW (Community stays visible behind the trick & follows down stairs) */}
      <div
        data-kf-crew-bg
        className="absolute inset-x-0 bottom-[26%] sm:bottom-[28%] z-10 pointer-events-none flex items-end justify-center will-change-transform"
      >
        <div className="w-[72%] sm:w-[58%] md:w-[46%] max-w-[640px] flex items-end justify-between gap-2 opacity-90">
          <img
            src={ABOUT_ASSETS.cruiseBgPair}
            alt="LAGIISM crew members following through the skatepark"
            loading="lazy"
            decoding="async"
            className="w-[48%] h-auto select-none"
          />
          <img
            src={ABOUT_ASSETS.cruiseMidPair}
            alt="LAGIISM crew skaters watching and rolling behind Khoa"
            loading="lazy"
            decoding="async"
            className="w-[46%] h-auto select-none"
          />
        </div>
      </div>

      {/* LAYER 03 — HERO KICKFLIP IMAGE SEQUENCE CANVAS (Zero React re-renders during scroll) */}
      <div
        data-kf-hero-stage
        className="absolute inset-x-0 top-[8%] sm:top-[6%] bottom-[28%] z-20 flex items-center justify-center pointer-events-none will-change-transform"
      >
        <KickflipSequenceCanvas
          ref={kickflipCanvasRef}
          initialFrame={reducedMotion ? manualFrame : 0}
          className="w-[88%] sm:w-[70%] md:w-[56%] max-w-[680px] h-full drop-shadow-[0_14px_0_rgba(14,14,14,0.22)]"
        />
      </div>

      {/* LAYER 03B — PROTAGONIST ROLLOUT JOINING CREW (70–100% pullback) */}
      <div
        data-kf-rollout
        className="absolute left-[40%] sm:left-[43%] bottom-[12%] z-20 w-[26%] sm:w-[20%] md:w-[15%] max-w-[210px] pointer-events-none will-change-transform origin-bottom"
        style={{ opacity: reducedMotion ? 0 : 0 }}
      >
        <img
          src={ABOUT_ASSETS.protagonistRear}
          alt="Khoa rolling away down the concrete pier with the crew"
          loading="lazy"
          decoding="async"
          className="w-full h-auto drop-shadow-[0_8px_0_rgba(14,14,14,0.2)] select-none"
        />
      </div>

      {/* LAYER 04 — FOREGROUND CONCRETE STAIR LIP (Drops out during under-board slow-mo) */}
      <div
        data-kf-fg-ledge
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-14 md:h-20 z-20 pointer-events-none will-change-transform"
      >
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="0,35 1440,8 1440,90 0,90" fill="#0E0E0E" />
          <line x1="0" y1="35" x2="1440" y2="8" stroke="#9E3E24" strokeWidth="4" />
        </svg>
      </div>

      {/* LAYER 05 — UNDER-BOARD INTEGRATED BRAND TYPOGRAPHY (35–60%, NO FLOATING CARD) */}
      <div
        data-kf-purpose-copy
        className="absolute inset-x-0 bottom-[6%] sm:bottom-[8%] z-30 px-4 md:px-10 pointer-events-none"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E3E24]">
            {BRAND_INFO.name} — {BRAND_INFO.established} // {BRAND_INFO.locations}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[-0.03em] text-[#0E0E0E] leading-[0.96] mt-2">
            {ABOUT_STORY.headline}
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-[#111111] max-w-[46ch] mx-auto mt-2.5 font-medium">
            {ABOUT_STORY.paragraphs[1]}
          </p>
        </div>
      </div>

      {/* LAYER 06 — EARNED WIDE PULLBACK & OFFICIAL LAGIISM WORDMARK REVEAL (75–100%) */}
      <div
        data-kf-identity-reveal
        className="absolute inset-0 z-30 max-w-[1440px] mx-auto px-4 md:px-10 pt-20 md:pt-24 pb-8 flex flex-col justify-between"
        style={{
          opacity: reducedMotion ? 1 : 0,
          visibility: reducedMotion ? 'visible' : 'hidden',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E3E24]">
            SCENE 04 // THE IDENTITY
          </p>

          {/* Existing Official Brand Wordmark (BRAND_INFO.name verbatim — no invented logo) */}
          <h2 className="text-5xl sm:text-7xl md:text-[96px] font-black uppercase tracking-[-0.04em] leading-[0.88] text-[#0E0E0E] mt-2">
            {BRAND_INFO.name}
          </h2>

          <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.14em] text-[#111111] mt-3">
            {BRAND_INFO.established} // {BRAND_INFO.locations}
          </p>

          <p className="text-xs sm:text-sm text-[#111111]/85 max-w-[50ch] mx-auto mt-3 leading-relaxed">
            {ABOUT_STORY.paragraphs[2]}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <m.button
              type="button"
              whileHover={reducedMotion ? undefined : { y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              onClick={onExploreShop}
              className="min-h-[44px] inline-flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border-2 border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] cursor-pointer"
            >
              SHOP DROP 01 ARCHIVE
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </m.button>

            <m.button
              type="button"
              whileHover={reducedMotion ? undefined : { y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              onClick={onOpenCrewSheet}
              className="min-h-[44px] inline-flex items-center gap-2 bg-[#F4F3EF]/92 text-[#111111] border-2 border-[#111111] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#1D2B44] hover:text-[#F4F3EF] cursor-pointer"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              CREW ARCHIVE (05)
            </m.button>
          </div>
        </div>

        {/* Bottom Origin Spec Strip */}
        <div className="w-full max-w-4xl mx-auto bg-[#F4F3EF]/94 border border-[#111111] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#D4D2CA] font-mono text-[10px] uppercase">
          <div className="px-3.5 py-2.5">
            <span className="block text-[#6E6D68]">COASTAL BASE</span>
            <span className="font-bold text-[#111111]">LA GI, BÌNH THUẬN</span>
          </div>
          <div className="px-3.5 py-2.5">
            <span className="block text-[#6E6D68]">URBAN STUDIO</span>
            <span className="font-bold text-[#111111]">TP.HCM (QUẬN 1)</span>
          </div>
          <div className="px-3.5 py-2.5">
            <span className="block text-[#6E6D68]">COORDINATES</span>
            <span className="font-bold text-[#1D2B44]">{BRAND_INFO.coordinates}</span>
          </div>
          <div className="px-3.5 py-2.5">
            <span className="block text-[#6E6D68]">ATELIER CONTACT</span>
            <span className="font-bold text-[#111111]">STUDIO@LAGIISM.VN</span>
          </div>
        </div>
      </div>

      {/* TOP-LEFT MINIMAL SEQUENCE TELEMETRY (Zero re-renders: updated via ref) */}
      <div className="absolute top-20 left-4 md:left-10 z-30 pointer-events-none">
        <div className="bg-[#0E0E0E]/90 text-[#F4F3EF] border border-[#111111] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em]">
          <span ref={phaseLabelRef}>
            {KICKFLIP_SEQUENCE[reducedMotion ? manualFrame : 0].phase}
          </span>
        </div>
      </div>

      {/* REDUCED-MOTION INTERACTIVE 6-FRAME FILMSTRIP CONTROLS (>=44px touch targets) */}
      {reducedMotion && (
        <div className="absolute top-20 right-4 md:right-10 z-40 bg-[#F4F3EF] border border-[#111111] p-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6E6D68] mb-1.5 px-1">
            STEP KICKFLIP FRAMES
          </div>
          <div className="grid grid-cols-6 gap-1">
            {KICKFLIP_SEQUENCE.map((frame) => (
              <button
                key={frame.index}
                type="button"
                onClick={() => onSelectManualFrame(frame.index)}
                className={`min-w-[40px] min-h-[40px] font-mono text-[11px] font-bold border cursor-pointer ${
                  manualFrame === frame.index
                    ? 'bg-[#9E3E24] text-[#F4F3EF] border-[#111111]'
                    : 'bg-[#EAE8E1] text-[#111111] border-[#D4D2CA] hover:border-[#111111]'
                }`}
              >
                0{frame.index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
