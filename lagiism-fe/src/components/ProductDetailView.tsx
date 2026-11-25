import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Product, SizeOption } from '../types/store';
import { formatVND } from '../utils/storeLogic';
import { Turntable3DCanvas } from './Turntable3DCanvas';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onAddToBag: (product: Product, size: SizeOption) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
  onBack,
  onAddToBag,
  onSelectProduct,
}) => {
  const [selectedSize, setSelectedSize] = useState<SizeOption>('L');
  const [activeMediaIndex, setActiveMediaIndex] = useState<0 | 1>(0);
  const [inspectMode, setInspectMode] = useState<'2D' | '3D'>('2D');

  const images = [product.image, product.secondaryImage];

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 pt-20 pb-16">
      {/* Top Breadcrumb / Back Action */}
      <div className="flex items-center justify-between py-4 border-b border-black">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-black hover:underline cursor-pointer"
        >
          <ArrowLeft size={14} />
          BACK TO ARCHIVE
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#555555]">
          {product.category} // {product.specs.sku}
        </span>
      </div>

      {/* Split-Screen Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-b border-black">
        {/* Left: Sticky Studio Gallery */}
        <div className="lg:col-span-7 bg-[#F4F4F4] border-b lg:border-b-0 lg:border-r border-black flex flex-col">
          <div className="px-4 py-3 border-b border-[#E0E0E0] bg-white flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-black">
              STUDIO SPECIMEN // {product.specs.sku}
            </span>
            <div className="inline-flex border border-black">
              <button
                type="button"
                onClick={() => setInspectMode('2D')}
                className={`font-mono text-[10px] font-bold px-2.5 py-1 uppercase cursor-pointer ${
                  inspectMode === '2D'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                [ 2D STUDIO ]
              </button>
              <button
                type="button"
                onClick={() => setInspectMode('3D')}
                className={`font-mono text-[10px] font-bold px-2.5 py-1 uppercase border-l border-black cursor-pointer ${
                  inspectMode === '3D'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                [ 3D MODEL ]
              </button>
            </div>
          </div>

          {inspectMode === '2D' ? (
            <>
              <div className="aspect-[3/4] w-full bg-[#F4F4F4] overflow-hidden flex items-center justify-center">
                <img
                  src={images[activeMediaIndex]}
                  alt={`${product.name} view ${activeMediaIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full ${
                    activeMediaIndex === 0 ? 'object-contain' : 'object-cover'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 border-t border-[#E0E0E0] bg-white">
                {images.map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx as 0 | 1)}
                    className={`flex items-center gap-3 p-3 text-left cursor-pointer ${
                      idx === 1 ? 'border-l border-[#E0E0E0]' : ''
                    } ${
                      activeMediaIndex === idx
                        ? 'bg-[#F4F4F4] font-bold'
                        : 'bg-white hover:bg-[#F9F9F9]'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-cover bg-[#F4F4F4] border border-black shrink-0"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.04em]">
                      {idx === 0 ? '01 // STUDIO FLAT' : '02 // EDITORIAL FIT'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <Turntable3DCanvas
              topProduct={product.setSlot !== 'BOTTOM' ? product : undefined}
              bottomProduct={product.setSlot === 'BOTTOM' ? product : undefined}
              inclusionMode={
                product.setSlot === 'BOTTOM' ? 'BOTTOM_ONLY' : 'TOP_ONLY'
              }
            />
          )}
        </div>

        {/* Right: Contiguous Purchase Module + Garment Manifest */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[-0.03em] text-black">
              {product.name}
            </h1>
            <p className="font-mono text-xs uppercase text-[#555555] mt-1">
              {product.nameVi}
            </p>

            <div className="mt-5 pb-5 border-b border-[#E0E0E0] flex items-baseline justify-between">
              <span className="font-mono-tabular text-2xl font-bold text-black">
                {formatVND(product.priceVnd)}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#444444]">
                DROP 01 // READY TO SHIP
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-[#1A1C1C]">
              {product.description}
            </p>

            {/* Colorway */}
            <div className="mt-6">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#555555] mb-2">
                COLORWAY
              </div>
              <div className="inline-flex items-center gap-2.5 border border-black px-3 py-2 bg-[#F4F4F4]">
                <span
                  className="w-4 h-4 border border-black inline-block"
                  style={{ backgroundColor: product.colorHex }}
                />
                <span className="font-mono text-xs font-bold uppercase">
                  {product.colorName}
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#555555]">
                  SELECT SIZE
                </span>
                <span className="font-mono text-[10px] uppercase text-[#555555]">
                  {product.specs.fit}
                </span>
              </div>
              <div className="grid grid-cols-4 border border-black">
                {product.sizes.map((size, idx) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={`py-3 font-mono text-xs font-bold uppercase cursor-pointer transition-colors ${
                      idx > 0 ? 'border-l border-black' : ''
                    } ${
                      selectedSize === size
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-[#F4F4F4]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              data-testid="pdp-add-to-bag"
              onClick={() => onAddToBag(product, selectedSize)}
              className="mt-6 w-full bg-black text-white border border-black py-4 text-xs font-bold uppercase tracking-[0.08em] hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              ADD TO BAG — {formatVND(product.priceVnd)}
            </button>

            {/* Technical Garment Specification Table */}
            <div className="mt-8 border border-black">
              <div className="bg-black text-white px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.06em]">
                GARMENT TECHNICAL MANIFEST
              </div>
              <dl className="divide-y divide-[#E0E0E0] text-xs font-mono">
                <div className="grid grid-cols-2 px-3.5 py-2.5">
                  <dt className="text-[#555555] uppercase">SKU</dt>
                  <dd className="text-right font-bold text-black">
                    {product.specs.sku}
                  </dd>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2.5">
                  <dt className="text-[#555555] uppercase">WEIGHT / SPEC</dt>
                  <dd className="text-right font-bold text-black">
                    {product.specs.gsm}
                  </dd>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2.5">
                  <dt className="text-[#555555] uppercase">COMPOSITION</dt>
                  <dd className="text-right font-bold text-black">
                    {product.specs.fabric}
                  </dd>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2.5">
                  <dt className="text-[#555555] uppercase">ORIGIN</dt>
                  <dd className="text-right font-bold text-black">
                    {product.specs.origin}
                  </dd>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2.5">
                  <dt className="text-[#555555] uppercase">COORDINATES</dt>
                  <dd className="text-right font-bold text-black">
                    {product.specs.coordinates}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Related Archive Items */}
      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-black uppercase tracking-[-0.02em] pb-3 border-b border-black">
            PAIR WITH // DROP 01 ARCHIVE
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {relatedProducts.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectProduct(item)}
                className="border border-[#E0E0E0] hover:border-black bg-white text-left cursor-pointer transition-colors"
              >
                <div className="aspect-[3/4] bg-[#F4F4F4] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 border-t border-[#E0E0E0] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[-0.02em] truncate">
                    {item.name}
                  </span>
                  <span className="font-mono-tabular text-[11px] font-bold shrink-0">
                    {formatVND(item.priceVnd)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
