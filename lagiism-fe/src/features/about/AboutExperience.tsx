import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { ActiveView } from '../../types/store';
import {
  KICKFLIP_SEQUENCE,
  SCENE_CHAPTERS,
  SceneChapter,
} from './data/aboutEditorialData';
import { useReducedMotion } from './hooks/useReducedMotion';
import { EditorialChrome } from './components/EditorialChrome';
import { CrewRosterDrawer } from './components/CrewRosterDrawer';
import { SceneGathering } from './components/SceneGathering';
import { SceneMovement } from './components/SceneMovement';
import { SceneKickflipFinale } from './components/SceneKickflipFinale';
import { KickflipCanvasHandle } from './components/KickflipSequenceCanvas';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

interface AboutExperienceProps {
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

export const AboutExperience: React.FC<AboutExperienceProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const kickflipCanvasRef = useRef<KickflipCanvasHandle | null>(null);
  const phaseLabelRef = useRef<HTMLSpanElement | null>(null);

  const reducedMotion = useReducedMotion();
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [manualFrame, setManualFrame] = useState(3);
  const [isCrewSheetOpen, setIsCrewSheetOpen] = useState(false);

  // Sync manual frame scrubber in reduced-motion mode
  const handleSelectManualFrame = useCallback((idx: number) => {
    setManualFrame(idx);
    kickflipCanvasRef.current?.drawFrame(idx);
    if (phaseLabelRef.current) {
      phaseLabelRef.current.textContent = KICKFLIP_SEQUENCE[idx].phase;
    }
  }, []);

  // Refresh ScrollTrigger once web fonts finish loading so pin spacers stay exact
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  }, []);

  // Main GSAP + ScrollTrigger storytelling engine (responsive + reduced-motion via matchMedia)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 1024px)',
          isMobile: '(max-width: 1023px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};

          if (reduceMotion) {
            kickflipCanvasRef.current?.drawFrame(3);
            return;
          }

          // =====================================================================
          // SCENE 01 — THE GATHERING
          // Tactile close-ups -> protagonist pushes in -> staggered crew reacts
          // =====================================================================
          const gatheringTl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: 'st-gathering',
              trigger: '[data-scene="gathering"]',
              start: 'top top',
              end: isDesktop ? '+=130%' : '+=85%',
              pin: true,
              scrub: 0.75,
              anticipatePin: 1,
              refreshPriority: 3,
              onEnter: () => setActiveSceneIndex(0),
              onEnterBack: () => setActiveSceneIndex(0),
            },
          });

          gatheringTl
            .addLabel('open', 0)
            .fromTo('[data-gathering-bg]', { scale: 1.0, yPercent: 0 }, { scale: 1.09, yPercent: -2.5, duration: 1 }, 'open')
            .fromTo('[data-gathering-details]', { yPercent: 0, autoAlpha: 1 }, { yPercent: -18, autoAlpha: 0, duration: 0.42 }, 'open')
            .fromTo('[data-gathering-fg-ledge]', { xPercent: 8, yPercent: 18 }, { xPercent: -10, yPercent: 0, duration: 1 }, 'open')
            .addLabel('enter', 0.06)
            .fromTo(
              '[data-gathering-protagonist]',
              { yPercent: 95, xPercent: -10, scale: 1.24, autoAlpha: 0.25 },
              { yPercent: 2, xPercent: 8, scale: 0.96, autoAlpha: 1, ease: 'power2.out', duration: 0.68 },
              'enter'
            )
            .addLabel('react', 0.44)
            .to('[data-crew-member="linh"]', { yPercent: -6, rotation: -1.5, ease: 'power1.inOut', duration: 0.4 }, 'react')
            .to('[data-crew-member="minh"]', { yPercent: -8, rotation: 1.2, ease: 'power1.inOut', duration: 0.4 }, 'react+=0.04')
            .to('[data-crew-member="tuan"]', { yPercent: -5, xPercent: -3, rotation: -1.8, ease: 'power1.inOut', duration: 0.4 }, 'react+=0.08')
            .to('[data-crew-member="ha"]', { yPercent: -10, rotation: 2.5, scale: 1.03, ease: 'power1.inOut', duration: 0.4 }, 'react+=0.06');

          // =====================================================================
          // SCENE 02 — THE MOVEMENT
          // Horizontal tracking (ease: "none") + 3 independent crew depth layers
          // =====================================================================
          const movementTl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: 'st-movement',
              trigger: '[data-scene="movement"]',
              start: 'top top',
              end: isDesktop ? '+=160%' : '+=105%',
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              refreshPriority: 2,
              onEnter: () => setActiveSceneIndex(1),
              onEnterBack: () => setActiveSceneIndex(1),
            },
          });

          movementTl
            .addLabel('track', 0)
            .fromTo('[data-movement-bg]', { xPercent: 0 }, { xPercent: -22, duration: 1 }, 'track')
            .fromTo('[data-movement-crew-bg]', { xPercent: -12 }, { xPercent: 10, duration: 1 }, 'track')
            .fromTo('[data-movement-crew-mid]', { xPercent: -16, yPercent: 1 }, { xPercent: 16, yPercent: -1, duration: 1 }, 'track')
            .fromTo('[data-movement-crew-fg]', { xPercent: -20, yPercent: 2 }, { xPercent: 22, yPercent: -1.5, duration: 1 }, 'track')
            .fromTo('[data-movement-fg]', { xPercent: 10 }, { xPercent: -38, duration: 1 }, 'track')
            .fromTo('[data-movement-copy]', { yPercent: 5, autoAlpha: 0.85 }, { yPercent: 0, autoAlpha: 1, ease: 'power1.out', duration: 0.3 }, 'track');

          // =====================================================================
          // UNIFIED SCENE 03 & SCENE 04 — THE KICKFLIP -> CREW & IDENTITY REVEAL
          // Single pinned ScrollTrigger timeline (0–100%) — ZERO cut, ZERO competing pins:
          //   0.00–0.20  approach        (Normal speed)
          //   0.20–0.35  cameraDrop      (Rapid downward camera plunge under board)
          //   0.35–0.60  slowMoKickflip  (Gradual frame advance + negative-space brand copy)
          //   0.60–0.75  landing         (Normal speed return + level tracking rise)
          //   0.75–1.00  crewReveal      (Crew rollout + wide pullback + Official Logo)
          // =====================================================================
          const frameState = { index: 0 };
          let lastLabelIdx = -1;

          const updateKickflipFrame = () => {
            const idx = Math.max(0, Math.min(KICKFLIP_SEQUENCE.length - 1, Math.round(frameState.index)));
            kickflipCanvasRef.current?.drawFrame(idx);
            if (idx !== lastLabelIdx && phaseLabelRef.current) {
              phaseLabelRef.current.textContent = KICKFLIP_SEQUENCE[idx].phase;
              lastLabelIdx = idx;
            }
          };

          const finaleTl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: 'st-kickflip-finale',
              trigger: '[data-scene="kickflip-finale"]',
              start: 'top top',
              end: isDesktop ? '+=420%' : '+=240%',
              pin: true,
              scrub: 0.65,
              anticipatePin: 1,
              refreshPriority: 1,
              onUpdate: (self) => {
                setActiveSceneIndex(self.progress >= 0.72 ? 3 : 2);
              },
            },
          });

          // Initial visibility state (autoAlpha prevents off-beat clicks)
          gsap.set('[data-kf-purpose-copy]', { autoAlpha: 0, yPercent: 18 });
          gsap.set('[data-kf-identity-reveal]', { autoAlpha: 0, yPercent: 8 });
          gsap.set('[data-kf-rollout]', { autoAlpha: 0, scale: 1.05, yPercent: 18 });
          gsap.set('[data-kf-bg-wide]', { autoAlpha: 0, scale: 1.28, yPercent: 5 });
          updateKickflipFrame();

          // --- PHASE 1: APPROACH (0.00 – 0.20) ---
          finaleTl
            .addLabel('approach', 0)
            .fromTo('[data-kf-bg-park]', { scale: 1.16, xPercent: 3, yPercent: 0 }, { scale: 1.24, xPercent: -1, yPercent: -2, duration: 0.20 }, 'approach')
            .fromTo('[data-kf-crew-bg]', { xPercent: -14, scale: 0.86, autoAlpha: 0.88 }, { xPercent: -4, scale: 0.92, autoAlpha: 0.95, duration: 0.20 }, 'approach')
            .fromTo('[data-kf-hero-stage]', { xPercent: -16, yPercent: 6, scale: 0.88 }, { xPercent: -4, yPercent: 2, scale: 0.96, duration: 0.20 }, 'approach')

            // --- PHASE 2: CAMERA DROP (0.20 – 0.35) ---
            .addLabel('cameraDrop', 0.20)
            .to('[data-kf-bg-park]', { scale: 1.54, yPercent: -15, ease: 'power2.inOut', duration: 0.15 }, 'cameraDrop')
            .to('[data-kf-fg-ledge]', { yPercent: 120, autoAlpha: 0, ease: 'power2.in', duration: 0.14 }, 'cameraDrop')
            .to('[data-kf-hero-stage]', { xPercent: 0, yPercent: -8, scale: 1.12, ease: 'power2.out', duration: 0.15 }, 'cameraDrop')
            .to(frameState, { index: 1.4, duration: 0.15, onUpdate: updateKickflipFrame }, 'cameraDrop')

            // --- PHASE 3: SLOW-MOTION KICKFLIP (0.35 – 0.60) ---
            // Gradual frame progression (1.4 -> 4.0) over 25% of total scroll = slow motion!
            .addLabel('slowMoKickflip', 0.35)
            .to('[data-kf-bg-park]', { scale: 1.6, yPercent: -17, duration: 0.25 }, 'slowMoKickflip')
            .to('[data-kf-hero-stage]', { yPercent: -12, scale: 1.18, duration: 0.25 }, 'slowMoKickflip')
            .to(frameState, { index: 4.0, duration: 0.25, onUpdate: updateKickflipFrame }, 'slowMoKickflip')
            // Integrated negative-space typography beneath the rotating board
            .to('[data-kf-purpose-copy]', { autoAlpha: 1, yPercent: 0, ease: 'power2.out', duration: 0.08 }, 0.39)
            .to('[data-kf-purpose-copy]', { autoAlpha: 0, yPercent: -10, ease: 'power1.in', duration: 0.06 }, 0.56)

            // --- PHASE 4: LANDING & TRACKING RISE (0.60 – 0.75) ---
            .addLabel('landing', 0.60)
            .to(frameState, { index: 5, duration: 0.11, onUpdate: updateKickflipFrame }, 'landing')
            .to('[data-kf-hero-stage]', { xPercent: 8, yPercent: 6, scale: 0.94, ease: 'power2.inOut', duration: 0.12 }, 'landing')
            .to('[data-kf-bg-park]', { scale: 1.24, yPercent: -4, xPercent: -6, ease: 'power1.inOut', duration: 0.15 }, 'landing')
            .to('[data-kf-crew-bg]', { xPercent: 8, yPercent: 8, scale: 0.98, duration: 0.15 }, 'landing')
            // Seamless handoff from kickflip landing into rollout cutout
            .to('[data-kf-hero-stage]', { autoAlpha: 0, duration: 0.06 }, 0.70)
            .to('[data-kf-rollout]', { autoAlpha: 1, duration: 0.06 }, 0.70)

            // --- PHASE 5: CREW CONTINUATION, WIDE PULLBACK & OFFICIAL LOGO REVEAL (0.75 – 1.00) ---
            .addLabel('crewReveal', 0.75)
            .to('[data-kf-bg-park]', { autoAlpha: 0, scale: 1.05, duration: 0.12 }, 'crewReveal')
            .to('[data-kf-bg-wide]', { autoAlpha: 1, scale: 1.0, yPercent: 0, ease: 'power1.out', duration: 0.22 }, 'crewReveal')
            .to('[data-kf-crew-bg]', { xPercent: 18, yPercent: 2, scale: 0.58, autoAlpha: 0.75, ease: 'power1.inOut', duration: 0.22 }, 'crewReveal')
            .to('[data-kf-rollout]', { scale: 0.38, yPercent: -16, autoAlpha: 0.85, ease: 'power1.inOut', duration: 0.22 }, 'crewReveal')
            .to('[data-kf-identity-reveal]', { autoAlpha: 1, yPercent: 0, ease: 'power2.out', duration: 0.14 }, 0.84);
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  // Navigate cleanly to exact pinned ScrollTrigger start or timeline label via ScrollToPlugin
  const handleSelectChapter = useCallback(
    (chapter: SceneChapter) => {
      if (reducedMotion) {
        const el = document.getElementById(chapter.id);
        el?.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }

      const st = ScrollTrigger.getById(chapter.triggerId);
      if (st) {
        const targetY =
          chapter.timelineLabel && typeof st.labelToScroll === 'function'
            ? st.labelToScroll(chapter.timelineLabel)
            : st.start;

        if (typeof targetY === 'number' && !Number.isNaN(targetY)) {
          gsap.to(window, {
            scrollTo: { y: targetY, autoKill: true },
            duration: 0.9,
            ease: 'power2.inOut',
          });
          return;
        }
      }

      const fallbackEl = document.getElementById(chapter.id);
      fallbackEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [reducedMotion]
  );

  const handleExploreShop = useCallback(() => {
    onNavigate('SHOP_ALL');
  }, [onNavigate]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div
          ref={containerRef}
          className="relative w-full bg-[#F4F3EF] text-[#111111] selection:bg-[#9E3E24] selection:text-[#F4F3EF]"
        >
          <EditorialChrome
            activeSceneIndex={activeSceneIndex}
            onSelectChapter={handleSelectChapter}
            onOpenCrewSheet={() => setIsCrewSheetOpen(true)}
            reducedMotion={reducedMotion}
          />

          <SceneGathering reducedMotion={reducedMotion} />

          <SceneMovement reducedMotion={reducedMotion} />

          <SceneKickflipFinale
            kickflipCanvasRef={kickflipCanvasRef}
            phaseLabelRef={phaseLabelRef}
            reducedMotion={reducedMotion}
            manualFrame={manualFrame}
            onSelectManualFrame={handleSelectManualFrame}
            onExploreShop={handleExploreShop}
            onOpenCrewSheet={() => setIsCrewSheetOpen(true)}
          />

          <CrewRosterDrawer
            isOpen={isCrewSheetOpen}
            onClose={() => setIsCrewSheetOpen(false)}
            onExploreShop={handleExploreShop}
            reducedMotion={reducedMotion}
          />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
};
