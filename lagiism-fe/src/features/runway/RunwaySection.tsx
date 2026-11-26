import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, Pause, Play, ShoppingBag } from 'lucide-react';
import { RUNWAY_LOOKS, RunwayLook, RunwayProduct } from './data/runwayLooks';
import { wrapN } from './utils/runwayPhysics';
import {
  StylingBagEntry,
  addEntriesToStylingBag,
  getStylingBagCount,
  loadStylingBag,
  removeEntryFromStylingBag,
  saveStylingBag,
} from './utils/stylingBag';
import { useRunwayAutoplay } from './hooks/useRunwayAutoplay';
import { RunwayStage } from './components/RunwayStage';
import { LookPanel } from './components/LookPanel';
import { SizeSheet } from './components/SizeSheet';
import { LookLightbox } from './components/LookLightbox';
import { StylingBagDrawer } from './components/StylingBagDrawer';
import './styles/runway.css';

interface RunwaySectionProps {
  looks?: RunwayLook[];
  onOpenProduct: (productId: string) => void;
}

export const RunwaySection: React.FC<RunwaySectionProps> = ({
  looks = RUNWAY_LOOKS,
  onOpenProduct,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);

  const count = looks.length;

  // Responsive breakpoint (749/750px) & OS reduced motion
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 749 : false
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Core Runway navigation state
  const [target, setTarget] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sweepKey, setSweepKey] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Autoplay & visibility state
  const [isSectionVisible, setIsSectionVisible] = useState(true);
  const [isDocHidden, setIsDocHidden] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanelHovered, setIsPanelHovered] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [autoplayResetKey, setAutoplayResetKey] = useState(0);

  // Interactive product & popup state
  const [hotProductId, setHotProductId] = useState<string | null>(null);
  const [scrollToProductId, setScrollToProductId] = useState<string | null>(null);
  const [openPickerIds, setOpenPickerIds] = useState<Record<string, boolean>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [loadingProductIds, setLoadingProductIds] = useState<Record<string, boolean>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [bundleStatus, setBundleStatus] = useState<string | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);

  const [mobileSheetProduct, setMobileSheetProduct] = useState<RunwayProduct | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [bagDrawerOpen, setBagDrawerOpen] = useState(false);

  // Persistent Styling Bag (localStorage: lagiism-styling-bag-v1)
  const [bagEntries, setBagEntries] = useState<StylingBagEntry[]>(() => loadStylingBag());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const activeLook = looks[wrapN(activeIndex, count)] ?? looks[0];

  // Sync Styling Bag to localStorage
  useEffect(() => {
    saveStylingBag(bagEntries);
  }, [bagEntries]);

  // Breakpoint (749/750px) + reduced motion listeners; re-dock mobile sheet on desktop resize
  useEffect(() => {
    const onResize = () => {
      const mobileNow = window.innerWidth <= 749;
      setIsMobile(mobileNow);
      if (!mobileNow) {
        setMobileSheetProduct((prev) => {
          if (prev) {
            setOpenPickerIds((curr) => ({ ...curr, [prev.id]: true }));
          }
          return null;
        });
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq?.addEventListener('change', onMq);

    const onVis = () => setIsDocHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.removeEventListener('resize', onResize);
      mq?.removeEventListener('change', onMq);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Intro Reveal (IntersectionObserver rootMargin "0px 0px -22% 0px" + 2 RAFs + GSAP)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const visIo = new IntersectionObserver(
      (entries) => setIsSectionVisible(entries.some((e) => e.isIntersecting)),
      { threshold: 0 }
    );
    visIo.observe(el);

    if (reducedMotion) {
      return () => visIo.disconnect();
    }

    let revealed = false;
    let raf1 = 0;
    let raf2 = 0;
    let ctx: gsap.Context | null = null;

    const revealIo = new IntersectionObserver(
      (entries) => {
        if (revealed || !entries.some((e) => e.isIntersecting)) return;
        revealed = true;
        revealIo.disconnect();

        raf1 = requestAnimationFrame(() => {
          raf2 = requestAnimationFrame(() => {
            ctx = gsap.context(() => {
              gsap.fromTo(
                '[data-rw-title]',
                { autoAlpha: 0, y: 22, letterSpacing: '0.03em' },
                { autoAlpha: 1, y: 0, letterSpacing: '-0.03em', duration: 1.2, ease: 'power3.out' }
              );
              gsap.fromTo(
                '[data-rw-subtitle]',
                { autoAlpha: 0, y: 22 },
                { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.26, ease: 'power2.out' }
              );
              gsap.fromTo(
                '[data-rw-stage-wrap]',
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 1.2, delay: 0.1, ease: 'power2.out' }
              );
              gsap.fromTo(
                '[data-rw-panel-wrap]',
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 1.0, delay: 0.25, ease: 'power2.out' }
              );
              gsap.fromTo(
                '[data-rw-controls]',
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 1.0, delay: 0.5, ease: 'power2.out' }
              );
            }, sectionRef);
          });
        });
      },
      { threshold: 0, rootMargin: '0px 0px -22% 0px' }
    );
    revealIo.observe(el);

    return () => {
      visIo.disconnect();
      revealIo.disconnect();
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      ctx?.revert();
    };
  }, [reducedMotion]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Core navigation methods
  const moveTo = useCallback(
    (nextTarget: number) => {
      const nextIdx = wrapN(Math.round(nextTarget), count);
      setTarget(nextTarget);
      setActiveIndex(nextIdx);
      setLightboxOpen(false);
      setMobileSheetProduct(null);
      setHotProductId(null);
      setBundleStatus(null);
      setSweepKey((k) => k + 1);
      setAutoplayResetKey((k) => k + 1);
      const nextLook = looks[nextIdx];
      if (nextLook) {
        setLiveAnnouncement(`Look 0${nextLook.number} of 0${count}: ${nextLook.name}`);
      }
    },
    [count, looks]
  );

  const next = useCallback(() => {
    moveTo(Math.round(target) + 1);
  }, [moveTo, target]);

  const prev = useCallback(() => {
    moveTo(Math.round(target) - 1);
  }, [moveTo, target]);

  const go = useCallback(
    (index: number) => {
      let distance = (index - activeIndex + count) % count;
      if (distance > count / 2) distance -= count;
      if (distance === 0) return;
      moveTo(Math.round(target) + distance);
    },
    [activeIndex, count, moveTo, target]
  );

  // Autoplay active condition
  const isAutoplayRunning =
    autoplayEnabled &&
    !reducedMotion &&
    !userEngaged &&
    isSectionVisible &&
    !isDocHidden &&
    !isDragging &&
    !isPanelHovered &&
    !lightboxOpen &&
    !mobileSheetProduct &&
    !bagDrawerOpen;

  useRunwayAutoplay({
    enabled: isAutoplayRunning,
    intervalMs: 5000,
    resetKey: autoplayResetKey,
    onAdvance: next,
  });

  // Track which products in the active look are already saved in the bag
  const addedProductIds = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const entry of bagEntries) {
      map[entry.productId] = true;
    }
    return map;
  }, [bagEntries]);

  const eligibleProducts = useMemo(
    () => activeLook.products.filter((p) => p.available),
    [activeLook.products]
  );

  const bundleComplete =
    eligibleProducts.length > 0 && eligibleProducts.every((p) => addedProductIds[p.id]);

  // Engage shopping lock (stops autoplay until manually restarted)
  const engageShopping = useCallback(() => {
    setUserEngaged(true);
  }, []);

  const handleTogglePicker = useCallback(
    (product: RunwayProduct) => {
      engageShopping();
      setBundleStatus(null);

      // Single direct variant (e.g. ONE SIZE accessory) can still confirm cleanly
      if (isMobile) {
        setMobileSheetProduct(product);
      } else {
        setOpenPickerIds((prev) => ({ ...prev, [product.id]: !prev[product.id] }));
      }
    },
    [engageShopping, isMobile]
  );

  const handleSelectVariant = useCallback(
    (productId: string, variantId: string) => {
      engageShopping();
      setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
      setRowErrors((prev) => {
        if (!prev[productId]) return prev;
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    },
    [engageShopping]
  );

  const handleConfirmAdd = useCallback(
    (product: RunwayProduct) => {
      if (loadingProductIds[product.id] || addedProductIds[product.id]) return;
      engageShopping();

      const chosenId =
        selectedVariants[product.id] ||
        (product.variants.length === 1 && product.variants[0].available
          ? product.variants[0].id
          : '');
      const variant = product.variants.find((v) => v.id === chosenId && v.available);

      if (!variant) {
        setRowErrors((prev) => ({
          ...prev,
          [product.id]: `Please select an available ${product.optionName.toLowerCase()}.`,
        }));
        return;
      }

      setLoadingProductIds((prev) => ({ ...prev, [product.id]: true }));
      window.setTimeout(() => {
        setBagEntries((prev) =>
          addEntriesToStylingBag(prev, [
            {
              variantId: variant.id,
              productId: product.id,
              quantity: 1,
              selectedOptions: { [variant.optionName]: variant.label },
            },
          ])
        );
        setLoadingProductIds((prev) => ({ ...prev, [product.id]: false }));
        setOpenPickerIds((prev) => ({ ...prev, [product.id]: false }));
        setMobileSheetProduct((curr) => (curr?.id === product.id ? null : curr));
        showToast('Piece saved to your styling bag.');
      }, 180);
    },
    [addedProductIds, engageShopping, loadingProductIds, selectedVariants, showToast]
  );

  // Complete-the-look: never guesses sizes; adds ready pieces and prompts for pending ones
  const handleAddFullLook = useCallback(() => {
    if (bundleLoading || bundleComplete) return;
    engageShopping();
    setBundleStatus(null);

    const remaining = activeLook.products.filter(
      (p) => p.available && !addedProductIds[p.id]
    );
    if (remaining.length === 0) return;

    const readyEntries: StylingBagEntry[] = [];
    const pendingProducts: RunwayProduct[] = [];

    for (const prod of remaining) {
      const explicitId = selectedVariants[prod.id];
      const directSingle =
        prod.variants.length === 1 && prod.variants[0].available ? prod.variants[0] : undefined;
      const chosen = prod.variants.find((v) => v.id === explicitId && v.available) ?? directSingle;

      if (chosen) {
        readyEntries.push({
          variantId: chosen.id,
          productId: prod.id,
          quantity: 1,
          selectedOptions: { [chosen.optionName]: chosen.label },
        });
      } else {
        pendingProducts.push(prod);
      }
    }

    if (readyEntries.length > 0) {
      setBundleLoading(true);
      window.setTimeout(() => {
        setBagEntries((prev) => addEntriesToStylingBag(prev, readyEntries));
        setBundleLoading(false);
        showToast(
          readyEntries.length > 1
            ? 'Look saved to your styling bag.'
            : 'Piece saved to your styling bag.'
        );
      }, 200);
    }

    if (pendingProducts.length > 0) {
      if (isMobile) {
        setMobileSheetProduct(pendingProducts[0]);
      } else {
        setOpenPickerIds((prev) => {
          const nextOpen = { ...prev };
          pendingProducts.forEach((p) => {
            nextOpen[p.id] = true;
          });
          return nextOpen;
        });
      }
      setScrollToProductId(pendingProducts[0].id);
      setBundleStatus(`Choose options for: ${pendingProducts.map((p) => p.name).join(', ')}`);
    }
  }, [
    activeLook.products,
    addedProductIds,
    bundleComplete,
    bundleLoading,
    engageShopping,
    isMobile,
    selectedVariants,
    showToast,
  ]);

  const handleClickPin = useCallback(
    (productId: string) => {
      engageShopping();
      setHotProductId(productId);
      setScrollToProductId(productId);
    },
    [engageShopping]
  );

  const handleOpenLightbox = useCallback(
    (triggerEl: HTMLElement | null) => {
      engageShopping();
      lightboxTriggerRef.current = triggerEl;
      setHotProductId(null);
      setLightboxOpen(true);
    },
    [engageShopping]
  );

  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
    window.setTimeout(() => lightboxTriggerRef.current?.focus(), 0);
  }, []);

  const bagCount = getStylingBagCount(bagEntries);

  return (
    <section
      ref={sectionRef}
      aria-label="LAGIISM Runway Editorial Lookbook"
      className="pt-14 min-h-screen bg-[#F4F3EF] text-[#111111] flex flex-col justify-between"
    >
      {/* Polite Live Region for Look Change Announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Editorial Runway Header */}
      <div className="max-w-[1440px] w-full mx-auto px-4 md:px-8 pt-6 pb-4 border-b border-[#111111] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E3E24]">
            LAGIISM / FIELD NOTES 001
          </p>
          <h1
            data-rw-title
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-[-0.03em] leading-[0.9] text-[#0E0E0E] mt-1.5"
          >
            Worn in motion.
          </h1>
          <p
            data-rw-subtitle
            className="text-xs sm:text-sm text-[#6E6D68] mt-2 max-w-[44ch]"
          >
            A study of movement, form, and everyday uniform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6E6D68]">
            RUNWAY — 2026
          </span>

          <button
            type="button"
            onClick={() => {
              engageShopping();
              setBagDrawerOpen(true);
            }}
            className="min-h-[42px] inline-flex items-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] hover:bg-[#9E3E24] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Styling bag ({bagCount})</span>
          </button>
        </div>
      </div>

      {/* Main Runway Spread: Stage + Look Product Panel */}
      <div className="max-w-[1440px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* Left/Center: Runway Stage + Navigation Controls */}
        <div
          data-rw-stage-wrap
          className="lg:col-span-8 flex flex-col justify-between bg-[#EAE8E1]/45"
        >
          <RunwayStage
            looks={looks}
            activeIndex={activeIndex}
            target={target}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            sweepKey={sweepKey}
            hotProductId={hotProductId}
            onMoveTo={moveTo}
            onNext={next}
            onPrev={prev}
            onGo={go}
            onDragStateChange={setIsDragging}
            onHoverPin={setHotProductId}
            onClickPin={handleClickPin}
            onOpenLightbox={handleOpenLightbox}
          />

          {/* Mobile Walk Progress Line (<=749px) */}
          {isMobile && (
            <div className="py-2.5 flex justify-center bg-[#F4F3EF] border-t border-[#D4D2CA]">
              <div className="w-[min(140px,38%)] h-[2px] bg-[#D4D2CA] overflow-hidden">
                <div
                  className="h-full bg-[#9E3E24] transition-transform duration-300 origin-left"
                  style={{
                    transform: `scaleX(${(activeIndex + 1) / Math.max(1, count)})`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation Controls & Progress Ticks (>=750px) */}
          {!isMobile && (
            <div
              data-rw-controls
              className="px-4 md:px-8 py-4 border-t border-[#111111] bg-[#F4F3EF] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous look"
                  className="w-10 h-10 border border-[#111111] bg-[#F4F3EF] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next look"
                  className="w-10 h-10 border border-[#111111] bg-[#F4F3EF] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  aria-pressed={isAutoplayRunning}
                  aria-label={isAutoplayRunning ? 'Pause runway autoplay' : 'Play runway autoplay'}
                  onClick={() => {
                    if (isAutoplayRunning) {
                      setAutoplayEnabled(false);
                    } else {
                      setUserEngaged(false);
                      setAutoplayEnabled(true);
                      setAutoplayResetKey((k) => k + 1);
                    }
                  }}
                  className="ml-1 h-10 px-3 border border-[#D4D2CA] hover:border-[#111111] bg-[#EAE8E1] font-mono text-[10px] font-bold uppercase tracking-[0.08em] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isAutoplayRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>PLAY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Look Ticks */}
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                {looks.map((look, idx) => {
                  const isCurrent = idx === activeIndex;
                  const isPast = idx < activeIndex;
                  return (
                    <button
                      key={look.id}
                      type="button"
                      aria-current={isCurrent ? 'step' : undefined}
                      aria-label={`Go to Look 0${look.number}: ${look.name}`}
                      onClick={() => go(idx)}
                      className="flex-1 py-3 cursor-pointer group"
                    >
                      <span className="block w-full h-[2px] bg-[#D4D2CA] overflow-hidden relative">
                        {isCurrent && isAutoplayRunning ? (
                          <span
                            key={`tick-${activeIndex}-${autoplayResetKey}`}
                            className="rw-tick-fill--playing block w-full h-full bg-[#9E3E24]"
                          />
                        ) : isCurrent ? (
                          <span className="block w-full h-full bg-[#9E3E24]" />
                        ) : isPast ? (
                          <span className="block w-full h-full bg-[#111111]/40" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <span className="font-mono-tabular text-xs font-bold uppercase text-[#111111]">
                0{activeLook.number} / 0{count}
              </span>
            </div>
          )}
        </div>

        {/* Right: Editorial Look Product Panel */}
        <div
          data-rw-panel-wrap
          onMouseEnter={() => setIsPanelHovered(true)}
          onMouseLeave={() => setIsPanelHovered(false)}
          className="lg:col-span-4 flex flex-col"
        >
          <LookPanel
            look={activeLook}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            hotProductId={hotProductId}
            openPickerIds={openPickerIds}
            selectedVariants={selectedVariants}
            addedProductIds={addedProductIds}
            loadingProductIds={loadingProductIds}
            rowErrors={rowErrors}
            bundleStatus={bundleStatus}
            bundleLoading={bundleLoading}
            bundleComplete={bundleComplete}
            onHoverRow={setHotProductId}
            onTogglePicker={handleTogglePicker}
            onSelectVariant={handleSelectVariant}
            onConfirmAdd={handleConfirmAdd}
            onAddFullLook={handleAddFullLook}
            onOpenProductDetail={(pid) => {
              engageShopping();
              onOpenProduct(pid);
            }}
            scrollToProductId={scrollToProductId}
            onScrollHandled={() => setScrollToProductId(null)}
          />
        </div>
      </div>

      {/* Mobile Size Sheet Portal (<=749px) */}
      <SizeSheet
        product={mobileSheetProduct}
        selectedVariantId={mobileSheetProduct ? selectedVariants[mobileSheetProduct.id] || '' : ''}
        loading={mobileSheetProduct ? !!loadingProductIds[mobileSheetProduct.id] : false}
        error={mobileSheetProduct ? rowErrors[mobileSheetProduct.id] : undefined}
        onSelectVariant={(vid) =>
          mobileSheetProduct && handleSelectVariant(mobileSheetProduct.id, vid)
        }
        onConfirm={() => mobileSheetProduct && handleConfirmAdd(mobileSheetProduct)}
        onClose={() => setMobileSheetProduct(null)}
      />

      {/* Full-Screen Look Lightbox */}
      <LookLightbox
        look={lightboxOpen ? activeLook : null}
        hotProductId={hotProductId}
        reducedMotion={reducedMotion}
        onHoverPin={setHotProductId}
        onClickPin={handleClickPin}
        onClose={handleCloseLightbox}
      />

      {/* Local Styling Bag Drawer */}
      <StylingBagDrawer
        isOpen={bagDrawerOpen}
        entries={bagEntries}
        onRemove={(vid) => setBagEntries((prev) => removeEntryFromStylingBag(prev, vid))}
        onOpenProduct={onOpenProduct}
        onClose={() => setBagDrawerOpen(false)}
      />

      {/* Restrained Bottom Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-5 py-3 font-mono text-xs uppercase tracking-[0.08em]"
        >
          {toastMessage}
        </div>
      )}
    </section>
  );
};
