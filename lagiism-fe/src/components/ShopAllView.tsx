import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PRODUCTS } from '../data/catalog';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { Product, ShopAllCategory, SizeOption } from '../types/store';
import { filterAndSortCatalog } from '../utils/storeLogic';
import { ProductCard } from './ProductCard';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ShopAllViewProps {
  products?: Product[];
  selectedCategory: ShopAllCategory;
  searchQuery: string;
  sortOrder: 'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC';
  onCategoryChange: (cat: ShopAllCategory) => void;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: 'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC') => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: SizeOption) => void;
}

const CATEGORIES: { id: ShopAllCategory; label: string }[] = [
  { id: 'ALL', label: 'ALL' },
  { id: 'TEES', label: 'TEES' },
  { id: 'DENIM', label: 'DENIM' },
  { id: 'OUTERWEAR', label: 'OUTERWEAR' },
  { id: 'ACCESSORIES', label: 'ACCESSORIES' },
];

export const ShopAllView: React.FC<ShopAllViewProps> = ({
  products = PRODUCTS,
  selectedCategory,
  searchQuery,
  sortOrder,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onSelectProduct,
  onQuickAdd,
}) => {
  const filtered = filterAndSortCatalog(products, {
    category: selectedCategory,
    query: searchQuery,
    sort: sortOrder,
  });

  const { visibleCount, hasMore, sentinelRef } = useInfiniteScroll({
    totalItems: filtered.length,
    batchSize: 4,
    resetKey: `${selectedCategory}|${searchQuery}|${sortOrder}`,
  });

  const visibleProducts = filtered.slice(0, visibleCount);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardTriggersRef = useRef<ScrollTrigger[]>([]);

  // 1. Editorial header entrance, layout observers, and prefers-reduced-motion cleanup (same as homepage)
  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

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
          gsap.fromTo(
            '[data-shop-header]',
            { y: 16, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.55,
              stagger: 0.08,
              ease: 'power2.out',
              clearProps: 'transform,opacity,visibility',
            }
          );

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

      const ro = new ResizeObserver(checkHeightAndRefresh);
      ro.observe(root);

      const onMediaLoad = (event: Event) => {
        if (event.target instanceof HTMLImageElement) {
          checkHeightAndRefresh();
        }
      };
      root.addEventListener('load', onMediaLoad, true);

      return () => {
        if (refreshTimer !== null) window.clearTimeout(refreshTimer);
        ro.disconnect();
        root.removeEventListener('load', onMediaLoad, true);
        mm.revert();
      };
    },
    { scope: sectionRef, revertOnUpdate: true }
  );

  // 2. Dynamically mounted product cards (infinite scroll + category/search/sort filter changes)
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    cardTriggersRef.current = cardTriggersRef.current.filter((st) => {
      if (!st.trigger || !st.trigger.isConnected) {
        st.kill();
        return false;
      }
      return true;
    });

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
  }, [selectedCategory, searchQuery, sortOrder, visibleProducts.length, products.length]);

  return (
    <section ref={sectionRef} className="pt-20 pb-20">
      {/* Page Title */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-4 pb-5">
        <p data-shop-header className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#555555]">
          ARCHIVE INDEX // {filtered.length} ITEMS
        </p>
        <h1 data-shop-header className="text-3xl md:text-5xl font-black uppercase tracking-[-0.03em] text-black mt-1">
          SHOP ALL — DROP 01
        </h1>
      </div>

      {/* Sticky Filter Bar — stays pinned beneath fixed header while scrolling */}
      <div className="sticky top-14 z-30 bg-[#F4F3EF]/95 backdrop-blur-sm border-y border-[#111111]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`min-h-[40px] font-mono text-[11px] font-bold uppercase px-3.5 py-2 border border-[#111111] cursor-pointer transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#0E0E0E] text-[#F4F3EF]'
                    : 'bg-[#F4F3EF] text-[#111111] hover:bg-[#EAE8E1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort, Inline Search & Clear */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Filter archive by keyword"
              placeholder="FILTER ARCHIVE..."
              className="min-h-[40px] border border-[#111111] bg-[#EAE8E1] px-3 py-2 font-mono text-xs uppercase text-[#111111] placeholder:text-[#6E6D68] w-44 sm:w-52"
            />
            <label htmlFor="archive-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="archive-sort"
              value={sortOrder}
              onChange={(e) =>
                onSortChange(
                  e.target.value as 'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC'
                )
              }
              className="min-h-[40px] border border-[#111111] bg-[#F4F3EF] px-3 py-2 font-mono text-xs font-bold uppercase text-[#111111] cursor-pointer"
            >
              <option value="FEATURED">SORT: FEATURED</option>
              <option value="PRICE_ASC">PRICE: LOW → HIGH</option>
              <option value="PRICE_DESC">PRICE: HIGH → LOW</option>
            </select>
            {(selectedCategory !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  onCategoryChange('ALL');
                  onSearchChange('');
                }}
                className="min-h-[40px] font-mono text-[11px] uppercase px-3 py-2 border border-[#D4D2CA] text-[#6E6D68] hover:border-[#111111] hover:text-[#111111] cursor-pointer"
              >
                RESET ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid with Infinite Scroll (No Pagination) */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {filtered.length === 0 ? (
          <div className="py-20 text-center border border-black mt-8 bg-[#F4F4F4]">
            <p className="font-mono text-sm uppercase font-bold text-black">
              NO GARMENTS MATCH CURRENT FILTER
            </p>
            <button
              type="button"
              onClick={() => {
                onCategoryChange('ALL');
                onSearchChange('');
              }}
              className="mt-4 bg-black text-white px-5 py-2.5 font-mono text-xs font-bold uppercase cursor-pointer"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {visibleProducts.map((product) => (
                <div key={product.id} data-reveal-card>
                  <ProductCard
                    product={product}
                    onSelectProduct={onSelectProduct}
                    onQuickAdd={onQuickAdd}
                  />
                </div>
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="mt-10 flex justify-center">
              {hasMore ? (
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#555555] py-3">
                  LOADING MORE GARMENTS ({visibleProducts.length} / {filtered.length})...
                </div>
              ) : (
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#767676] py-3 border-t border-[#E0E0E0] w-full text-center">
                  SHOWING ALL {filtered.length} ARCHIVE ITEMS
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
