import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, Users } from 'lucide-react';
import { ActiveView } from '../../types/store';
import { ABOUT_MEDIA, ABOUT_STORY_COPY, KICKFLIP_FRAMES } from './data/aboutStory';
import { KickflipCanvas, KickflipCanvasHandle } from './components/KickflipCanvas';
import { AboutCrewModal } from './components/AboutCrewModal';
import { AboutReducedMotionView } from './components/AboutReducedMotionView';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface AboutPageProps {
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const kickflipRef = useRef<KickflipCanvasHandle | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const [crewOpen, setCrewOpen] = useState(false);

  const handleShopDrop = useCallback(() => {
    onNavigate('HOME', 'drop-collection');
  }, [onNavigate]);

  const handleOpenArchive = useCallback(() => {
    onNavigate('SHOP_ALL');
  }, [onNavigate]);

  // Reset scroll to top on route entry and refresh ScrollTrigger after web fonts load
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 100);
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  // ONE single master GSAP timeline + ONE pinned ScrollTrigger for all 5 scenes
  useGSAP(
    () => {
      if (reducedMotion) return;
      const stageEl = stageRef.current;
      if (!stageEl) return;

      const isDesktop = window.innerWidth >= 1024;
      const frameTracker = { index: 0 };
      let lastFrame = -1;

      const syncFrame = () => {
        const idx = Math.max(0, Math.min(KICKFLIP_FRAMES.length - 1, Math.round(frameTracker.index)));
        if (idx !== lastFrame) {
          kickflipRef.current?.drawFrame(idx);
          lastFrame = idx;
        }
      };

      // Deterministic initial state for all 5 scenes
      gsap.set('[data-s1]', { xPercent: 0, scale: 1, autoAlpha: 1 });
      gsap.set('[data-s2]', { xPercent: 100, autoAlpha: 0 });
      gsap.set('[data-s345]', { autoAlpha: 0 });
      gsap.set('[data-bg-wide]', { autoAlpha: 0, scale: 1.28, yPercent: 4 });
      gsap.set('[data-kf-canvas]', { autoAlpha: 0, yPercent: 10, scale: 0.9 });
      gsap.set('[data-s3-copy]', { autoAlpha: 0, yPercent: 16 });
      gsap.set('[data-rollout]', { autoAlpha: 0, scale: 1.04, yPercent: 16 });
      gsap.set('[data-s4-copy]', { autoAlpha: 0, yPercent: 14 });
      gsap.set('[data-s5-reveal]', { autoAlpha: 0, yPercent: 10 });
      syncFrame();

      const master = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'lagiism-about-master',
          trigger: stageEl,
          start: 'top top',
          end: isDesktop ? '+=580%' : '+=360%',
          pin: true,
          pinSpacing: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // =====================================================================
      // SCENE 01 — THE GATHERING (0.00 – 0.20)
      // =====================================================================
      master
        .addLabel('scene01', 0)
        .to('[data-s1-bg]', { scale: 1.08, duration: 0.18 }, 'scene01')
        .fromTo('[data-s1-details]', { yPercent: 0, autoAlpha: 1 }, { yPercent: -20, autoAlpha: 0, duration: 0.08 }, 0.02)
        .fromTo(
          '[data-s1-protagonist]',
          { yPercent: 90, xPercent: -6, scale: 1.2, autoAlpha: 0.2 },
          { yPercent: 2, xPercent: 8, scale: 0.96, autoAlpha: 1, ease: 'power2.out', duration: 0.11 },
          0.01
        )
        .to('[data-s1-crew="linh"]', { yPercent: -8, rotation: -1.5, duration: 0.08 }, 0.08)
        .to('[data-s1-crew="minh"]', { yPercent: -10, rotation: 1.2, duration: 0.08 }, 0.09)
        .to('[data-s1-crew="tuan"]', { yPercent: -7, xPercent: -3, rotation: -1.8, duration: 0.08 }, 0.10)
        .to('[data-s1-crew="ha"]', { yPercent: -12, rotation: 2.2, scale: 1.04, duration: 0.08 }, 0.09)

        // Continuous sideways pan transition: Scene 01 -> Scene 02 (0.17 – 0.23)
        .to('[data-s1]', { xPercent: -100, autoAlpha: 0, duration: 0.06 }, 0.17)
        .to('[data-s2]', { xPercent: 0, autoAlpha: 1, duration: 0.06 }, 0.17)

        // ===================================================================
        // SCENE 02 — THE MOVEMENT (0.20 – 0.42)
        // ===================================================================
        .addLabel('scene02', 0.21)
        .fromTo('[data-s2-bg]', { xPercent: 0 }, { xPercent: -24, duration: 0.22 }, 0.20)
        .fromTo('[data-s2-crew-bg]', { xPercent: -10 }, { xPercent: 12, duration: 0.22 }, 0.20)
        .fromTo('[data-s2-crew-mid]', { xPercent: -14, yPercent: 1 }, { xPercent: 18, yPercent: -1, duration: 0.22 }, 0.20)
        .fromTo('[data-s2-crew-fg]', { xPercent: -18, yPercent: 2 }, { xPercent: 28, yPercent: -2, scale: 1.06, duration: 0.22 }, 0.20)
        .fromTo('[data-s2-fg]', { xPercent: 10 }, { xPercent: -42, duration: 0.22 }, 0.20)
        .fromTo('[data-s2-copy]', { autoAlpha: 0, yPercent: 10 }, { autoAlpha: 1, yPercent: 0, duration: 0.04 }, 0.22)
        .to('[data-s2-copy]', { autoAlpha: 0, yPercent: -8, duration: 0.04 }, 0.38)

        // Camera plunge transition: Scene 02 -> Scene 03 (0.40 – 0.46)
        .to('[data-s2]', { yPercent: -18, scale: 1.18, autoAlpha: 0, duration: 0.06 }, 0.40)
        .to('[data-s345]', { autoAlpha: 1, duration: 0.04 }, 0.40)
        .fromTo(
          '[data-bg-stairs]',
          { scale: 1.12, yPercent: 6, rotation: -1.6 },
          { scale: 1.56, yPercent: -16, rotation: 0, ease: 'power2.inOut', duration: 0.08 },
          0.40
        )
        .fromTo(
          '[data-bg-crew]',
          { xPercent: -12, scale: 0.85, autoAlpha: 0.85 },
          { xPercent: -2, scale: 0.92, autoAlpha: 0.95, duration: 0.08 },
          0.41
        )
        .to('[data-kf-canvas]', { autoAlpha: 1, yPercent: -6, scale: 1.06, duration: 0.05 }, 0.42)
        .to(frameTracker, { index: 2, duration: 0.05, onUpdate: syncFrame }, 0.42)

        // ===================================================================
        // SCENE 03 — THE KICKFLIP (0.47 – 0.66) — Slow-Motion Climax
        // ===================================================================
        .addLabel('scene03', 0.47)
        .to('[data-bg-stairs]', { scale: 1.62, yPercent: -18, duration: 0.19 }, 'scene03')
        .to('[data-kf-canvas]', { yPercent: -10, scale: 1.14, duration: 0.19 }, 'scene03')
        .to(frameTracker, { index: 8, duration: 0.19, onUpdate: syncFrame }, 'scene03')
        .to('[data-s3-copy]', { autoAlpha: 1, yPercent: 0, ease: 'power2.out', duration: 0.04 }, 0.49)
        .to('[data-s3-copy]', { autoAlpha: 0, yPercent: -8, ease: 'power1.in', duration: 0.04 }, 0.63)

        // ===================================================================
        // SCENE 04 — CREW & IDENTITY (0.66 – 0.84)
        // Landing -> normal speed -> crew joins -> gradual pullback
        // ===================================================================
        .addLabel('scene04', 0.66)
        .to(frameTracker, { index: 11, duration: 0.06, onUpdate: syncFrame }, 'scene04')
        .to('[data-kf-canvas]', { xPercent: 8, yPercent: 8, scale: 0.92, ease: 'power2.inOut', duration: 0.07 }, 'scene04')
        .to('[data-bg-stairs]', { scale: 1.24, yPercent: -4, xPercent: -5, ease: 'power1.inOut', duration: 0.09 }, 'scene04')
        .to('[data-bg-crew]', { xPercent: 10, yPercent: 6, scale: 0.98, duration: 0.09 }, 'scene04')
        .to('[data-kf-canvas]', { autoAlpha: 0, duration: 0.04 }, 0.71)
        .to('[data-rollout]', { autoAlpha: 1, duration: 0.04 }, 0.71)
        .to('[data-s4-copy]', { autoAlpha: 1, yPercent: 0, ease: 'power2.out', duration: 0.04 }, 0.72)
        .to('[data-s4-copy]', { autoAlpha: 0, yPercent: -8, ease: 'power1.in', duration: 0.04 }, 0.82)

        // ===================================================================
        // SCENE 05 — ARCHIVE REVEAL (0.84 – 1.00)
        // Wide environment pullback -> clean LAGIISM brand & archive reveal
        // ===================================================================
        .addLabel('scene05', 0.84)
        .to('[data-bg-stairs]', { autoAlpha: 0, scale: 1.05, duration: 0.08 }, 'scene05')
        .to('[data-bg-wide]', { autoAlpha: 1, scale: 1.0, yPercent: 0, ease: 'power1.out', duration: 0.14 }, 'scene05')
        .to('[data-bg-crew]', { xPercent: 20, yPercent: 2, scale: 0.54, autoAlpha: 0.72, ease: 'power1.inOut', duration: 0.14 }, 'scene05')
        .to('[data-rollout]', { scale: 0.36, yPercent: -16, autoAlpha: 0.85, ease: 'power1.inOut', duration: 0.14 }, 'scene05')
        .to('[data-s5-reveal]', { autoAlpha: 1, yPercent: 0, ease: 'power2.out', duration: 0.10 }, 0.88);
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true }
  );

  return (
    <div
      ref={rootRef}
      className="relative w-full bg-[#F4F3EF] text-[#111111] selection:bg-[#9E3E24] selection:text-[#F4F3EF]"
    >
      {reducedMotion ? (
        <AboutReducedMotionView
          onShopDrop={handleShopDrop}
          onOpenArchive={handleOpenArchive}
          onOpenCrew={() => setCrewOpen(true)}
        />
      ) : (
        <section
          ref={stageRef}
          aria-label="LAGIISM About Us cinematic story"
          className="relative w-full h-[100svh] min-h-[620px] overflow-hidden bg-[#F4F3EF]"
        >
          {/* =============================================================== */}
          {/* SCENE 01 — THE GATHERING                                        */}
          {/* =============================================================== */}
          <div data-s1 className="absolute inset-0 will-change-transform">
            <div data-s1-bg className="absolute inset-0 will-change-transform" style={{ transformOrigin: '50% 55%' }}>
              <img
                src={ABOUT_MEDIA.bgGathering}
                alt="Illustrated La Gi coastal concrete skatepark"
                className="w-full h-full object-cover object-center select-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-[#F4F3EF]/65 via-transparent to-[#0E0E0E]/25"
              />
            </div>

            {/* Staggered resting crew */}
            <div className="absolute inset-x-0 bottom-[16%] sm:bottom-[19%] z-10 pointer-events-none flex items-end justify-center px-4 md:px-12">
              <div className="w-full max-w-[1120px] flex items-end justify-between gap-2 md:gap-6">
                <div data-s1-crew="linh" className="w-[21%] sm:w-[19%] max-w-[200px] mb-3 will-change-transform origin-bottom">
                  <img src={ABOUT_MEDIA.skaterLinh} alt="Linh resting with skateboard" className="w-full h-auto select-none" />
                </div>
                <div data-s1-crew="minh" className="w-[19%] sm:w-[17%] max-w-[185px] mb-7 will-change-transform origin-bottom">
                  <img src={ABOUT_MEDIA.skaterMinh} alt="Minh resting on concrete slab" className="w-full h-auto select-none" />
                </div>
                <div data-s1-crew="tuan" className="w-[21%] sm:w-[19%] max-w-[200px] mb-2 will-change-transform origin-bottom">
                  <img src={ABOUT_MEDIA.skaterTuan} alt="Tuấn with skateboard" className="w-full h-auto select-none" />
                </div>
                <div data-s1-crew="ha" className="w-[22%] sm:w-[20%] max-w-[205px] will-change-transform origin-bottom">
                  <img src={ABOUT_MEDIA.skaterHa} alt="Hà greeting the crew" className="w-full h-auto select-none" />
                </div>
              </div>
            </div>

            {/* Close-up skateboard & shoe details */}
            <div
              data-s1-details
              aria-hidden="true"
              className="hidden md:flex absolute right-8 lg:right-14 top-24 z-20 flex-col gap-3 pointer-events-none will-change-transform"
            >
              <img src={ABOUT_MEDIA.detailShoesBoard} alt="" className="w-36 lg:w-44 aspect-[4/3] object-cover border border-[#111111] bg-[#F4F3EF] p-1" />
              <img src={ABOUT_MEDIA.detailWheelsStance} alt="" className="w-36 lg:w-44 aspect-[4/3] object-cover border border-[#111111] bg-[#EAE8E1] p-1" />
            </div>

            {/* Protagonist entering */}
            <div
              data-s1-protagonist
              className="absolute left-[5%] sm:left-[11%] md:left-[15%] bottom-[-4%] z-20 w-[42%] sm:w-[32%] md:w-[25%] max-w-[340px] pointer-events-none will-change-transform origin-bottom"
            >
              <img src={ABOUT_MEDIA.protagonistPush} alt="Protagonist preparing to skate" className="w-full h-auto select-none" />
            </div>

            {/* Scene 01 Typography */}
            <div className="absolute top-20 md:top-24 left-4 md:left-10 z-30 max-w-2xl pointer-events-none">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#9E3E24]">
                {ABOUT_STORY_COPY.scene01.label}
              </p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-[-0.04em] text-[#0E0E0E] leading-[0.92] mt-2">
                {ABOUT_STORY_COPY.scene01.headline}
              </h1>
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-[#111111]/80 mt-3">
                {ABOUT_STORY_COPY.scene01.subhead}
              </p>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SCENE 02 — THE MOVEMENT                                         */}
          {/* =============================================================== */}
          <div data-s2 className="absolute inset-0 will-change-transform" style={{ transformOrigin: '50% 60%' }}>
            <div data-s2-bg className="absolute inset-y-0 left-0 w-[134%] will-change-transform">
              <img
                src={ABOUT_MEDIA.bgMovement}
                alt="Illustrated urban concrete street environment"
                decoding="async"
                className="w-full h-full object-cover object-center select-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-[#F4F3EF]/80 via-transparent to-[#0E0E0E]/20"
              />
            </div>

            {/* 3 depth-layer cruising crew */}
            <div data-s2-crew-bg className="absolute left-[4%] bottom-[17%] z-10 w-[44%] sm:w-[37%] max-w-[460px] pointer-events-none will-change-transform">
              <img src={ABOUT_MEDIA.cruiseBgPair} alt="Crew skating in background depth layer" decoding="async" className="w-full h-auto opacity-95 select-none" />
            </div>
            <div data-s2-crew-mid className="absolute left-[34%] bottom-[14%] z-20 w-[40%] sm:w-[33%] max-w-[420px] pointer-events-none will-change-transform">
              <img src={ABOUT_MEDIA.cruiseMidPair} alt="Crew skating in midground layer" decoding="async" className="w-full h-auto select-none" />
            </div>
            <div data-s2-crew-fg className="absolute right-[5%] bottom-[10%] z-20 w-[33%] sm:w-[27%] max-w-[330px] pointer-events-none will-change-transform">
              <img src={ABOUT_MEDIA.cruiseFgLead} alt="Protagonist skating ahead in foreground" decoding="async" className="w-full h-auto select-none" />
            </div>

            {/* Foreground concrete curb & rail parallax */}
            <div data-s2-fg aria-hidden="true" className="absolute bottom-0 left-[-10%] w-[150%] h-12 md:h-16 z-30 pointer-events-none will-change-transform">
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

            {/* Scene 02 Typography & Materials */}
            <div
              data-s2-copy
              className="absolute top-20 md:top-24 left-4 md:left-10 z-30 max-w-lg bg-[#F4F3EF]/90 border-l-4 border-[#1D2B44] p-5 pointer-events-none"
            >
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D2B44]">
                {ABOUT_STORY_COPY.scene02.label}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-[#111111] mt-2.5 font-medium">
                {ABOUT_STORY_COPY.scene02.paragraph}
              </p>
              <dl className="mt-4 pt-3 border-t border-[#D4D2CA] grid grid-cols-3 gap-2 font-mono text-[10px] uppercase">
                {ABOUT_STORY_COPY.scene02.materials.map((m) => (
                  <div key={m.label}>
                    <dt className="text-[#6E6D68]">{m.label}</dt>
                    <dd className="font-bold text-[#111111] mt-0.5">{m.spec}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SCENES 03, 04 & 05 — KICKFLIP -> CREW & IDENTITY -> ARCHIVE     */}
          {/* =============================================================== */}
          <div data-s345 className="absolute inset-0 will-change-transform">
            {/* Low-angle stair environment */}
            <div data-bg-stairs className="absolute inset-0 will-change-transform" style={{ transformOrigin: '50% 70%' }}>
              <img
                src={ABOUT_MEDIA.bgKickflip}
                alt="Low-angle concrete stair set looking upward"
                decoding="async"
                className="w-full h-full object-cover object-center select-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#F4F3EF]/90 via-[#F4F3EF]/15 to-transparent"
              />
            </div>

            {/* Wide pulled-back skatepark / seawall environment */}
            <div data-bg-wide className="absolute inset-0 will-change-transform" style={{ transformOrigin: '50% 62%' }}>
              <img
                src={ABOUT_MEDIA.bgWide}
                alt="Wide illustrated La Gi concrete breakwater horizon"
                decoding="async"
                className="w-full h-full object-cover object-center select-none"
              />
            </div>

            {/* Crew in background joining after landing */}
            <div
              data-bg-crew
              className="absolute inset-x-0 bottom-[25%] sm:bottom-[27%] z-10 pointer-events-none flex items-end justify-center will-change-transform"
            >
              <div className="w-[70%] sm:w-[54%] md:w-[44%] max-w-[620px] flex items-end justify-between gap-2 opacity-90">
                <img src={ABOUT_MEDIA.cruiseBgPair} alt="Crew rolling down stairs" decoding="async" className="w-[48%] h-auto select-none" />
                <img src={ABOUT_MEDIA.cruiseMidPair} alt="Crew skating through plaza" decoding="async" className="w-[46%] h-auto select-none" />
              </div>
            </div>

            {/* Scene 03 Kickflip Canvas */}
            <div
              data-kf-canvas
              className="absolute inset-x-0 top-[2%] bottom-[18%] z-20 flex items-center justify-center pointer-events-none will-change-transform"
            >
              <KickflipCanvas
                ref={kickflipRef}
                initialFrame={0}
                className="w-[94%] sm:w-[78%] md:w-[64%] max-w-[780px] h-full"
              />
            </div>

            {/* Scene 04 Protagonist rollout */}
            <div
              data-rollout
              className="absolute left-[40%] sm:left-[43%] bottom-[11%] z-20 w-[26%] sm:w-[20%] md:w-[15%] max-w-[210px] pointer-events-none will-change-transform origin-bottom"
            >
              <img src={ABOUT_MEDIA.protagonistRear} alt="Protagonist skating away with crew" decoding="async" className="w-full h-auto select-none" />
            </div>

            {/* SCENE 03 TYPOGRAPHY (Negative space below board, no floating card) */}
            <div
              data-s3-copy
              className="absolute inset-x-0 bottom-[8%] sm:bottom-[10%] z-30 px-4 md:px-10 text-center pointer-events-none"
            >
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#9E3E24]">
                {ABOUT_STORY_COPY.scene03.label}
              </p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-[-0.04em] text-[#0E0E0E] leading-[0.9] mt-1.5">
                {ABOUT_STORY_COPY.scene03.headline}
              </h2>
            </div>

            {/* SCENE 04 TYPOGRAPHY (Appears once, never repeated) */}
            <div
              data-s4-copy
              className="absolute inset-x-0 top-[16%] sm:top-[18%] z-30 px-4 md:px-10 pointer-events-none"
            >
              <div className="max-w-xl mx-auto text-center">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E3E24]">
                  {ABOUT_STORY_COPY.scene04.label}
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[-0.04em] text-[#0E0E0E] mt-2">
                  {ABOUT_STORY_COPY.scene04.brandLine}
                </h2>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6E6D68] mt-1.5">
                  {ABOUT_STORY_COPY.scene04.locations}
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-[#111111] max-w-[48ch] mx-auto mt-3 font-medium">
                  {ABOUT_STORY_COPY.scene04.paragraph}
                </p>
              </div>
            </div>

            {/* SCENE 05 — ARCHIVE REVEAL */}
            <div
              data-s5-reveal
              className="absolute inset-0 z-30 max-w-[1440px] mx-auto px-4 md:px-10 pt-20 md:pt-24 pb-8 flex flex-col justify-between"
            >
              <div className="max-w-3xl mx-auto text-center">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#9E3E24]">
                  {ABOUT_STORY_COPY.scene05.label}
                </p>
                <h2 className="text-5xl sm:text-7xl md:text-[96px] font-black uppercase tracking-[-0.05em] leading-[0.86] text-[#0E0E0E] mt-2">
                  {ABOUT_STORY_COPY.scene05.wordmark}
                </h2>
                <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.12em] text-[#111111] mt-3">
                  {ABOUT_STORY_COPY.scene05.subhead}
                </p>
                <p className="text-xs sm:text-sm text-[#111111]/85 max-w-[50ch] mx-auto mt-3 leading-relaxed font-medium">
                  {ABOUT_STORY_COPY.scene05.paragraph}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleShopDrop}
                    className="min-h-[44px] inline-flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border-2 border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] transition-colors cursor-pointer"
                  >
                    SHOP DROP 01
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenArchive}
                    className="min-h-[44px] inline-flex items-center gap-2 bg-[#EAE8E1] text-[#111111] border-2 border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] transition-colors cursor-pointer"
                  >
                    ARCHIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrewOpen(true)}
                    className="min-h-[44px] inline-flex items-center gap-2 bg-[#F4F3EF]/92 text-[#111111] border-2 border-[#111111] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#1D2B44] hover:text-[#F4F3EF] transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4" aria-hidden="true" />
                    CREW ARCHIVE (05)
                  </button>
                </div>
              </div>

              <dl className="w-full max-w-4xl mx-auto bg-[#F4F3EF]/94 border border-[#111111] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#D4D2CA] font-mono text-[10px] uppercase">
                {ABOUT_STORY_COPY.scene05.specs.map((spec) => (
                  <div key={spec.label} className="px-3.5 py-2.5">
                    <dt className="text-[#6E6D68]">{spec.label}</dt>
                    <dd className="font-bold text-[#111111] mt-0.5">
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
          </div>
        </section>
      )}

      <AboutCrewModal
        isOpen={crewOpen}
        onClose={() => setCrewOpen(false)}
        onShopDrop={handleShopDrop}
      />
    </div>
  );
};
