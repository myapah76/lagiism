import React, { useState } from 'react';
import { Product, SizeOption } from '../types/store';
import { formatVND } from '../utils/storeLogic';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: SizeOption) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="group bg-[#F4F3EF] border border-[#D4D2CA] hover:border-[#111111] transition-colors duration-150 flex flex-col"
    >
      {/* Clean Studio Image Container (#EAE8E1 surface, zero badges) */}
      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        aria-label={`View details for ${product.name}`}
        className="relative w-full aspect-[3/4] bg-[#EAE8E1] overflow-hidden cursor-pointer block text-left"
      >
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-center">
            <span className="font-mono text-xs uppercase text-[#6E6D68]">
              {product.name}
            </span>
          </div>
        )}
      </button>

      {/* Strict 2-State Hover Swap Bottom Row */}
      <div className="relative h-14 border-t border-[#D4D2CA] group-hover:border-[#111111] bg-[#F4F3EF] px-3.5 overflow-hidden">
        {/* Default State: ONLY UPPERCASE Product Name (left) + VND Price (right) */}
        <div className="h-full flex items-center justify-between gap-3 transition-all duration-150 group-hover:opacity-0 group-hover:-translate-y-2 group-focus-within:opacity-0 group-focus-within:-translate-y-2">
          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="text-left text-[12px] font-bold uppercase tracking-[-0.02em] text-[#111111] truncate cursor-pointer"
          >
            {product.name}
          </button>
          <span className="font-mono-tabular text-[12px] font-bold text-[#111111] whitespace-nowrap shrink-0">
            {formatVND(product.priceVnd)}
          </span>
        </div>

        {/* Hover State: Swaps smoothly into Sizes (S M L XL) + Colorway Swatch */}
        <div
          className="absolute inset-0 px-3.5 flex items-center justify-between gap-2 opacity-0 translate-y-2 pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto bg-[#F4F3EF]"
          aria-label={`Quick size selection for ${product.name}`}
        >
          <div className="flex items-center gap-1">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(product, size);
                }}
                aria-label={`Add ${product.name} size ${size} to bag`}
                className="font-mono text-[11px] font-bold px-2 py-1 text-[#111111] border border-transparent hover:border-[#111111] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] transition-colors cursor-pointer"
              >
                {size}
              </button>
            ))}
          </div>

          <div
            className="flex items-center gap-1.5 shrink-0"
            title={product.colorName}
          >
            <span
              className="w-3.5 h-3.5 border border-[#111111] inline-block"
              style={{ backgroundColor: product.colorHex }}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-[#6E6D68] hidden xl:inline">
              {product.colorName.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
