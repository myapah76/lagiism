import React from 'react';
import { PRODUCTS } from '../data/catalog';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { Product, ShopAllCategory, SizeOption } from '../types/store';
import { filterAndSortCatalog } from '../utils/storeLogic';
import { ProductCard } from './ProductCard';

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

  return (
    <section className="pt-20 pb-20">
      {/* Page Title */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-4 pb-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#555555]">
          ARCHIVE INDEX // {filtered.length} ITEMS
        </p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[-0.03em] text-black mt-1">
          SHOP ALL — DROP 01
        </h1>
      </div>

      {/* Sticky Filter Bar — stays pinned beneath fixed header while scrolling */}
      <div className="sticky top-13 z-30 bg-white/95 backdrop-blur-sm border-y border-black">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`font-mono text-[11px] font-bold uppercase px-3.5 py-2 border border-black cursor-pointer transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-[#F4F4F4]'
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
              className="border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs uppercase text-black placeholder:text-[#767676] w-44 sm:w-52"
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
              className="border border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-black cursor-pointer"
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
                className="font-mono text-[11px] uppercase px-3 py-2 border border-[#E0E0E0] text-[#555555] hover:border-black hover:text-black cursor-pointer"
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
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onQuickAdd={onQuickAdd}
                />
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
