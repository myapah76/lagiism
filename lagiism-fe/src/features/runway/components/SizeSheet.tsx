import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { RunwayProduct } from '../data/runwayLooks';
import { formatVND } from '../../../utils/storeLogic';

interface SizeSheetProps {
  product: RunwayProduct | null;
  selectedVariantId: string;
  loading: boolean;
  error?: string;
  onSelectVariant: (variantId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Mobile bottom size sheet (<=749px), rendered via React Portal under document.body
 * so ancestor transforms never trap fixed positioning.
 */
export const SizeSheet: React.FC<SizeSheetProps> = ({
  product,
  selectedVariantId,
  loading,
  error,
  onSelectVariant,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!product) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [product, onClose]);

  if (!product || typeof document === 'undefined') return null;

  const chosen = product.variants.find((v) => v.id === selectedVariantId && v.available);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Choose ${product.optionName} for ${product.name}`}
      className="fixed inset-0 z-[100] flex items-end justify-center"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0E0E0E]/70 backdrop-blur-xs"
      />

      <div className="relative z-10 w-full max-w-lg bg-[#F4F3EF] border-t-2 border-[#111111] p-5 max-h-[82svh] overflow-y-auto rw-safe-bottom">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#D4D2CA]">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-18 object-cover bg-[#EAE8E1] border border-[#D4D2CA] shrink-0"
            />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase text-[#6E6D68]">
                {product.category}
              </p>
              <h3 className="text-sm font-black uppercase tracking-[-0.02em] text-[#111111] truncate">
                {product.name}
              </h3>
              <p className="font-mono-tabular text-xs font-bold text-[#111111] mt-0.5">
                {formatVND(product.price)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close size sheet"
            className="w-11 h-11 inline-flex items-center justify-center border border-[#111111] bg-[#EAE8E1] text-[#111111] shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="py-5">
          <fieldset>
            <legend className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#6E6D68] mb-3">
              SELECT {product.optionName.toUpperCase()}
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {product.variants.map((variant) => {
                const selected = selectedVariantId === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!variant.available}
                    onClick={() => onSelectVariant(variant.id)}
                    className={`min-w-[52px] min-h-[44px] px-3.5 font-mono text-xs font-bold uppercase border cursor-pointer disabled:opacity-40 disabled:line-through ${
                      selected
                        ? 'bg-[#0E0E0E] text-[#F4F3EF] border-[#111111]'
                        : 'bg-[#F4F3EF] text-[#111111] border-[#D4D2CA]'
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="mt-3 font-mono text-[11px] text-[#9E3E24]">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!chosen || loading}
          aria-label={`Save ${product.name} to styling bag`}
          onClick={onConfirm}
          className="w-full min-h-[48px] bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] cursor-pointer disabled:opacity-40"
        >
          {loading ? 'SAVING...' : 'SAVE TO STYLING BAG'}
        </button>
      </div>
    </div>,
    document.body
  );
};
