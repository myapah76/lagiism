import React from 'react';
import { ArrowDown } from 'lucide-react';
import { ABOUT_STORY } from '../../../data/catalog';
import { ABOUT_ASSETS, SCENE_CHAPTERS } from '../data/aboutEditorialData';

interface SceneGatheringProps {
  reducedMotion: boolean;
}

export const SceneGathering: React.FC<SceneGatheringProps> = ({ reducedMotion }) => {
  const chapter = SCENE_CHAPTERS[0];

  return (
    <section
      id={chapter.id}
      data-scene="gathering"
      className="relative w-full h-[100svh] min-h-[640px] max-h-[1080px] overflow-hidden bg-[#F4F3EF] border-b-2 border-[#111111]"
    >
      {/* LAYER 01 — BACKGROUND: Photo-derived illustrated La Gi coastal skatepark */}
      <div
        data-gathering-bg
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
          className="absolute inset-0 bg-gradient-to-b from-[#F4F3EF]/65 via-transparent to-[#0E0E0E]/30"
        />
      </div>

      {/* LAYER 02 — MIDGROUND STAGGERED 2.5D CREW (Distinct depth heights on concrete ledges) */}
      <div
        data-gathering-crew
        className="absolute inset-x-0 bottom-[16%] sm:bottom-[18%] md:bottom-[20%] z-10 pointer-events-none flex items-end justify-center px-4 md:px-12"
      >
        <div className="relative w-full max-w-[1120px] flex items-end justify-between gap-2 md:gap-6">
          <div
            data-crew-member="linh"
            className="w-[21%] sm:w-[19%] max-w-[205px] mb-2 md:mb-5 will-change-transform origin-bottom"
          >
            <img
              src={ABOUT_ASSETS.skaterLinh}
              alt="Linh resting with skateboard across lap"
              className="w-full h-auto drop-shadow-[0_6px_0_rgba(14,14,14,0.18)] select-none"
            />
          </div>

          <div
            data-crew-member="minh"
            className="w-[19%] sm:w-[17%] max-w-[185px] mb-5 md:mb-10 will-change-transform origin-bottom"
          >
            <img
              src={ABOUT_ASSETS.skaterMinh}
              alt="Minh resting on concrete ledge"
              className="w-full h-auto drop-shadow-[0_6px_0_rgba(14,14,14,0.16)] select-none"
            />
          </div>

          <div
            data-crew-member="tuan"
            className="w-[21%] sm:w-[19%] max-w-[205px] mb-1 md:mb-3 will-change-transform origin-bottom"
          >
            <img
              src={ABOUT_ASSETS.skaterTuan}
              alt="Tuấn standing with foot on skateboard tail"
              className="w-full h-auto drop-shadow-[0_6px_0_rgba(14,14,14,0.18)] select-none"
            />
          </div>

          <div
            data-crew-member="ha"
            className="w-[22%] sm:w-[20%] max-w-[210px] will-change-transform origin-bottom"
          >
            <img
              src={ABOUT_ASSETS.skaterHa}
              alt="Hà waving in greeting"
              className="w-full h-auto drop-shadow-[0_6px_0_rgba(14,14,14,0.2)] select-none"
            />
          </div>
        </div>
      </div>

      {/* LAYER 02B — TACTILE CLOSE-UP PLATES (Skate shoes, urethane wheels & cuffed denim — opening beat) */}
      <div
        data-gathering-details
        aria-hidden="true"
        className="hidden md:flex absolute right-8 lg:right-16 top-28 z-20 flex-col gap-3 pointer-events-none will-change-transform"
      >
        <div className="w-36 lg:w-44 border border-[#111111] bg-[#F4F3EF] p-1.5">
          <img
            src={ABOUT_ASSETS.detailShoesBoard}
            alt=""
            className="w-full aspect-[4/3] object-cover"
          />
          <span className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[#6E6D68] mt-1">
            DETAIL 01 // GRIP &amp; CUFF
          </span>
        </div>
        <div className="w-36 lg:w-44 border border-[#111111] bg-[#EAE8E1] p-1.5">
          <img
            src={ABOUT_ASSETS.detailWheelsStance}
            alt=""
            className="w-full aspect-[4/3] object-cover"
          />
          <span className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[#6E6D68] mt-1">
            DETAIL 02 // URETHANE &amp; SLAB
          </span>
        </div>
      </div>

      {/* LAYER 03 — FOREGROUND CHARACTER: Protagonist Khoa entering from bottom */}
      <div
        data-gathering-protagonist
        className="absolute left-[4%] sm:left-[10%] md:left-[15%] bottom-[-4%] z-20 w-[44%] sm:w-[34%] md:w-[27%] max-w-[360px] pointer-events-none will-change-transform origin-bottom"
      >
        <img
          src={ABOUT_ASSETS.protagonistPush}
          alt="Khoa pushing skateboard into the La Gi concrete skatepark"
          className="w-full h-auto drop-shadow-[0_10px_0_rgba(14,14,14,0.28)] select-none"
        />
      </div>

      {/* LAYER 04 — FOREGROUND 2.5D PARALLAX CONCRETE EDGE */}
      <div
        data-gathering-fg-ledge
        aria-hidden="true"
        className="absolute bottom-0 right-0 z-20 w-[55%] md:w-[38%] h-14 md:h-20 pointer-events-none will-change-transform"
      >
        <svg viewBox="0 0 600 90" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="40,18 600,0 600,90 0,90" fill="#0E0E0E" stroke="#111111" strokeWidth="3" />
          <line x1="40" y1="18" x2="600" y2="0" stroke="#9E3E24" strokeWidth="4" />
        </svg>
      </div>

      {/* EDITORIAL MASTHEAD (Approved copy from ABOUT_STORY) */}
      <div
        data-gathering-copy
        className="relative z-30 max-w-[1440px] mx-auto h-full px-4 md:px-10 pt-24 md:pt-28 pb-8 flex flex-col justify-between pointer-events-none"
      >
        <div className="max-w-xl bg-[#F4F3EF]/92 border border-[#111111] p-4 md:p-6 pointer-events-auto">
          <div className="flex items-center justify-between gap-4 border-b border-[#D4D2CA] pb-2">
            <span className="font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em] text-[#9E3E24]">
              SCENE {chapter.index} // {chapter.title}
            </span>
            <span className="font-mono text-[10px] uppercase text-[#6E6D68]">
              {chapter.coordinates}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[-0.03em] text-[#111111] leading-[0.98] mt-3">
            {ABOUT_STORY.headline}
          </h1>

          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.06em] text-[#6E6D68] mt-3">
            {ABOUT_STORY.subhead}
          </p>
        </div>

        <div className="self-end flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em]">
          <span>{reducedMotion ? 'SCROLL TO READ STORY' : 'SCROLL TO ROLL IN'}</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#9E3E24]" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};
