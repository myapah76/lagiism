import React, { useState } from 'react';
import { CUSTOMIZE_ARTIFACTS } from '../data/catalog';
import { CustomizeArtifact } from '../types/store';
import { formatVND } from '../utils/storeLogic';

interface CustomizeLookCanvasProps {
  activeTopId: string | null;
  activeBottomId: string | null;
  onToggleArtifact: (artifact: CustomizeArtifact) => void;
}

export const CustomizeLookCanvas: React.FC<CustomizeLookCanvasProps> = ({
  activeTopId,
  activeBottomId,
  onToggleArtifact,
}) => {
  const [coords, setCoords] = useState<{ x: string; y: string }>({
    x: '00',
    y: '00',
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.max(
      0,
      Math.min(99, Math.round(((e.clientX - rect.left) / rect.width) * 99))
    );
    const yPct = Math.max(
      0,
      Math.min(99, Math.round(((e.clientY - rect.top) / rect.height) * 99))
    );
    setCoords({
      x: String(xPct).padStart(2, '0'),
      y: String(yPct).padStart(2, '0'),
    });
  };

  const handleMouseLeave = () => {
    setCoords({ x: '00', y: '00' });
  };

  return (
    <div
      data-testid="customize-look-section"
      className="mt-14 pt-10 border-t border-[#111111]"
    >
      {/* Section Top Header Bar */}
      <div
        data-studio-reveal
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5"
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="w-2 h-2 bg-[#9E3E24] inline-block shrink-0"
          />
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#111111]">
            CUSTOMIZE LOOK // SELECT TOP, BOTTOM, OR BOTH
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 font-mono text-[10px] uppercase tracking-[0.06em]">
          <span className="font-mono-tabular text-[#6E6D68]">
            [ X: {coords.x} // Y: {coords.y} ]
          </span>
          <span className="text-[#6E6D68]">
            CANVAS // FREEFORM RIGGING ENGINE
          </span>
          <span className="border border-[#111111] bg-[#EAE8E1] px-2.5 py-1 font-bold text-[#111111] whitespace-nowrap">
            {CUSTOMIZE_ARTIFACTS.length} ARTIFACTS LOADED
          </span>
        </div>
      </div>

      {/* Editorial Drafting-Grid Interactive Studio Canvas */}
      <div
        data-studio-reveal
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-testid="customize-look-grid"
        className="border border-[#111111] p-5 sm:p-8 lg:p-10 bg-[#EAE8E1]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(17,17,17,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,17,17,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 items-start">
          {CUSTOMIZE_ARTIFACTS.map((artifact) => {
            const isSelected =
              artifact.category === 'top'
                ? activeTopId === artifact.id
                : activeBottomId === artifact.id;

            const tag = artifact.cornerTag;

            return (
              <button
                key={artifact.id}
                type="button"
                data-testid={`customize-card-${artifact.id}`}
                aria-pressed={isSelected}
                onClick={() => onToggleArtifact(artifact)}
                style={{ transform: `rotate(${artifact.tiltDeg}deg)` }}
                className={`group relative w-full bg-[#F4F3EF] p-3.5 text-left cursor-pointer transition-transform duration-150 hover:rotate-0 ${
                  isSelected
                    ? 'border-2 border-[#111111]'
                    : 'border border-[#D4D2CA] hover:border-[#111111]'
                }`}
              >
                {/* Optional Corner Spec Tag (Strict LAGIISM Palette) */}
                {tag && (
                  <span
                    className={`absolute z-10 font-mono text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 leading-none ${
                      tag.position === 'top-left'
                        ? '-top-2 left-2.5'
                        : tag.position === 'top-right'
                          ? '-top-5 right-2'
                          : '-bottom-2 right-2.5'
                    } ${
                      tag.variant === 'acid'
                        ? 'bg-[#9E3E24] text-[#F4F3EF] border border-[#111111]'
                        : tag.variant === 'dark'
                          ? 'bg-[#1D2B44] text-[#F4F3EF] border border-[#111111]'
                          : 'bg-[#EAE8E1] text-[#6E6D68] border border-[#D4D2CA]'
                    }`}
                  >
                    {tag.label}
                  </span>
                )}

                {/* Solid Asphalt ACTIVE / SELECTED Badge */}
                {isSelected && (
                  <span className="absolute top-2 right-2 z-10 bg-[#0E0E0E] text-[#F4F3EF] font-mono text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-1 leading-none">
                    ACTIVE / SELECTED
                  </span>
                )}

                {/* Studio Garment Frame */}
                <div className="w-full aspect-[4/3] bg-[#EAE8E1] flex items-center justify-center overflow-hidden p-3">
                  <img
                    src={artifact.image}
                    alt={artifact.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Metadata Footer */}
                <div className="pt-3 pb-1">
                  <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#6E6D68]">
                    {artifact.subLabel}
                  </div>
                  <div className="text-xs font-black uppercase tracking-[-0.02em] text-[#111111] mt-0.5 truncate">
                    {artifact.name}
                  </div>
                  <div className="font-mono-tabular text-[11px] font-bold text-[#111111] mt-1">
                    {formatVND(artifact.priceVnd)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Technical Metadata Bar */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.06em] text-[#6E6D68]">
        <span>[ LAT: 10.681° N // LONG: 107.771° E — LA GI HARBOR ]</span>
        <span>TAP CARD TO BIND / UNBIND FROM STUDIO VIEWPORT</span>
      </div>
    </div>
  );
};
