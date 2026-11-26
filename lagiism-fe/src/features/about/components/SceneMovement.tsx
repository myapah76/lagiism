import React from 'react';
import { ABOUT_STORY, BRAND_INFO } from '../../../data/catalog';
import { ABOUT_ASSETS, SCENE_CHAPTERS } from '../data/aboutEditorialData';

interface SceneMovementProps {
  reducedMotion: boolean;
}

export const SceneMovement: React.FC<SceneMovementProps> = ({ reducedMotion }) => {
  const chapter = SCENE_CHAPTERS[1];

  return (
    <section
      id={chapter.id}
      data-scene="movement"
      className="relative w-full h-[100svh] min-h-[660px] max-h-[1080px] overflow-hidden bg-[#EAE8E1] border-b-2 border-[#111111]"
    >
      {/* LAYER 01 — BACKGROUND PANORAMA: Real-photo illustrated Saigon street tracking horizontally */}
      <div
        data-movement-bg
        className={`absolute inset-y-0 left-0 will-change-transform ${
          reducedMotion ? 'w-full' : 'w-[132%]'
        }`}
      >
        <img
          src={ABOUT_ASSETS.scene02Bg}
          alt="Illustrated Saigon breeze-block apartment streetscape for horizontal tracking"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center select-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E]/35 via-transparent to-[#0E0E0E]/20"
        />
      </div>

      {/* LAYER 02 — CHARACTER DEPTH PLANE A (BACKGROUND PAIR: Hà & Tuấn, slower 0.65x) */}
      <div
        data-movement-crew-bg
        className="absolute left-[4%] sm:left-[6%] bottom-[16%] sm:bottom-[18%] z-10 w-[44%] sm:w-[38%] max-w-[470px] pointer-events-none will-change-transform"
      >
        <img
          src={ABOUT_ASSETS.cruiseBgPair}
          alt="Hà and Tuấn cruising in the background lane"
          loading="lazy"
          decoding="async"
          className="w-full h-auto opacity-95 drop-shadow-[0_8px_0_rgba(14,14,14,0.2)] select-none"
        />
      </div>

      {/* LAYER 03 — CHARACTER DEPTH PLANE B (MIDGROUND PAIR: Minh & Linh, 1.0x) */}
      <div
        data-movement-crew-mid
        className="absolute left-[34%] sm:left-[36%] bottom-[13%] sm:bottom-[15%] z-20 w-[40%] sm:w-[34%] max-w-[430px] pointer-events-none will-change-transform"
      >
        <img
          src={ABOUT_ASSETS.cruiseMidPair}
          alt="Minh and Linh pushing through the midground"
          loading="lazy"
          decoding="async"
          className="w-full h-auto drop-shadow-[0_10px_0_rgba(14,14,14,0.24)] select-none"
        />
      </div>

      {/* LAYER 04 — CHARACTER DEPTH PLANE C (FOREGROUND LEAD: Khoa, faster 1.35x) */}
      <div
        data-movement-crew-fg
        className="absolute right-[4%] sm:right-[8%] bottom-[9%] sm:bottom-[11%] z-20 w-[34%] sm:w-[27%] max-w-[340px] pointer-events-none will-change-transform"
      >
        <img
          src={ABOUT_ASSETS.cruiseFgLead}
          alt="Khoa carving ahead in the foreground lane"
          loading="lazy"
          decoding="async"
          className="w-full h-auto drop-shadow-[0_12px_0_rgba(14,14,14,0.28)] select-none"
        />
      </div>

      {/* LAYER 05 — FOREGROUND PARALLAX: Fast-moving asphalt curb & oxidized rust street rail */}
      <div
        data-movement-fg
        aria-hidden="true"
        className="absolute bottom-0 left-[-10%] w-[150%] h-12 md:h-16 z-30 pointer-events-none will-change-transform"
      >
        <svg viewBox="0 0 1800 80" preserveAspectRatio="none" className="w-full h-full">
          <rect x="0" y="54" width="1800" height="26" fill="#0E0E0E" />
          <rect x="140" y="20" width="380" height="7" fill="#9E3E24" stroke="#111111" strokeWidth="2" />
          <rect x="165" y="27" width="8" height="30" fill="#111111" />
          <rect x="485" y="27" width="8" height="30" fill="#111111" />
          <rect x="980" y="24" width="440" height="7" fill="#6E6D68" stroke="#111111" strokeWidth="2" />
          <rect x="1010" y="31" width="8" height="26" fill="#111111" />
          <rect x="1390" y="31" width="8" height="26" fill="#111111" />
        </svg>
      </div>

      {/* EDITORIAL BRAND OVERVIEW PANEL (Approved copy) */}
      <div
        data-movement-copy
        className="relative z-30 max-w-[1440px] mx-auto h-full px-4 md:px-10 pt-20 md:pt-24 pb-20 flex flex-col justify-between pointer-events-none"
      >
        <div className="max-w-lg bg-[#F4F3EF]/94 border border-[#111111] p-4 md:p-6 pointer-events-auto">
          <div className="flex items-center justify-between gap-3 border-b border-[#D4D2CA] pb-2">
            <span className="font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em] text-[#1D2B44]">
              SCENE {chapter.index} // {chapter.title}
            </span>
            <span className="font-mono text-[10px] uppercase text-[#6E6D68]">
              {BRAND_INFO.established}
            </span>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-[#111111] mt-3 font-medium">
            {ABOUT_STORY.paragraphs[0]}
          </p>

          <div className="mt-4 pt-3 border-t border-[#D4D2CA] grid grid-cols-3 gap-2 font-mono text-[9px] sm:text-[10px] uppercase">
            <div>
              <span className="block text-[#6E6D68]">JERSEY</span>
              <span className="font-bold text-[#111111]">280–330 GSM</span>
            </div>
            <div>
              <span className="block text-[#6E6D68]">DENIM</span>
              <span className="font-bold text-[#1D2B44]">14 OZ RAW</span>
            </div>
            <div>
              <span className="block text-[#6E6D68]">FLEECE</span>
              <span className="font-bold text-[#9E3E24]">500 GSM TERRY</span>
            </div>
          </div>
        </div>

        <div className="self-start bg-[#0E0E0E]/90 text-[#F4F3EF] border border-[#111111] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em]">
          2.5D TRACKING CAM // {chapter.location}
        </div>
      </div>
    </section>
  );
};
