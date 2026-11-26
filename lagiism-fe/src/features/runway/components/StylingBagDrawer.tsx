import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Download, Trash2, X } from 'lucide-react';
import { findRunwayProductById } from '../data/runwayLooks';
import {
  StylingBagEntry,
  exportStylingShortlist,
} from '../utils/stylingBag';
import { formatVND } from '../../../utils/storeLogic';

interface StylingBagDrawerProps {
  isOpen: boolean;
  entries: StylingBagEntry[];
  onRemove: (variantId: string) => void;
  onOpenProduct: (productId: string) => void;
  onClose: () => void;
}

export const StylingBagDrawer: React.FC<StylingBagDrawerProps> = ({
  isOpen,
  entries,
  onRemove,
  onOpenProduct,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const estimatedTotal = entries.reduce((sum, entry) => {
    const prod = findRunwayProductById(entry.productId);
    return sum + (prod ? prod.price * entry.quantity : 0);
  }, 0);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your styling bag"
      className="fixed inset-0 z-[105] flex justify-end"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0E0E0E]/70 backdrop-blur-xs"
      />

      <div className="relative z-10 w-full max-w-md h-full bg-[#F4F3EF] border-l-2 border-[#111111] flex flex-col justify-between">
        <div className="px-5 py-4 border-b border-[#111111] flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E3E24]">
              STYLING BAG // LOCAL SHORTLIST
            </p>
            <h2 className="text-lg font-black uppercase tracking-[-0.03em] text-[#111111]">
              Your styling bag
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close styling bag"
            className="w-11 h-11 inline-flex items-center justify-center border border-[#111111] bg-[#EAE8E1] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-3 bg-[#EAE8E1] border-b border-[#D4D2CA] font-mono text-[10px] text-[#6E6D68]">
          A shortlist of pieces you&apos;re considering. No order or payment has been placed.
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#D4D2CA]">
          {entries.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-[#6E6D68] leading-relaxed">
                Your styling bag is empty. Explore the runway and save a few pieces.
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const prod = findRunwayProductById(entry.productId);
              const optText = Object.entries(entry.selectedOptions)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' / ');

              return (
                <div key={entry.variantId} className="p-4 flex items-center gap-3.5">
                  {prod?.image && (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-18 object-cover bg-[#EAE8E1] border border-[#D4D2CA] shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenProduct(entry.productId);
                      }}
                      className="inline-flex items-center gap-1 text-left text-xs font-black uppercase tracking-[-0.02em] text-[#111111] hover:text-[#9E3E24] max-w-full cursor-pointer"
                    >
                      <span className="truncate">{prod?.name ?? entry.productId}</span>
                      <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                    </button>
                    {optText && (
                      <p className="font-mono text-[10px] uppercase text-[#6E6D68] mt-0.5">
                        {optText} • QTY {entry.quantity}
                      </p>
                    )}
                    {prod && (
                      <p className="font-mono-tabular text-xs font-bold text-[#111111] mt-1">
                        {formatVND(prod.price * entry.quantity)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(entry.variantId)}
                    aria-label={`Remove ${prod?.name ?? entry.productId} from styling bag`}
                    className="w-10 h-10 inline-flex items-center justify-center border border-[#D4D2CA] hover:border-[#9E3E24] hover:text-[#9E3E24] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 border-t border-[#111111] bg-[#EAE8E1] space-y-3 rw-safe-bottom">
          {entries.length > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] font-bold uppercase text-[#6E6D68]">
                SHORTLIST ESTIMATE
              </span>
              <span className="font-mono-tabular text-lg font-bold text-[#111111]">
                {formatVND(estimatedTotal)}
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={entries.length === 0}
            onClick={() => exportStylingShortlist(entries)}
            className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download styling shortlist
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
