import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { ActiveView } from '../../types/store';
import {
  KICKFLIP_SEQUENCE,
  SceneChapter,
} from './data/aboutEditorialData';
import { useReducedMotion } from './hooks/useReducedMotion';
import { EditorialChrome } from './components/EditorialChrome';
import { CrewRosterDrawer } from './components/CrewRosterDrawer';
import { MasterCinematicStage } from './components/MasterCinematicStage';
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
  const telemetryRef = useRef<HTMLSpanElement | null>(null);

  const reducedMotion = useReducedMotion();
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [manualFrame, setManualFrame] = useState(5);
  const [isCrewSheetOpen, setIsCrewSheetOpen] = useState(false);

  const handleSelectManualFrame = useCallback((idx: number) => {
    setManualFrame(idx);
    kickflipCanvasRef.current?.drawFrame(idx);
    if (telemetryRef.current) {
      telemetryRef.current.textContent = KICKFLIP_SEQUENCE[idx].phase;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  }, []);

  // ONE SINGLE CONTINUOUS MASTER GSAP TIMELINE (0% – 100%)
  // No competing pins, no camera resets between scenes, full reverse-scroll fidelity.
  useGSAP(
    () => {
      if (reducedMotion) {
        kickflipCanvasRef.current?.drawFrame(5);
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 1024px)',
          isMobile: '(max-width: 1023px)',
        },
        (context) => {
          const { isDesktop } = context.conditions ?? {};

          const frameState = { index: 0 };
          let lastFrameIdx = -1;
          let lastChapter = -1;

          const drawCurrentFrame = () => {
            const idx = Math.max(
              0,
              Math.min(KICKFLIP_SEQUENCE.length - 1, Math.round(frameState.index))
            );
            if (idx !== lastFrameIdx) {
              kickflipCanvasRef.current?.drawFrame(idx);
              lastFrameIdx = idx;
            }
          };

          const setTelemetry = (text: string) => {
            if (telemetryRef.current && telemetryRef.current.textContent !== text) {
              telemetryRef.current.textContent = text;
            }
          };

          // Initial spatial states (using autoAlpha to prevent off-beat clicks)
          gsap.set('[data-act-gathering]', { xPercent: 0, scale: 1.0, autoAlpha: 1 });
          gsap.set('[data-act-movement]', { xPercent: 100, autoAlpha: 0 });
          gsap.set('[data-act-kickflip]', { yPercent: 0, autoAlpha: 0 });
          gsap.set('[data-k-bg-wide]', { autoAlpha: 0, scale: 1.28, yPercent: 5 });
          gsap.set('[data-k-hero-canvas]', { autoAlpha: 0, yPercent: 12, scale: 0.88 });
          gsap.set('[data-k-rollout]', { autoAlpha: 0, scale: 1.04, yPercent: 18 });
          gsap.set('[data-k-underboard-copy]', { autoAlpha: 0, yPercent: 16 });
          gsap.set('[data-k-identity]', { autoAlpha: 0, yPercent: 8 });
          gsap.set('[data-wipe-pillar]', { xPercent: 450, autoAlpha: 0 });
          gsap.set('[data-wipe-stairlip]', { yPercent: 120, autoAlpha: 0 });
          drawCurrentFrame();

          const master = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: 'st-master-story',
              trigger: '[data-master-stage]',
              start: 'top top',
              end: isDesktop ? '+=760%' : '+=440%',
              pin: true,
              scrub: 0.7,
              anticipatePin: 1,
              onUpdate: (self) => {
                const p = self.progress;
                const nextChapter = p < 0.21 ? 0 : p < 0.46 ? 1 : p < 0.78 ? 2 : 3;
                if (nextChapter !== lastChapter) {
                  lastChapter = nextChapter;
                  setActiveSceneIndex(nextChapter);
                }

                if (p < 0.20) {
                  setTelemetry('01 // THE GATHERING — LA GI SEAWALL');
                } else if (p < 0.44) {
                  setTelemetry('02 // THE MOVEMENT — SAIGON TRACKING');
                } else if (p < 0.78) {
                  const idx = Math.max(
                    0,
                    Math.min(KICKFLIP_SEQUENCE.length - 1, Math.round(frameState.index))
                  );
                  setTelemetry(KICKFLIP_SEQUENCE[idx].phase);
                } else {
                  setTelemetry('04 // THE IDENTITY — LA GI HORIZON');
                }
              },
            },
          });

          // =================================================================
          // ACT I: THE GATHERING (0.00 – 0.18)
          // =================================================================
          master
            .addLabel('gathering', 0)
            .to('[data-act-gathering]', { scale: 1.08, duration: 0.16 }, 'gathering')
            .fromTo(
              '[data-g-details]',
              { yPercent: 0, autoAlpha: 1 },
              { yPercent: -22, autoAlpha: 0, duration: 0.08 },
              0.01
            )
            .fromTo(
              '[data-g-protagonist]',
              { yPercent: 92, xPercent: -8, scale: 1.22, autoAlpha: 0.2 },
              { yPercent: 2, xPercent: 8, scale: 0.96, autoAlpha: 1, ease: 'power2.out', duration: 0.11 },
              0.01
            )
            .to('[data-g-crew="linh"]', { yPercent: -8, rotation: -1.5, duration: 0.08 }, 0.08)
            .to('[data-g-crew="minh"]', { yPercent: -10, rotation: 1.2, duration: 0.08 }, 0.09)
            .to('[data-g-crew="tuan"]', { yPercent: -7, xPercent: -3, rotation: -1.8, duration: 0.08 }, 0.10)
            .to('[data-g-crew="ha"]', { yPercent: -12, rotation: 2.5, scale: 1.04, duration: 0.08 }, 0.09)
            .to('[data-g-scrollcue]', { autoAlpha: 0, duration: 0.04 }, 0.06)

            // ===============================================================
            // TRANSITION A: GATHERING -> MOVEMENT (0.16 – 0.24)
            // Continuous sideways camera pan + foreground concrete pillar wipe
            // ===============================================================
            .to('[data-wipe-pillar]', { autoAlpha: 1, duration: 0.01 }, 0.16)
            .fromTo('[data-wipe-pillar]', { xPercent: 420 }, { xPercent: -150, duration: 0.08 }, 0.16)
            .to('[data-wipe-pillar]', { autoAlpha: 0, duration: 0.01 }, 0.24)
            .to('[data-act-gathering]', { xPercent: -100, autoAlpha: 0, duration: 0.08 }, 0.17)
            .to('[data-act-movement]', { xPercent: 0, autoAlpha: 1, duration: 0.08 }, 0.17)

            // ===============================================================
            // ACT II: THE MOVEMENT (0.22 – 0.44)
            // Continuous horizontal tracking (ease: "none") + 3 crew depth planes
            // ===============================================================
            .addLabel('movement', 0.24)
            .fromTo('[data-m-bg]', { xPercent: 0 }, { xPercent: -24, duration: 0.22 }, 0.22)
            .fromTo('[data-m-crew-bg]', { xPercent: -10 }, { xPercent: 12, duration: 0.22 }, 0.22)
            .fromTo('[data-m-crew-mid]', { xPercent: -14, yPercent: 1 }, { xPercent: 18, yPercent: -1, duration: 0.22 }, 0.22)
            .fromTo('[data-m-crew-fg]', { xPercent: -18, yPercent: 2 }, { xPercent: 28, yPercent: -2, scale: 1.06, duration: 0.22 }, 0.22)
            .fromTo('[data-m-fg]', { xPercent: 10 }, { xPercent: -42, duration: 0.22 }, 0.22)
            .fromTo('[data-m-copy]', { autoAlpha: 0, yPercent: 10 }, { autoAlpha: 1, yPercent: 0, duration: 0.05 }, 0.24)
            .to('[data-m-copy]', { autoAlpha: 0, yPercent: -8, duration: 0.04 }, 0.39)

            // ===============================================================
            // TRANSITION B: MOVEMENT -> UNDER-BOARD KICKFLIP (0.41 – 0.50)
            // Protagonist separates; camera plunges downward under the stairs!
            // ===============================================================
            .addLabel('cameraDrop', 0.42)
            .to('[data-wipe-stairlip]', { autoAlpha: 1, yPercent: 0, ease: 'power2.in', duration: 0.05 }, 0.42)
            .to('[data-act-movement]', { yPercent: -18, scale: 1.18, autoAlpha: 0, duration: 0.06 }, 0.43)
            .to('[data-act-kickflip]', { autoAlpha: 1, duration: 0.05 }, 0.43)
            .fromTo(
              '[data-k-bg-stairs]',
              { scale: 1.12, yPercent: 6, rotation: -1.8 },
              { scale: 1.56, yPercent: -16, rotation: 0, ease: 'power2.inOut', duration: 0.09 },
              0.43
            )
            .to('[data-wipe-stairlip]', { yPercent: 130, autoAlpha: 0, ease: 'power2.out', duration: 0.05 }, 0.47)
            .fromTo(
              '[data-k-crew-bg]',
              { xPercent: -12, scale: 0.85, autoAlpha: 0.85 },
              { xPercent: -2, scale: 0.92, autoAlpha: 0.95, duration: 0.08 },
              0.44
            )
            .to('[data-k-hero-canvas]', { autoAlpha: 1, yPercent: -6, scale: 1.06, duration: 0.06 }, 0.45)
            .to(frameState, { index: 2, duration: 0.06, onUpdate: drawCurrentFrame }, 0.45)

            // ===============================================================
            // ACT III: UNDER-BOARD SLOW-MOTION KICKFLIP (0.51 – 0.70)
            // Gradual frame advancement (frames 2 -> 8) = true slow motion!
            // ===============================================================
            .addLabel('slowMoKickflip', 0.51)
            .to('[data-k-bg-stairs]', { scale: 1.62, yPercent: -18, duration: 0.19 }, 'slowMoKickflip')
            .to('[data-k-hero-canvas]', { yPercent: -10, scale: 1.14, duration: 0.19 }, 'slowMoKickflip')
            .to(frameState, { index: 8, duration: 0.19, onUpdate: drawCurrentFrame }, 'slowMoKickflip')
            // Integrated negative-space brand typography beneath the overhead board
            .to('[data-k-underboard-copy]', { autoAlpha: 1, yPercent: 0, ease: 'power2.out', duration: 0.05 }, 0.53)
            .to('[data-k-underboard-copy]', { autoAlpha: 0, yPercent: -8, ease: 'power1.in', duration: 0.04 }, 0.67)

            // ===============================================================
            // TRANSITION C: LANDING -> CREW CONTINUATION (0.70 – 0.80)
            // Normal speed return (frames 8 -> 11), camera rises to track rollout
            // ===============================================================
            .addLabel('landing', 0.70)
            .to(frameState, { index: 11, duration: 0.07, onUpdate: drawCurrentFrame }, 'landing')
            .to('[data-k-hero-canvas]', { xPercent: 8, yPercent: 8, scale: 0.92, ease: 'power2.inOut', duration: 0.08 }, 'landing')
            .to('[data-k-bg-stairs]', { scale: 1.24, yPercent: -4, xPercent: -5, ease: 'power1.inOut', duration: 0.10 }, 'landing')
            .to('[data-k-crew-bg]', { xPercent: 10, yPercent: 6, scale: 0.98, duration: 0.10 }, 'landing')
            .to('[data-k-hero-canvas]', { autoAlpha: 0, duration: 0.04 }, 0.76)
            .to('[data-k-rollout]', { autoAlpha: 1, duration: 0.04 }, 0.76)

            // ===============================================================
            // TRANSITION D: WIDE PULLBACK -> EARNED OFFICIAL LAGIISM IDENTITY (0.80 – 1.00)
            // ===============================================================
            .addLabel('identity', 0.80)
            .to('[data-k-bg-stairs]', { autoAlpha: 0, scale: 1.05, duration: 0.09 }, 'identity')
            .to('[data-k-bg-wide]', { autoAlpha: 1, scale: 1.0, yPercent: 0, ease: 'power1.out', duration: 0.18 }, 'identity')
            .to('[data-k-crew-bg]', { xPercent: 20, yPercent: 2, scale: 0.54, autoAlpha: 0.72, ease: 'power1.inOut', duration: 0.18 }, 'identity')
            .to('[data-k-rollout]', { scale: 0.36, yPercent: -16, autoAlpha: 0.85, ease: 'power1.inOut', duration: 0.18 }, 'identity')
            .to('[data-k-identity]', { autoAlpha: 1, yPercent: 0, ease: 'power2.out', duration: 0.12 }, 0.87);
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  // Smoothly jump to exact master-timeline label via ScrollToPlugin
  const handleSelectChapter = useCallback(
    (chapter: SceneChapter) => {
      if (reducedMotion) {
        const el = document.getElementById(chapter.id);
        el?.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }

      const st = ScrollTrigger.getById(chapter.triggerId);
      if (st && typeof st.labelToScroll === 'function') {
        const targetY = st.labelToScroll(chapter.timelineLabel);
        if (typeof targetY === 'number' && !Number.isNaN(targetY)) {
          gsap.to(window, {
            scrollTo: { y: targetY, autoKill: true },
            duration: 0.95,
            ease: 'power2.inOut',
          });
          return;
        }
      }
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

          {reducedMotion ? (
            <>
              <SceneGathering reducedMotion />
              <SceneMovement reducedMotion />
              <SceneKickflipFinale
                kickflipCanvasRef={kickflipCanvasRef}
                phaseLabelRef={telemetryRef}
                reducedMotion
                manualFrame={manualFrame}
                onSelectManualFrame={handleSelectManualFrame}
                onExploreShop={handleExploreShop}
                onOpenCrewSheet={() => setIsCrewSheetOpen(true)}
              />
            </>
          ) : (
            <MasterCinematicStage
              kickflipCanvasRef={kickflipCanvasRef}
              telemetryRef={telemetryRef}
              onExploreShop={handleExploreShop}
              onOpenCrewSheet={() => setIsCrewSheetOpen(true)}
            />
          )}

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
