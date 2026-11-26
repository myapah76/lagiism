import { RefObject, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ActiveView, DropFilterCategory } from '../../../types/store';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface UseHomeScrollAnimationsOptions {
  rootRef: RefObject<HTMLDivElement | null>;
  activeView: ActiveView;
  dropCategory: DropFilterCategory;
  visibleProductCount: number;
  totalProductCount: number;
}

/**
 * Coordinates all homepage (/) GSAP + ScrollTrigger animations using @gsap/react useGSAP:
 * - Uses gsap.matchMedia('(prefers-reduced-motion: no-preference)') so OS reduced-motion
 *   changes revert inline styles automatically with zero hidden/stuck content.
 * - Handles dynamically mounted product cards (infinite scroll & category filters)
 *   without replaying already-revealed cards or leaving stale ScrollTriggers.
 * - Debounces ScrollTrigger.refresh() via ResizeObserver (height-delta guarded),
 *   lazy image load capture, and document.fonts.ready so dynamic shifts stay accurate.
 */
export function useHomeScrollAnimations({
  rootRef,
  activeView,
  dropCategory,
  visibleProductCount,
  totalProductCount,
}: UseHomeScrollAnimationsOptions): void {
  const cardTriggersRef = useRef<ScrollTrigger[]>([]);

  // 1. Core homepage timelines, scrubbed parallax, section reveals (01, 03–07), and layout observers
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || activeView !== 'HOME') return;

      let refreshTimer: number | null = null;
      let lastHeight = root.offsetHeight;

      const scheduleRefresh = () => {
        if (refreshTimer !== null) window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => {
          ScrollTrigger.refresh();
        }, 120);
      };

      const checkHeightAndRefresh = () => {
        const nextHeight = root.offsetHeight;
        if (Math.abs(nextHeight - lastHeight) > 4) {
          lastHeight = nextHeight;
          scheduleRefresh();
        }
      };

      const mm = gsap.matchMedia();

      mm.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          // SECTION 01 — HERO: Introductory timeline + subtle scrubbed image parallax
          const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          introTl
            .fromTo(
              '[data-hero-media]',
              { scale: 1.07, autoAlpha: 0.72 },
              { scale: 1.0, autoAlpha: 1, duration: 1.0 },
              0
            )
            .fromTo(
              '[data-hero-line]',
              { yPercent: 105, autoAlpha: 0 },
              { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.09, clearProps: 'transform,opacity,visibility' },
              0.14
            )
            .fromTo(
              '[data-hero-meta]',
              { y: 12, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08, clearProps: 'transform,opacity,visibility' },
              0.26
            );

          gsap.to('[data-hero-media]', {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-home-hero]',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });

          // Scroll-driven upward glide & fade for the entire hero foreground content group
          gsap.fromTo(
            '[data-hero-content]',
            { yPercent: 0, autoAlpha: 1 },
            {
              yPercent: -26,
              autoAlpha: 0,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: '[data-home-hero]',
                start: 'top top',
                end: 'bottom 22%',
                scrub: true,
              },
            }
          );

          // SECTION 03 — EDITORIAL FILM: Scrubbed image parallax (5% travel within 1.12x bleed) + copy reveal
          gsap.fromTo(
            '[data-film-media]',
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: {
                trigger: '[data-home-section="editorial-film"]',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );

          gsap.fromTo(
            '[data-reveal-block]',
            { y: 22, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.65,
              ease: 'power2.out',
              clearProps: 'transform,opacity,visibility',
              scrollTrigger: {
                trigger: '[data-reveal-block]',
                start: 'top 86%',
                once: true,
              },
            }
          );

          // SECTION 04 — CATEGORY ARCHIVE: Individual asymmetric block reveals
          const categoryBlocks = root.querySelectorAll('[data-category-card]');
          if (categoryBlocks.length > 0) {
            gsap.set(categoryBlocks, { y: 24, autoAlpha: 0 });
            ScrollTrigger.batch(categoryBlocks, {
              start: 'top 88%',
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.6,
                  stagger: 0.08,
                  ease: 'power2.out',
                  clearProps: 'transform,opacity,visibility',
                  overwrite: true,
                }),
            });
          }

          // SECTION 05 — SHOP THE SET: Subtle heading & builder entrance (never interferes with 3D canvas)
          const setTargets = root.querySelectorAll('[data-set-reveal]');
          if (setTargets.length > 0) {
            gsap.fromTo(
              setTargets,
              { y: 20, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
                clearProps: 'transform,opacity,visibility',
                scrollTrigger: {
                  trigger: '#shop-the-set',
                  start: 'top 86%',
                  once: true,
                },
              }
            );
          }

          // SECTION 06 — FREEFORM STUDIO: Restrained entrance for studio header & drafting frame
          const studioTargets = root.querySelectorAll('[data-studio-reveal]');
          if (studioTargets.length > 0) {
            gsap.fromTo(
              studioTargets,
              { y: 20, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
                clearProps: 'transform,opacity,visibility',
                scrollTrigger: {
                  trigger: '[data-testid="customize-look-section"]',
                  start: 'top 88%',
                  once: true,
                },
              }
            );
          }

          // SECTION 07 — FOOTER: Subtle entrance keeping links immediately usable
          const footerTargets = root.querySelectorAll('[data-footer-reveal]');
          if (footerTargets.length > 0) {
            gsap.fromTo(
              footerTargets,
              { y: 16, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.55,
                stagger: 0.07,
                ease: 'power2.out',
                clearProps: 'transform,opacity,visibility',
                scrollTrigger: {
                  trigger: 'footer',
                  start: 'top 94%',
                  once: true,
                },
              }
            );
          }

          // Cleanup if OS prefers-reduced-motion toggles to "reduce" live or view unmounts
          return () => {
            cardTriggersRef.current.forEach((st) => st.kill());
            cardTriggersRef.current = [];
            const cards = root.querySelectorAll<HTMLElement>('[data-reveal-card]');
            if (cards.length > 0) {
              gsap.set(cards, { clearProps: 'transform,opacity,visibility' });
              cards.forEach((el) => el.removeAttribute('data-card-animated'));
            }
          };
        },
        root
      );

      // Watch root height changes (API data, infinite scroll, category filters, image decode)
      const ro = new ResizeObserver(checkHeightAndRefresh);
      ro.observe(root);

      const onMediaLoad = (event: Event) => {
        if (event.target instanceof HTMLImageElement) {
          checkHeightAndRefresh();
        }
      };
      root.addEventListener('load', onMediaLoad, true);

      if (typeof document !== 'undefined' && document.fonts?.ready) {
        document.fonts.ready.then(scheduleRefresh);
      }

      return () => {
        if (refreshTimer !== null) window.clearTimeout(refreshTimer);
        ro.disconnect();
        root.removeEventListener('load', onMediaLoad, true);
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [activeView], revertOnUpdate: true }
  );

  // 2. Dynamically mounted product cards (Section 02: infinite scroll + category filter changes)
  useEffect(() => {
    const root = rootRef.current;
    if (!root || activeView !== 'HOME') return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Prune stale triggers from unmounted/filtered-out cards
    cardTriggersRef.current = cardTriggersRef.current.filter((st) => {
      if (!st.trigger || !st.trigger.isConnected) {
        st.kill();
        return false;
      }
      return true;
    });

    // Target ONLY newly mounted cards that have not been animated yet
    const newCards = Array.from(
      root.querySelectorAll<HTMLElement>('[data-reveal-card]:not([data-card-animated])')
    );
    if (newCards.length === 0) return;

    newCards.forEach((el) => el.setAttribute('data-card-animated', 'pending'));
    gsap.set(newCards, { y: 20, autoAlpha: 0 });

    const created = ScrollTrigger.batch(newCards, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        batch.forEach((el) => el.setAttribute('data-card-animated', 'done'));
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration: 0.55,
          stagger: 0.06,
          ease: 'power2.out',
          clearProps: 'transform,opacity,visibility',
          overwrite: true,
        });
      },
    });

    cardTriggersRef.current.push(...created);
    ScrollTrigger.refresh();
  }, [rootRef, activeView, dropCategory, visibleProductCount, totalProductCount]);
}
