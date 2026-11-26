import React from 'react';
import { m } from 'motion/react';
import { ArrowDown, ArrowUpRight, Users } from 'lucide-react';
import { ABOUT_STORY, BRAND_INFO } from '../../../data/catalog';
import { ABOUT_ASSETS, KICKFLIP_SEQUENCE } from '../data/aboutEditorialData';
import { KickflipCanvasHandle, KickflipSequenceCanvas } from './KickflipSequenceCanvas';

interface MasterCinematicStageProps {
  kickflipCanvasRef: React.RefObject<KickflipCanvasHandle | null>;
  telemetryRef: React.RefObject<HTMLSpanElement | null>;
  onExploreShop: () => void;
  onOpenCrewSheet: () => void;
}

/**
 * ONE SINGLE CONTINUOUS CINEMATIC STAGE (100svh pinned once by the master GSAP timeline).
 * Eliminates disconnected webpage sections and pin resets. Every transition (A, B, C, D)
 * is driven by continuous camera motion, spatial panning, foreground wipe landmarks,
 * and a 12-frame extreme low-angle under-board kickflip image sequence.
 */
export const MasterCinematicStage: React.FC<MasterCinematicStageProps> = ({
  kickflipCanvasRef,
  telemetryRef,
  onExploreShop,
  onOpenCrewSheet,
}) => {
  return (
    <section
      data-master-stage
      aria-label="LAGIISM continuous skateboarding story"
      className="relative w-full h-[100svh] min-h-[660px] overflow-hidden bg-[#F4F3EF]"
    >
      {/* ===================================================================== */}
      {/* ACT I WORLD — LA GI COASTAL SKATEPARK (0% – 24%)                       */}
      {/* ===================================================================== */}
      <div
        data-act-gathering
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: '50% 55%' }}
      >
        <img
          src={ABOUT_ASSETS.scene01Bg}
          alt="Illustrated La Gi coastal concrete skatepark with tetrapod seawall"
          className="w-full h-full object-cover object-center select-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#F4F3EF]/55 via-transparent to-[#0E0E0E]/25"
        />

        {/* Staggered 2.5D Resting Crew */}
        <div className="absolute inset-x-0 bottom-[16%] sm:bottom-[19%] z-10 pointer-events-none flex items-end justify-center px-4 md:px-12">
          <div className="w-full max-w-[1120px] flex items-end justify-between gap-2 md:gap-6">
            <div data-g-crew="linh" className="w-[21%] sm:w-[19%] max-w-[200px] mb-3 will-change-transform origin-bottom">
              <img src={ABOUT_ASSETS.skaterLinh} alt="Linh resting with skateboard" className="w-full h-auto drop-shadow-[0_6px_0_rgba(14,14,14,0.18)] select-none" />
            </div>
            <div data-g-crew="minh" className="w-[19%] sm:w-[17%] max-w-[185px] mb-7 will-change-transform origin-bottom">
              <img src={ABOUT_ASSETS.skaterMinh} alt="Minh resting on concrete slab" className="w-full h-auto drop-shadow-[0_6px_0_rgba(14,14,14,0.16)] select-none" />
            </div>
            <div data-g-crew="tuan" className="w-[21%] sm:w-[19%] max-w-[200px] mb-2 will-change-transform origin-bottom">
              <img src={ABOUT_ASSETS.skaterTuan} alt="Tuấn standing with skateboard" className="w-full h-auto drop-shadow-[0_6px_0_rgba(14,14,14,0.18)] select-none" />
            </div>
            <div data-g-crew="ha" className="w-[22%] sm:w-[20%] max-w-[205px] will-change-transform origin-bottom">
              <img src={ABOUT_ASSETS.skaterHa} alt="Hà greeting the crew" className="w-full h-auto drop-shadow-[0_6px_0_rgba(14,14,14,0.2)] select-none" />
            </div>
          </div>
        </div>

        {/* Tactile close-up detail plates (opening beat) */}
        <div
          data-g-details
          aria-hidden="true"
          className="hidden md:flex absolute right-8 lg:right-16 top-24 z-20 flex-col gap-3 pointer-events-none will-change-transform"
        >
          <div className="w-36 lg:w-44 border border-[#111111] bg-[#F4F3EF] p-1.5">
            <img src={ABOUT_ASSETS.detailShoesBoard} alt="" className="w-full aspect-[4/3] object-cover" />
            <span className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[#6E6D68] mt-1">
              DETAIL 01 // GRIP &amp; CUFF
            </span>
          </div>
          <div className="w-36 lg:w-44 border border-[#111111] bg-[#EAE8E1] p-1.5">
            <img src={ABOUT_ASSETS.detailWheelsStance} alt="" className="w-full aspect-[4/3] object-cover" />
            <span className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[#6E6D68] mt-1">
              DETAIL 02 // URETHANE &amp; SLAB
            </span>
          </div>
        </div>

        {/* Protagonist Khoa entering from bottom */}
        <div
          data-g-protagonist
          className="absolute left-[5%] sm:left-[11%] md:left-[15%] bottom-[-4%] z-20 w-[42%] sm:w-[32%] md:w-[25%] max-w-[340px] pointer-events-none will-change-transform origin-bottom"
        >
          <img
            src={ABOUT_ASSETS.protagonistPush}
            alt="Khoa pushing skateboard into the La Gi concrete skatepark"
            className="w-full h-auto drop-shadow-[0_10px_0_rgba(14,14,14,0.26)] select-none"
          />
        </div>

        {/* Opening Editorial Masthead */}
        <div
          data-g-copy
          className="absolute top-20 md:top-24 left-4 md:left-10 z-30 max-w-lg bg-[#F4F3EF]/92 border border-[#111111] p-4 md:p-6 pointer-events-none"
        >
          <div className="flex items-center justify-between gap-4 border-b border-[#D4D2CA] pb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E3E24]">
              01 // THE GATHERING
            </span>
            <span className="font-mono text-[10px] uppercase text-[#6E6D68]">
              {BRAND_INFO.coordinates}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[-0.03em] text-[#111111] leading-[0.98] mt-3">
            {ABOUT_STORY.headline}
          </h1>
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.06em] text-[#6E6D68] mt-2.5">
            {ABOUT_STORY.subhead}
          </p>
        </div>

        <div
          data-g-scrollcue
          className="absolute bottom-6 right-4 md:right-10 z-30 flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] pointer-events-none"
        >
          <span>SCROLL TO ROLL IN</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#9E3E24]" aria-hidden="true" />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ACT II WORLD — SAIGON STREET TRACKING (18% – 48%)                      */}
      {/* ===================================================================== */}
      <div
        data-act-movement
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: '50% 60%' }}
      >
        <div data-m-bg className="absolute inset-y-0 left-0 w-[134%] will-change-transform">
          <img
            src={ABOUT_ASSETS.scene02Bg}
            alt="Illustrated Saigon breeze-block urban streetscape"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center select-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E]/30 via-transparent to-[#0E0E0E]/20"
          />
        </div>

        {/* 3 Independent Crew Depth Layers */}
        <div
          data-m-crew-bg
          className="absolute left-[4%] bottom-[17%] z-10 w-[44%] sm:w-[37%] max-w-[460px] pointer-events-none will-change-transform"
        >
          <img src={ABOUT_ASSETS.cruiseBgPair} alt="Hà and Tuấn skating in background depth layer" loading="lazy" decoding="async" className="w-full h-auto opacity-95 select-none" />
        </div>
        <div
          data-m-crew-mid
          className="absolute left-[34%] bottom-[14%] z-20 w-[40%] sm:w-[33%] max-w-[420px] pointer-events-none will-change-transform"
        >
          <img src={ABOUT_ASSETS.cruiseMidPair} alt="Minh and Linh skating through midground" loading="lazy" decoding="async" className="w-full h-auto select-none" />
        </div>
        <div
          data-m-crew-fg
          className="absolute right-[5%] bottom-[10%] z-20 w-[33%] sm:w-[27%] max-w-[330px] pointer-events-none will-change-transform"
        >
          <img src={ABOUT_ASSETS.cruiseFgLead} alt="Khoa pulling ahead toward the concrete stair set" loading="lazy" decoding="async" className="w-full h-auto select-none" />
        </div>

        {/* Fast Foreground Curb & Rust Street Rail */}
        <div
          data-m-fg
          aria-hidden="true"
          className="absolute bottom-0 left-[-10%] w-[150%] h-12 md:h-16 z-30 pointer-events-none will-change-transform"
        >
          <svg viewBox="0 0 1800 80" preserveAspectRatio="none" className="w-full h-full">
            <rect x="0" y="54" width="1800" height="26" fill="#0E0E0E" />
            <rect x="180" y="20" width="380" height="7" fill="#9E3E24" stroke="#111111" strokeWidth="2" />
            <rect x="205" y="27" width="8" height="30" fill="#111111" />
            <rect x="525" y="27" width="8" height="30" fill="#111111" />
            <rect x="1020" y="24" width="440" height="7" fill="#6E6D68" stroke="#111111" strokeWidth="2" />
            <rect x="1050" y="31" width="8" height="26" fill="#111111" />
            <rect x="1430" y="31" width="8" height="26" fill="#111111" />
          </svg>
        </div>

        {/* Brand Overview Typography (Integrated without heavy clutter) */}
        <div
          data-m-copy
          className="absolute top-20 md:top-24 left-4 md:left-10 z-30 max-w-md bg-[#F4F3EF]/90 border-l-4 border-[#9E3E24] px-5 py-4 pointer-events-none"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1D2B44]">
            02 // THE MOVEMENT — {BRAND_INFO.established}
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-[#111111] mt-2 font-medium">
            {ABOUT_STORY.paragraphs[0]}
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ACT III & IV WORLD — UNDER-BOARD KICKFLIP -> CREW -> WIDE PULLBACK     */}
      {/* ===================================================================== */}
      <div
        data-act-kickflip
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: '50% 68%' }}
      >
        {/* Low-angle stair plaza environment */}
        <div
          data-k-bg-stairs
          className="absolute inset-0 will-change-transform"
          style={{ transformOrigin: '50% 70%' }}
        >
          <img
            src={ABOUT_ASSETS.scene03Bg}
            alt="Extreme low-angle concrete stair set looking upward toward overcast sky"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center select-none"
          />
          {/* Subtle light wash in lower negative space so under-board typography stays razor legible */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#F4F3EF]/92 via-[#F4F3EF]/18 to-transparent"
          />
        </div>

        {/* Wide Pulled-Back Breakwater & Urban Horizon Environment (Transition D) */}
        <div
          data-k-bg-wide
          className="absolute inset-0 will-change-transform"
          style={{ transformOrigin: '50% 62%' }}
        >
          <img
            src={ABOUT_ASSETS.scene04Bg}
            alt="Wide pulled-back illustrated La Gi concrete breakwater framing the open sky"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center select-none"
          />
        </div>

        {/* Community Crew Visible Behind Trick & Following Down Stairs */}
        <div
          data-k-crew-bg
          className="absolute inset-x-0 bottom-[26%] sm:bottom-[28%] z-10 pointer-events-none flex items-end justify-center will-change-transform"
        >
          <div className="w-[70%] sm:w-[54%] md:w-[44%] max-w-[620px] flex items-end justify-between gap-2 opacity-90">
            <img src={ABOUT_ASSETS.cruiseBgPair} alt="Crew watching and rolling down stairs behind Khoa" loading="lazy" decoding="async" className="w-[48%] h-auto select-none" />
            <img src={ABOUT_ASSETS.cruiseMidPair} alt="Crew continuing down the concrete plaza" loading="lazy" decoding="async" className="w-[46%] h-auto select-none" />
          </div>
        </div>

        {/* HERO 12-FRAME UNDER-BOARD KICKFLIP CANVAS (Overhead directly above camera!) */}
        <div
          data-k-hero-canvas
          className="absolute inset-x-0 top-[2%] bottom-[16%] z-20 flex items-center justify-center pointer-events-none will-change-transform"
        >
          <KickflipSequenceCanvas
            ref={kickflipCanvasRef}
            initialFrame={0}
            className="w-[94%] sm:w-[78%] md:w-[64%] max-w-[780px] h-full drop-shadow-[0_18px_0_rgba(14,14,14,0.18)]"
          />
        </div>

        {/* Protagonist Rollout Bridging Landing -> Crew Pullback */}
        <div
          data-k-rollout
          className="absolute left-[40%] sm:left-[43%] bottom-[11%] z-20 w-[26%] sm:w-[20%] md:w-[15%] max-w-[210px] pointer-events-none will-change-transform origin-bottom"
        >
          <img
            src={ABOUT_ASSETS.protagonistRear}
            alt="Khoa rolling away with the crew into the wide coastal skatepark"
            loading="lazy"
            decoding="async"
            className="w-full h-auto drop-shadow-[0_8px_0_rgba(14,14,14,0.2)] select-none"
          />
        </div>

        {/* INTEGRATED NEGATIVE-SPACE TYPOGRAPHY BENEATH THE OVERHEAD BOARD (NO FLOATING CARD) */}
        <div
          data-k-underboard-copy
          className="absolute inset-x-0 bottom-[6%] sm:bottom-[8%] z-30 px-4 md:px-10 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#9E3E24]">
              {BRAND_INFO.name} — {BRAND_INFO.established} // {BRAND_INFO.locations}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[-0.03em] text-[#0E0E0E] leading-[0.96] mt-2">
              {ABOUT_STORY.headline}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-[#111111] max-w-[44ch] mx-auto mt-2.5 font-medium">
              {ABOUT_STORY.paragraphs[1]}
            </p>
          </div>
        </div>

        {/* EARNED WIDE PULLBACK & EXISTING OFFICIAL LAGIISM WORDMARK */}
        <div
          data-k-identity
          className="absolute inset-0 z-30 max-w-[1440px] mx-auto px-4 md:px-10 pt-20 md:pt-24 pb-8 flex flex-col justify-between"
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E3E24]">
              04 // THE IDENTITY
            </p>

            {/* Existing Official LAGIISM Wordmark (BRAND_INFO.name verbatim) */}
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
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExploreShop}
                className="min-h-[44px] inline-flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border-2 border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] cursor-pointer"
              >
                SHOP DROP 01 ARCHIVE
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </m.button>

              <m.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenCrewSheet}
                className="min-h-[44px] inline-flex items-center gap-2 bg-[#F4F3EF]/92 text-[#111111] border-2 border-[#111111] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#1D2B44] hover:text-[#F4F3EF] cursor-pointer"
              >
                <Users className="w-4 h-4" aria-hidden="true" />
                CREW ARCHIVE (05)
              </m.button>
            </div>
          </div>

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
      </div>

      {/* ===================================================================== */}
      {/* FOREGROUND WIPE LANDMARKS (Physical Continuity Across Transitions)     */}
      {/* ===================================================================== */}
      {/* Transition A: Concrete Seawall Pillar Wipe (Gathering -> Movement) */}
      <div
        data-wipe-pillar
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[26vw] max-w-[340px] z-30 pointer-events-none will-change-transform"
      >
        <div className="w-full h-full bg-[#0E0E0E] border-x-4 border-[#9E3E24]/80" />
      </div>

      {/* Transition B: Concrete Stair Lip Plunge Wipe (Movement -> Under-Board) */}
      <div
        data-wipe-stairlip
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[28vh] z-30 pointer-events-none will-change-transform"
      >
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="0,70 1440,12 1440,220 0,220" fill="#0E0E0E" />
          <line x1="0" y1="70" x2="1440" y2="12" stroke="#9E3E24" strokeWidth="6" />
        </svg>
      </div>

      {/* Minimal Live Film Telemetry Badge (updated via ref — 0 React re-renders) */}
      <div className="absolute bottom-6 left-4 md:left-10 z-40 pointer-events-none">
        <div className="bg-[#0E0E0E]/90 text-[#F4F3EF] border border-[#111111] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em]">
          <span ref={telemetryRef}>{KICKFLIP_SEQUENCE[0].phase}</span>
        </div>
      </div>
    </section>
  );
};
