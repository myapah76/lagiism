import React from 'react';
import { ProductCard } from '../../../components/ProductCard';
import { DropFilterCategory, Product, SizeOption } from '../../../types/store';

interface HomeDropCollectionProps {
  dropLabel: string;
  coordinates: string;
  tabs: { id: DropFilterCategory; label: string }[];
  activeCategory: DropFilterCategory;
  visibleProducts: Product[];
  totalCount: number;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  onCategoryChange: (cat: DropFilterCategory) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: SizeOption) => void;
}

export const HomeDropCollection: React.FC<HomeDropCollectionProps> = ({
  dropLabel,
  coordinates,
  tabs,
  activeCategory,
  visibleProducts,
  totalCount,
  hasMore,
  sentinelRef,
  onCategoryChange,
  onSelectProduct,
  onQuickAdd,
}) => {
  return (
    <section
      id="drop-collection"
      data-home-section="collection"
      className="py-16 md:py-24 scroll-mt-14 bg-[#F4F3EF]"
    >
      {/* Sticky Editorial Category Header */}
      <div className="sticky top-14 z-30 bg-[#F4F3EF]/94 backdrop-blur-md border-y border-[#111111]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6E6D68]">
              NEW ARRIVALS // {coordinates}
            </p>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[-0.035em] text-[#111111] mt-1 leading-none">
              {dropLabel}
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Drop 01 category filters"
            className="flex flex-wrap items-center gap-1.5"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`min-h-[40px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] px-4 py-2 border border-[#111111] cursor-pointer transition-colors whitespace-nowrap ${
                  activeCategory === tab.id
                    ? 'bg-[#0E0E0E] text-[#F4F3EF]'
                    : 'bg-[#F4F3EF] text-[#111111] hover:bg-[#EAE8E1]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial Product Discovery Grid */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8 mt-10">
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

        {/* Genuine Progressive Loading Sentinel */}
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          {hasMore && (
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6E6D68] border border-[#D4D2CA] bg-[#EAE8E1]/60 px-4 py-2">
              SCROLLING TO LOAD MORE ({visibleProducts.length} / {totalCount})...
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
