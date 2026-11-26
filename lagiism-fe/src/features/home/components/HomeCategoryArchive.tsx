import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CategoryStripItem, ProductCategory } from '../../../types/store';

interface HomeCategoryArchiveProps {
  categories: CategoryStripItem[];
  onSelectCategory: (category: ProductCategory) => void;
  onViewFullArchive: () => void;
}

/**
 * SECTION 04 — ARCHIVE BY CATEGORY
 * Uses varied asymmetric editorial proportions (7/5 + 5/7) instead of 4 identical cards.
 */
export const HomeCategoryArchive: React.FC<HomeCategoryArchiveProps> = ({
  categories,
  onSelectCategory,
  onViewFullArchive,
}) => {
  const layoutSpan = [
    'lg:col-span-7',
    'lg:col-span-5',
    'lg:col-span-5',
    'lg:col-span-7',
  ];

  const aspectClass = [
    'aspect-[16/10]',
    'aspect-[4/3] lg:aspect-[11/10]',
    'aspect-[4/3] lg:aspect-[11/10]',
    'aspect-[16/10]',
  ];

  return (
    <section
      data-home-section="category-archive"
      className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24 bg-[#F4F3EF]"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#111111]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6E6D68]">
            INDEX 01–04 // DROP 01 SPECIFICATIONS
          </p>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[-0.035em] text-[#111111] mt-1">
            ARCHIVE BY CATEGORY
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewFullArchive}
          className="min-h-[44px] inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:text-[#9E3E24] underline decoration-[#9E3E24] underline-offset-4 cursor-pointer self-start sm:self-auto"
        >
          <span>VIEW FULL ARCHIVE</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-8">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            type="button"
            data-category-card
            onClick={() => onSelectCategory(cat.id)}
            className={`${layoutSpan[idx % 4]} group border border-[#D4D2CA] hover:border-[#111111] bg-[#EAE8E1] text-left cursor-pointer transition-colors flex flex-col overflow-hidden`}
          >
            <div className={`${aspectClass[idx % 4]} w-full bg-[#EAE8E1] overflow-hidden`}>
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>

            <div className="p-5 bg-[#F4F3EF] border-t border-[#D4D2CA] group-hover:bg-[#0E0E0E] group-hover:text-[#F4F3EF] transition-colors flex items-end justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-65">
                  0{idx + 1} // {cat.subtitle}
                </div>
                <div className="text-lg md:text-xl font-black uppercase tracking-[-0.025em] mt-1">
                  {cat.title}
                </div>
              </div>
              <ArrowUpRight
                className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
