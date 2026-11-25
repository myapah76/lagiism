import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CUSTOMIZE_ARTIFACTS, PRESET_SETS } from '../data/catalog';
import {
  CustomizeArtifact,
  Product,
  SetInclusionMode,
  SetViewMode,
  SizeOption,
} from '../types/store';
import {
  artifactToProduct,
  calculateSetTotal,
  deriveInclusionMode,
  formatVND,
  toggleArtifactBinding,
} from '../utils/storeLogic';
import { CustomizeLookCanvas } from './CustomizeLookCanvas';
import { Turntable3DCanvas } from './Turntable3DCanvas';

interface ShopTheSetProps {
  onAddSetToBag: (payload: {
    topProduct?: Product;
    bottomProduct?: Product;
    topSize: SizeOption;
    bottomSize: SizeOption;
    inclusionMode: SetInclusionMode;
    setCode?: string;
  }) => void;
  onSelectProduct: (product: Product) => void;
}

const SIZES: SizeOption[] = ['S', 'M', 'L', 'XL'];

const SET_PRESET_PAIRINGS: { topId: string; bottomId: string }[] = [
  { topId: 'cust-top-01', bottomId: 'cust-bot-01' }, // CRACK-INK TEE + HULL-SEAM INDIGO DENIM
  { topId: 'cust-top-02', bottomId: 'cust-bot-02' }, // HULL WORK JACKET + BLEACHED JEANS
  { topId: 'cust-top-03', bottomId: 'cust-bot-03' }, // RIGGING LONGSLEEVE + PATCHWORK PANT
];

export const ShopTheSet: React.FC<ShopTheSetProps> = ({
  onAddSetToBag,
  onSelectProduct,
}) => {
  const topProducts = CUSTOMIZE_ARTIFACTS.filter(
    (a) => a.category === 'top'
  ).map(artifactToProduct);
  const bottomProducts = CUSTOMIZE_ARTIFACTS.filter(
    (a) => a.category === 'bottom'
  ).map(artifactToProduct);

  const [presetIndex, setPresetIndex] = useState(0);
  const [viewMode, setViewMode] = useState<SetViewMode>('2D_STUDIO');

  const [activeTopId, setActiveTopId] = useState<string | null>(
    SET_PRESET_PAIRINGS[0].topId
  );
  const [activeBottomId, setActiveBottomId] = useState<string | null>(
    SET_PRESET_PAIRINGS[0].bottomId
  );
  const [lastTopId, setLastTopId] = useState<string>(
    SET_PRESET_PAIRINGS[0].topId
  );
  const [lastBottomId, setLastBottomId] = useState<string>(
    SET_PRESET_PAIRINGS[0].bottomId
  );

  const [topSize, setTopSize] = useState<SizeOption>('L');
  const [bottomSize, setBottomSize] = useState<SizeOption>('L');

  const activePreset = PRESET_SETS[presetIndex];
  const presetPair = SET_PRESET_PAIRINGS[presetIndex];

  const displayTop =
    topProducts.find((p) => p.id === (activeTopId ?? lastTopId)) ??
    topProducts[0];
  const displayBottom =
    bottomProducts.find((p) => p.id === (activeBottomId ?? lastBottomId)) ??
    bottomProducts[0];

  const inclusionMode = deriveInclusionMode(activeTopId, activeBottomId);

  const handleCyclePreset = (delta: number) => {
    const nextIdx =
      (presetIndex + delta + PRESET_SETS.length) % PRESET_SETS.length;
    const nextPair = SET_PRESET_PAIRINGS[nextIdx];
    setPresetIndex(nextIdx);
    setActiveTopId(nextPair.topId);
    setActiveBottomId(nextPair.bottomId);
    setLastTopId(nextPair.topId);
    setLastBottomId(nextPair.bottomId);
  };

  const handleInclusionModeClick = (mode: SetInclusionMode) => {
    if (mode === 'BOTH') {
      setActiveTopId(lastTopId);
      setActiveBottomId(lastBottomId);
    } else if (mode === 'TOP_ONLY') {
      setActiveTopId(lastTopId);
      setActiveBottomId(null);
    } else {
      setActiveTopId(null);
      setActiveBottomId(lastBottomId);
    }
  };

  const handleTopSelectChange = (newId: string) => {
    setLastTopId(newId);
    setActiveTopId(newId);
  };

  const handleBottomSelectChange = (newId: string) => {
    setLastBottomId(newId);
    setActiveBottomId(newId);
  };

  const handleToggleArtifact = (artifact: CustomizeArtifact) => {
    const next = toggleArtifactBinding(
      { activeTopId, activeBottomId },
      artifact
    );
    setActiveTopId(next.activeTopId);
    setActiveBottomId(next.activeBottomId);
    if (artifact.category === 'top' && next.activeTopId) {
      setLastTopId(next.activeTopId);
    }
    if (artifact.category === 'bottom' && next.activeBottomId) {
      setLastBottomId(next.activeBottomId);
    }
  };

  const liveTotal =
    inclusionMode === 'NONE'
      ? 0
      : calculateSetTotal({
          topProduct: activeTopId ? displayTop : undefined,
          bottomProduct: activeBottomId ? displayBottom : undefined,
          inclusionMode,
        });

  const isPresetMatch =
    inclusionMode === 'BOTH' &&
    activeTopId === presetPair.topId &&
    activeBottomId === presetPair.bottomId;

  const ctaLabel =
    inclusionMode === 'NONE'
      ? 'SELECT AT LEAST 1 GARMENT'
      : isPresetMatch
        ? 'ADD SET TO BAG'
        : 'ADD SELECTION TO BAG';

  return (
    <section
      id="shop-the-set"
      className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20 border-t border-black scroll-mt-14"
    >
      {/* Section Header with [ 2D STUDIO ] / [ 3D MODEL ] Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-black">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#555555]">
            MODULAR KIT BUILDER // DROP 01
          </p>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[-0.03em] text-black mt-1">
            SHOP THE SET
          </h2>
        </div>

        {/* [ 2D STUDIO ] / [ 3D MODEL ] Segmented Toggle */}
        <div
          role="group"
          aria-label="Set viewport mode"
          className="inline-flex border border-black self-start sm:self-auto"
        >
          <button
            type="button"
            onClick={() => setViewMode('2D_STUDIO')}
            aria-pressed={viewMode === '2D_STUDIO'}
            className={`font-mono text-[11px] font-bold px-3.5 py-2 uppercase tracking-[0.04em] cursor-pointer whitespace-nowrap transition-colors ${
              viewMode === '2D_STUDIO'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F4F4F4]'
            }`}
          >
            [ 2D STUDIO ]
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3D_MODEL')}
            aria-pressed={viewMode === '3D_MODEL'}
            className={`font-mono text-[11px] font-bold px-3.5 py-2 uppercase tracking-[0.04em] border-l border-black cursor-pointer whitespace-nowrap transition-colors ${
              viewMode === '3D_MODEL'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F4F4F4]'
            }`}
          >
            [ 3D MODEL ]
          </button>
        </div>
      </div>

      {/* Main Split Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-b border-black">
        {/* Left Viewport: 2D Studio or 3D Model Canvas */}
        <div className="lg:col-span-7 bg-[#F4F4F4] border-b lg:border-b-0 lg:border-r border-black flex flex-col">
          {viewMode === '2D_STUDIO' ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="px-4 py-3 border-b border-[#E0E0E0] bg-white flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-black">
                  {activePreset.code} // {activePreset.title}
                </span>
                <span className="font-mono text-[10px] uppercase text-[#555555]">
                  {inclusionMode === 'BOTH'
                    ? 'FULL 2-PIECE UNIFORM'
                    : inclusionMode === 'TOP_ONLY'
                      ? 'TOP LAYER ONLY'
                      : inclusionMode === 'BOTTOM_ONLY'
                        ? 'BOTTOM SILHOUETTE ONLY'
                        : 'NO ARTIFACT BOUND'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 divide-y sm:divide-y-0 sm:divide-x divide-[#E0E0E0]">
                {/* Top Preview Slot */}
                <div
                  className={`p-6 flex flex-col items-center justify-center transition-opacity ${
                    !activeTopId ? 'opacity-25 grayscale' : 'opacity-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectProduct(displayTop)}
                    className="w-full aspect-[3/4] max-w-[260px] bg-[#F4F4F4] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={displayTop.image}
                      alt={displayTop.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="mt-3 text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[-0.02em]">
                      {displayTop.name}
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#444444]">
                      {formatVND(displayTop.priceVnd)}
                    </div>
                  </div>
                </div>

                {/* Bottom Preview Slot */}
                <div
                  className={`p-6 flex flex-col items-center justify-center transition-opacity ${
                    !activeBottomId ? 'opacity-25 grayscale' : 'opacity-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectProduct(displayBottom)}
                    className="w-full aspect-[3/4] max-w-[260px] bg-[#F4F4F4] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={displayBottom.image}
                      alt={displayBottom.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="mt-3 text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[-0.02em]">
                      {displayBottom.name}
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#444444]">
                      {formatVND(displayBottom.priceVnd)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Turntable3DCanvas
              topProduct={activeTopId ? displayTop : undefined}
              bottomProduct={activeBottomId ? displayBottom : undefined}
              inclusionMode={inclusionMode}
            />
          )}
        </div>

        {/* Right Panel: Preset Switcher + Kit Specification */}
        <div className="lg:col-span-5 bg-white flex flex-col justify-between">
          <div>
            {/* Preset Switcher Row: SET 01 / 03 ← → */}
            <div className="px-5 py-4 border-b border-black flex items-center justify-between gap-4 bg-[#F4F4F4]">
              <div>
                <div
                  data-testid="preset-set-code"
                  className="font-mono-tabular text-xs font-bold uppercase text-black"
                >
                  {activePreset.code}
                </div>
                <div className="text-xs font-bold uppercase tracking-[-0.02em] mt-0.5">
                  {activePreset.title}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous preset set"
                  onClick={() => handleCyclePreset(-1)}
                  className="w-9 h-9 border border-black bg-white hover:bg-black hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Next preset set"
                  onClick={() => handleCyclePreset(1)}
                  className="w-9 h-9 border border-black bg-white hover:bg-black hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Kit Specification Panel */}
            <div className="p-5 space-y-5">
              {/* Inclusion Mode Selector (Top only, Bottom only, Both) */}
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#555555] mb-2">
                  KIT CONFIGURATION // FREEFORM MIX
                </div>
                <div className="grid grid-cols-3 border border-black">
                  {(
                    [
                      { id: 'BOTH', label: 'BOTH' },
                      { id: 'TOP_ONLY', label: 'TOP ONLY' },
                      { id: 'BOTTOM_ONLY', label: 'BOTTOM ONLY' },
                    ] as const
                  ).map((mode, idx) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleInclusionModeClick(mode.id)}
                      aria-pressed={inclusionMode === mode.id}
                      className={`py-2 px-2 font-mono text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                        idx > 0 ? 'border-l border-black' : ''
                      } ${
                        inclusionMode === mode.id
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-[#F4F4F4]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Garment Specification */}
              <div
                className={`border border-[#E0E0E0] p-3.5 transition-opacity ${
                  !activeTopId ? 'opacity-45' : 'opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#555555]">
                    01 // TOP LAYER {!activeTopId ? '(UNBOUND)' : ''}
                  </span>
                  <span className="font-mono-tabular text-xs font-bold text-black">
                    {activeTopId ? formatVND(displayTop.priceVnd) : '—'}
                  </span>
                </div>
                <label htmlFor="kit-top-select" className="sr-only">
                  Select Top Garment
                </label>
                <select
                  id="kit-top-select"
                  value={displayTop.id}
                  onChange={(e) => handleTopSelectChange(e.target.value)}
                  className="w-full border border-black bg-[#F4F4F4] px-2.5 py-2 text-xs font-bold uppercase tracking-[-0.01em] text-black cursor-pointer"
                >
                  {topProducts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {formatVND(item.priceVnd)}
                    </option>
                  ))}
                </select>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase text-[#555555]">
                    SIZE:
                  </span>
                  <div className="flex items-center gap-1">
                    {SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        disabled={!activeTopId}
                        onClick={() => setTopSize(sz)}
                        aria-label={`Select top size ${sz}`}
                        className={`font-mono text-[11px] font-bold w-8 h-7 border border-black cursor-pointer disabled:cursor-not-allowed ${
                          topSize === sz
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-[#F4F4F4]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Garment Specification */}
              <div
                className={`border border-[#E0E0E0] p-3.5 transition-opacity ${
                  !activeBottomId ? 'opacity-45' : 'opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#555555]">
                    02 // BOTTOM LAYER {!activeBottomId ? '(UNBOUND)' : ''}
                  </span>
                  <span className="font-mono-tabular text-xs font-bold text-black">
                    {activeBottomId ? formatVND(displayBottom.priceVnd) : '—'}
                  </span>
                </div>
                <label htmlFor="kit-bottom-select" className="sr-only">
                  Select Bottom Garment
                </label>
                <select
                  id="kit-bottom-select"
                  value={displayBottom.id}
                  onChange={(e) => handleBottomSelectChange(e.target.value)}
                  className="w-full border border-black bg-[#F4F4F4] px-2.5 py-2 text-xs font-bold uppercase tracking-[-0.01em] text-black cursor-pointer"
                >
                  {bottomProducts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {formatVND(item.priceVnd)}
                    </option>
                  ))}
                </select>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase text-[#555555]">
                    SIZE:
                  </span>
                  <div className="flex items-center gap-1">
                    {SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        disabled={!activeBottomId}
                        onClick={() => setBottomSize(sz)}
                        aria-label={`Select bottom size ${sz}`}
                        className={`font-mono text-[11px] font-bold w-8 h-7 border border-black cursor-pointer disabled:cursor-not-allowed ${
                          bottomSize === sz
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-[#F4F4F4]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live VND Total + Primary CTA */}
          <div className="border-t border-black p-5 bg-white">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[#555555]">
                SET TOTAL (VND)
              </span>
              <span
                data-testid="set-live-total"
                className="font-mono-tabular text-xl font-bold text-black"
              >
                {formatVND(liveTotal)}
              </span>
            </div>
            <button
              type="button"
              data-testid="add-set-button"
              disabled={inclusionMode === 'NONE'}
              onClick={() => {
                if (inclusionMode === 'NONE') return;
                onAddSetToBag({
                  topProduct: activeTopId ? displayTop : undefined,
                  bottomProduct: activeBottomId ? displayBottom : undefined,
                  topSize,
                  bottomSize,
                  inclusionMode,
                  setCode: activePreset.code,
                });
              }}
              className="w-full bg-black text-white border border-black py-3.5 px-4 text-xs font-bold uppercase tracking-[0.08em] hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMIZE LOOK // SELECT TOP, BOTTOM, OR BOTH */}
      <CustomizeLookCanvas
        activeTopId={activeTopId}
        activeBottomId={activeBottomId}
        onToggleArtifact={handleToggleArtifact}
      />
    </section>
  );
};
