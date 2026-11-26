import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { RunwayLook } from '../data/runwayLooks';

interface LookLightboxProps {
  look: RunwayLook | null;
  hotProductId: string | null;
  reducedMotion: boolean;
  onHoverPin: (productId: string | null) => void;
  onClickPin: (productId: string) => void;
  onClose: () => void;
}

export const LookLightbox: React.FC<LookLightboxProps> = ({
  look,
  hotProductId,
  reducedMotion,
  onHoverPin,
  onClickPin,
  onClose,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!look) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    if (!reducedMotion && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { scale: 0.92, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.32, ease: 'power3.out' }
      );
    }

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
  }, [look, reducedMotion, onClose]);

  if (!look || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Look 0${look.number}: ${look.name}`}
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 md:p-8"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0E0E0E]/82 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-3xl h-[82svh] max-h-[820px] bg-[#F4F3EF] border-2 border-[#111111] flex flex-col justify-between overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#111111] flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E3E24]">
              LOOK 0{look.number} // FULL STUDY
            </p>
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-[-0.03em] text-[#111111]">
              {look.name}
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close look view"
            className="w-11 h-11 inline-flex items-center justify-center border border-[#111111] bg-[#EAE8E1] text-[#111111] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Full Model Image + Synchronized Product Pins */}
        <div
          onClick={onClose}
          className="relative flex-1 flex items-center justify-center p-6 overflow-hidden bg-[#EAE8E1]/50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-full max-w-[440px] w-full flex items-center justify-center"
          >
            <img
              src={look.hero.image}
              alt={look.hero.alt}
              className="w-full h-full object-contain"
            />

            {look.products.map((prod, idx) => {
              const isHot = hotProductId === prod.id;
              return (
                <button
                  key={prod.id}
                  type="button"
                  aria-label={`Select ${prod.name}`}
                  onMouseEnter={() => onHoverPin(prod.id)}
                  onMouseLeave={() => onHoverPin(null)}
                  onClick={() => {
                    onClickPin(prod.id);
                    onClose();
                  }}
                  style={{ left: `${prod.pin.x}%`, top: `${prod.pin.y}%` }}
                  className="group/lpin absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center cursor-pointer"
                >
                  <span
                    className={`rw-pin-dot w-6 h-6 border border-[#111111] font-mono text-[10px] font-bold inline-flex items-center justify-center ${
                      isHot
                        ? 'bg-[#9E3E24] text-[#F4F3EF] border-[#9E3E24]'
                        : 'bg-[#F4F3EF] text-[#111111] group-hover/lpin:bg-[#0E0E0E] group-hover/lpin:text-[#F4F3EF]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap bg-[#0E0E0E] text-[#F4F3EF] px-2.5 py-1 font-mono text-[9px] uppercase">
                    {prod.pin.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#111111] bg-[#F4F3EF] flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[#6E6D68]">
          <span>Select a piece to explore it.</span>
          <span>ESC TO CLOSE</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
