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
      className="mt-10 pt-8 border-t border-[#E0E0E0]"
    >
      {/* Section Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="w-2 h-2 bg-black inline-block shrink-0"
          />
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-black">
            CUSTOMIZE LOOK // SELECT TOP, BOTTOM, OR BOTH
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 font-mono text-[10px] uppercase tracking-[0.05em]">
          <span className="font-mono-tabular text-[#555555]">
            [ X: {coords.x} // Y: {coords.y} ]
          </span>
          <span className="text-[#555555]">
            CANVAS // FREEFORM RIGGING ENGINE
          </span>
          <span className="border border-black bg-[#F4F4F4] px-2.5 py-1 font-bold text-black whitespace-nowrap">
            {CUSTOMIZE_ARTIFACTS.length} ARTIFACTS LOADED
          </span>
        </div>
      </div>

      {/* Drafting-Grid Interactive Canvas */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-testid="customize-look-grid"
        className="border border-[#E0E0E0] p-5 sm:p-8 lg:p-10 bg-[#FAFAFA]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #EBEBEB 1px, transparent 1px), linear-gradient(to bottom, #EBEBEB 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
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
                className={`group relative w-full bg-white p-3.5 text-left cursor-pointer transition-transform duration-150 hover:rotate-0 focus-visible:outline-2 focus-visible:outline-black ${
                  isSelected
                    ? 'border-2 border-black'
                    : 'border border-[#E0E0E0] hover:border-black'
                }`}
              >
                {/* Optional Corner Spec Tag */}
                {tag && (
                  <span
                    className={`absolute z-10 font-mono text-[9px] font-bold uppercase tracking-[0.05em] px-1.5 py-0.5 leading-none ${
                      tag.position === 'top-left'
                        ? '-top-2 left-2.5'
                        : tag.position === 'top-right'
                          ? '-top-5 right-2'
                          : '-bottom-2 right-2.5'
                    } ${
                      tag.variant === 'acid'
                        ? 'bg-[#E6F800] text-black border border-black'
                        : tag.variant === 'dark'
                          ? 'bg-black text-white border border-black'
                          : 'bg-[#F4F4F4] text-[#555555] border border-[#CCCCCC]'
                    }`}
                  >
                    {tag.label}
                  </span>
                )}

                {/* Solid Black ACTIVE SELECTED Badge in Top-Right */}
                {isSelected && (
                  <span className="absolute top-2 right-2 z-10 bg-black text-white font-mono text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-1 leading-none">
                    ACTIVE SELECTED
                  </span>
                )}

                {/* Polaroid Studio Frame */}
                <div className="w-full aspect-[4/3] bg-[#F4F4F4] flex items-center justify-center overflow-hidden p-3">
                  <img
                    src={artifact.image}
                    alt={artifact.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Metadata Footer */}
                <div className="pt-3 pb-1">
                  <div className="font-mono text-[9px] uppercase tracking-[0.05em] text-[#666666]">
                    {artifact.subLabel}
                  </div>
                  <div className="text-xs font-black uppercase tracking-[-0.02em] text-black mt-0.5 truncate">
                    {artifact.name}
                  </div>
                  <div className="font-mono-tabular text-[11px] font-bold text-black mt-1">
                    {formatVND(artifact.priceVnd)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Canvas Footer Bar */}
      <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.05em] text-[#555555]">
        <span>[ LAT: 10.681° N // LONG: 107.771° E — LA GI HARBOR ]</span>
        <span>TAP CARD TO BIND / UNBIND FROM 3D TURNTABLE VIEWPORT</span>
      </div>
    </div>
  );
};
