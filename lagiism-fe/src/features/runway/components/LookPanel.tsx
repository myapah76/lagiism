import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Check, Loader2, Plus } from 'lucide-react';
import { RunwayLook, RunwayProduct } from '../data/runwayLooks';
import { formatVND } from '../../../utils/storeLogic';

interface LookPanelProps {
  look: RunwayLook;
  isMobile: boolean;
  reducedMotion: boolean;
  hotProductId: string | null;
  openPickerIds: Record<string, boolean>;
  selectedVariants: Record<string, string>;
  addedProductIds: Record<string, boolean>;
  loadingProductIds: Record<string, boolean>;
  rowErrors: Record<string, string>;
  bundleStatus: string | null;
  bundleLoading: boolean;
  bundleComplete: boolean;
  onHoverRow: (productId: string | null) => void;
  onTogglePicker: (product: RunwayProduct) => void;
  onSelectVariant: (productId: string, variantId: string) => void;
  onConfirmAdd: (product: RunwayProduct) => void;
  onAddFullLook: () => void;
  onOpenProductDetail: (productId: string) => void;
  scrollToProductId: string | null;
  onScrollHandled: () => void;
}

export const LookPanel: React.FC<LookPanelProps> = ({
  look,
  isMobile,
  reducedMotion,
  hotProductId,
  openPickerIds,
  selectedVariants,
  addedProductIds,
  loadingProductIds,
  rowErrors,
  bundleStatus,
  bundleLoading,
  bundleComplete,
  onHoverRow,
  onTogglePicker,
  onSelectVariant,
  onConfirmAdd,
  onAddFullLook,
  onOpenProductDetail,
  scrollToProductId,
  onScrollHandled,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLElement | null>>({});

  // Restrained staggered GSAP entrance when active look changes (desktop only, skipped under reduced motion)
  useEffect(() => {
    if (reducedMotion || isMobile || !listRef.current) return;
    const rows = listRef.current.querySelectorAll('[data-rw-row]');
    if (!rows.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.085,
          ease: 'power2.out',
          clearProps: 'transform,opacity,visibility',
        }
      );
    }, listRef);
    return () => ctx.revert();
  }, [look.id, reducedMotion, isMobile]);

  // Scroll specific product row into view when pin clicked or pending picker opened
  useEffect(() => {
    if (!scrollToProductId) return;
    const el = rowRefs.current[scrollToProductId];
    if (el) {
      el.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    onScrollHandled();
  }, [scrollToProductId, reducedMotion, onScrollHandled]);

  const availableTotal = look.products
    .filter((p) => p.available)
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <aside
      aria-label="In this look product panel"
      className="bg-[#F4F3EF] border-t lg:border-t-0 lg:border-l border-[#111111] flex flex-col justify-between rw-safe-bottom"
    >
      <div>
        {/* Panel Header */}
        <div className="px-4 md:px-6 py-4 border-b border-[#D4D2CA] flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E3E24]">
              IN THIS LOOK // 0{look.number}
            </p>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-[-0.03em] text-[#111111] mt-0.5">
              {look.name}
            </h2>
          </div>
          <span className="font-mono-tabular text-[11px] uppercase text-[#6E6D68] shrink-0">
            {look.products.length} {look.products.length === 1 ? 'PIECE' : 'PIECES'}
          </span>
        </div>

        {/* Product List (Vertical on Desktop, Horizontal Snap Carousel on Mobile) */}
        <div
          ref={listRef}
          className={
            isMobile
              ? 'rw-mobile-carousel gap-3 px-4 py-3.5'
              : 'divide-y divide-[#D4D2CA] max-h-[46svh] overflow-y-auto'
          }
        >
          {look.products.map((prod) => {
            const isHot = hotProductId === prod.id;
            const isOpen = !!openPickerIds[prod.id];
            const isAdded = !!addedProductIds[prod.id];
            const isLoading = !!loadingProductIds[prod.id];
            const chosenVarId = selectedVariants[prod.id] || '';
            const chosenVar = prod.variants.find((v) => v.id === chosenVarId && v.available);
            const pickerId = `rw-picker-${look.id}-${prod.id}`;
            const err = rowErrors[prod.id];

            return (
              <article
                key={prod.id}
                ref={(el) => {
                  rowRefs.current[prod.id] = el;
                }}
                data-rw-row
                onMouseEnter={() => onHoverRow(prod.id)}
                onMouseLeave={() => onHoverRow(null)}
                className={`transition-colors ${
                  isMobile
                    ? 'w-[248px] border border-[#D4D2CA] bg-[#EAE8E1]/50 p-3'
                    : 'px-4 md:px-6 py-4'
                } ${isHot ? 'bg-[#EAE8E1]' : ''}`}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => onOpenProductDetail(prod.id)}
                    aria-label={`View ${prod.name} product page`}
                    className="w-16 h-20 bg-[#EAE8E1] border border-[#D4D2CA] overflow-hidden shrink-0 cursor-pointer"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#6E6D68]">
                        {prod.category}
                      </span>
                      {prod.badge && (
                        <span className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 bg-[#EAE8E1] border border-[#D4D2CA] text-[#111111]">
                          {prod.badge}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenProductDetail(prod.id)}
                      className="mt-1 inline-flex items-center gap-1 text-left text-xs font-black uppercase tracking-[-0.02em] text-[#111111] hover:text-[#9E3E24] max-w-full cursor-pointer"
                    >
                      <span className="truncate">{prod.name}</span>
                      <ArrowUpRight className="w-3 h-3 shrink-0 opacity-60" aria-hidden="true" />
                    </button>

                    <div className="font-mono-tabular text-xs font-bold text-[#111111] mt-1">
                      {formatVND(prod.price)}
                    </div>
                  </div>

                  {/* Plus / Added Trigger Button */}
                  <button
                    type="button"
                    disabled={!prod.available || isAdded || isLoading}
                    aria-expanded={!isMobile && isOpen}
                    aria-controls={!isMobile ? pickerId : undefined}
                    aria-label={
                      isAdded
                        ? `${prod.name} saved to styling bag`
                        : `Choose ${prod.optionName} for ${prod.name}`
                    }
                    onClick={() => onTogglePicker(prod)}
                    className={`w-10 h-10 shrink-0 border inline-flex items-center justify-center cursor-pointer transition-colors disabled:cursor-not-allowed ${
                      isAdded
                        ? 'bg-[#9E3E24] border-[#9E3E24] text-[#F4F3EF]'
                        : isOpen
                          ? 'bg-[#0E0E0E] border-[#111111] text-[#F4F3EF]'
                          : 'bg-[#F4F3EF] border-[#111111] text-[#111111] hover:bg-[#0E0E0E] hover:text-[#F4F3EF]'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : isAdded ? (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Plus
                        className={`w-4 h-4 transition-transform duration-200 ${
                          !isMobile && isOpen ? 'rotate-45' : ''
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>

                {/* Desktop Inline Option Picker (>=750px) */}
                {!isMobile && isOpen && !isAdded && (
                  <div
                    id={pickerId}
                    className="mt-3.5 pt-3 border-t border-[#D4D2CA]"
                  >
                    <fieldset>
                      <legend className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#6E6D68] mb-2">
                        SELECT {prod.optionName.toUpperCase()}
                      </legend>
                      <div className="flex flex-wrap gap-1.5" role="radiogroup">
                        {prod.variants.map((variant) => {
                          const selected = chosenVarId === variant.id;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              disabled={!variant.available}
                              onClick={() => onSelectVariant(prod.id, variant.id)}
                              className={`min-w-[40px] min-h-[36px] px-2.5 font-mono text-[11px] font-bold uppercase border transition-colors cursor-pointer disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed ${
                                selected
                                  ? 'bg-[#0E0E0E] text-[#F4F3EF] border-[#111111]'
                                  : 'bg-transparent text-[#111111] border-[#D4D2CA] hover:border-[#111111]'
                              }`}
                            >
                              {variant.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    {err && (
                      <p role="alert" className="font-mono text-[10px] text-[#9E3E24] mt-2">
                        {err}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={!chosenVar || isLoading}
                      aria-label={`Save ${prod.name} to styling bag`}
                      onClick={() => onConfirmAdd(prod)}
                      className="mt-3 w-full min-h-[40px] bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] font-mono text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'SAVING...' : 'SAVE TO STYLING BAG'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Editorial Bundle Footer — Complete the Look */}
      <div className="px-4 md:px-6 py-4 border-t border-[#111111] bg-[#EAE8E1]">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[-0.02em] text-[#111111]">
              Complete the look
            </p>
            <p className="hidden sm:block font-mono text-[10px] text-[#6E6D68] mt-0.5">
              All the pieces, one uniform.
            </p>
          </div>
          {availableTotal > 0 && (
            <span className="font-mono-tabular text-sm font-bold text-[#111111]">
              {formatVND(availableTotal)}
            </span>
          )}
        </div>

        {bundleStatus && (
          <p
            role="status"
            className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.04em] text-[#9E3E24]"
          >
            {bundleStatus}
          </p>
        )}

        <button
          type="button"
          disabled={bundleLoading || bundleComplete}
          onClick={onAddFullLook}
          className={`w-full min-h-[46px] border border-[#111111] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors cursor-pointer disabled:cursor-not-allowed ${
            bundleComplete
              ? 'bg-[#9E3E24] text-[#F4F3EF] border-[#9E3E24]'
              : 'bg-[#0E0E0E] text-[#F4F3EF] hover:bg-[#9E3E24]'
          }`}
        >
          {bundleLoading
            ? 'SAVING LOOK...'
            : bundleComplete
              ? 'Look saved to your bag'
              : 'Add full look to bag'}
        </button>
      </div>
    </aside>
  );
};
