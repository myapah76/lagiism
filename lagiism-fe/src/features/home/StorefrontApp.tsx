import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AboutView } from '../../components/AboutView';
import { AccountModal } from '../../components/AccountModal';
import { AuthModal } from '../../components/AuthModal';
import { BagDrawer } from '../../components/BagDrawer';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { ProductDetailView } from '../../components/ProductDetailView';
import { ShopAllView } from '../../components/ShopAllView';
import { ShopTheSet } from '../../components/ShopTheSet';
import { BRAND_INFO, CATEGORY_STRIP, PRODUCTS } from '../../data/catalog';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { catalogService } from '../../services/catalog.service';
import { cmsService } from '../../services/cms.service';
import { getAccessToken } from '../../lib/axios';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { HomepageAggregateDto, ProductDto } from '../../types/api';
import {
  ActiveView,
  BagItem,
  DropFilterCategory,
  Product,
  ProductCategory,
  SetInclusionMode,
  ShopAllCategory,
  SizeOption,
} from '../../types/store';
import {
  addItemToBag,
  addSetSelectionToBag,
  calculateBagCount,
  filterDropProducts,
  removeBagItem,
  updateBagItemQuantity,
} from '../../utils/storeLogic';

const DROP_TABS: { id: DropFilterCategory; label: string }[] = [
  { id: 'ALL', label: 'ALL' },
  { id: 'TEES', label: 'TEES' },
  { id: 'DENIM', label: 'DENIM' },
  { id: 'OUTERWEAR', label: 'OUTERWEAR' },
];

const VALID_SHOP_CATEGORIES: ShopAllCategory[] = [
  'ALL',
  'TEES',
  'DENIM',
  'OUTERWEAR',
  'ACCESSORIES',
];

const VALID_DROP_CATEGORIES: DropFilterCategory[] = [
  'ALL',
  'TEES',
  'DENIM',
  'OUTERWEAR',
];

type SortOrder = 'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC';

function parseShopCategory(slug?: string): ShopAllCategory {
  if (!slug) return 'ALL';
  const upper = slug.toUpperCase() as ShopAllCategory;
  return VALID_SHOP_CATEGORIES.includes(upper) ? upper : 'ALL';
}

function parseDropCategory(param: string | null): DropFilterCategory {
  if (!param) return 'ALL';
  const upper = param.toUpperCase() as DropFilterCategory;
  return VALID_DROP_CATEGORIES.includes(upper) ? upper : 'ALL';
}

function parseSortOrder(param: string | null): SortOrder {
  if (param === 'price-asc' || param === 'PRICE_ASC') return 'PRICE_ASC';
  if (param === 'price-desc' || param === 'PRICE_DESC') return 'PRICE_DESC';
  return 'FEATURED';
}

function toSortParam(sort: SortOrder): string | null {
  if (sort === 'PRICE_ASC') return 'price-asc';
  if (sort === 'PRICE_DESC') return 'price-desc';
  return null;
}

function mapProductDto(dto: ProductDto): Product {
  const validCategory = (
    ['TEES', 'DENIM', 'OUTERWEAR', 'ACCESSORIES'].includes(dto.categoryCode)
      ? dto.categoryCode
      : 'TEES'
  ) as ProductCategory;
  const validSlot = (
    ['TOP', 'BOTTOM', 'NONE'].includes(dto.setSlot) ? dto.setSlot : 'NONE'
  ) as 'TOP' | 'BOTTOM' | 'NONE';
  const validSizes = (dto.sizes || ['S', 'M', 'L', 'XL']).filter((s): s is SizeOption =>
    ['S', 'M', 'L', 'XL'].includes(s)
  );

  return {
    id: dto.slug,
    name: dto.name,
    nameVi: dto.nameVi || dto.name,
    priceVnd: dto.priceVnd,
    category: validCategory,
    setSlot: validSlot,
    colorName: dto.colorName,
    colorHex: dto.colorHex,
    sizes: validSizes.length > 0 ? validSizes : ['S', 'M', 'L', 'XL'],
    image: dto.imageUrl,
    secondaryImage: dto.secondaryImageUrl || dto.imageUrl,
    glbModelSlot: dto.glbModelSlot || '',
    description: dto.description || '',
    specs: {
      sku: dto.sku,
      gsm: dto.gsm || '',
      fabric: dto.fabric || '',
      fit: dto.fit || '',
      origin: dto.origin || '',
      coordinates: dto.coordinates || BRAND_INFO.coordinates,
    },
  };
}

export function StorefrontApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categorySlug, slug: productSlug } = useParams<{
    categorySlug?: string;
    slug?: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [homepage, setHomepage] = useState<HomepageAggregateDto | null>(null);
  const [bag, setBag] = useState<BagItem[]>([]);
  const { isBagOpen, setBagOpen } = useUiStore();
  const { initialized: authInitialized, checkSession } = useAuthStore();

  useEffect(() => {
    if (!authInitialized && getAccessToken()) {
      checkSession();
    }
  }, [authInitialized, checkSession]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      cmsService.getPublicHomepage(),
      catalogService.listPublicProducts(),
    ]).then(([cmsRes, prodRes]) => {
      if (!active) return;
      if (cmsRes.status === 'fulfilled' && cmsRes.value) {
        setHomepage(cmsRes.value);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value.length > 0) {
        setProducts(prodRes.value.map(mapProductDto));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Derive activeView & filter state directly from URL path + query params
  const activeView: ActiveView = useMemo(() => {
    if (location.pathname.startsWith('/shop')) return 'SHOP_ALL';
    if (location.pathname.startsWith('/product/')) return 'PRODUCT_DETAIL';
    if (location.pathname === '/about') return 'ABOUT';
    return 'HOME';
  }, [location.pathname]);

  const shopAllCategory = parseShopCategory(categorySlug);
  const dropCategory = parseDropCategory(searchParams.get('drop'));
  const searchQuery = searchParams.get('q') || '';
  const sortOrder = parseSortOrder(searchParams.get('sort'));

  const selectedProduct = useMemo(() => {
    if (productSlug) {
      return (
        products.find((p) => p.id.toLowerCase() === productSlug.toLowerCase()) ||
        products[0]
      );
    }
    return products[0];
  }, [productSlug, products]);

  const bagCount = calculateBagCount(bag);
  const dropProducts = filterDropProducts(products, dropCategory);
  const {
    visibleCount: dropVisibleCount,
    hasMore: dropHasMore,
    sentinelRef: dropSentinelRef,
  } = useInfiniteScroll({
    totalItems: dropProducts.length,
    batchSize: 4,
    resetKey: dropCategory,
  });
  const visibleDropProducts = dropProducts.slice(0, dropVisibleCount);

  const heroHeadline = homepage?.hero?.headline || 'LAGIISM // DROP 01';
  const heroSubheadline =
    homepage?.hero?.subheadline || `${BRAND_INFO.established} | ${BRAND_INFO.locations}`;
  const heroImage = homepage?.hero?.imageUrl || BRAND_INFO.heroImage;
  const primaryCta = homepage?.hero?.primaryCtaLabel || 'EXPLORE DROP 01';
  const secondaryCta = homepage?.hero?.secondaryCtaLabel || 'SHOP THE SET';
  const dropLabel = homepage?.settings?.drop_label || BRAND_INFO.dropLabel;
  const coordinates = homepage?.settings?.brand_coordinates || BRAND_INFO.coordinates;

  const buildShopUrl = (
    category: ShopAllCategory,
    q: string,
    sort: SortOrder
  ): string => {
    const base = category === 'ALL' ? '/shop' : `/shop/${category.toLowerCase()}`;
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    const sortParam = toSortParam(sort);
    if (sortParam) params.set('sort', sortParam);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const handleNavigate = (view: ActiveView, anchor?: string) => {
    if (view === 'HOME') {
      const target = anchor ? `/#${anchor}` : '/';
      navigate(target);
      if (anchor) {
        window.setTimeout(() => {
          const el = document.getElementById(anchor);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 60);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (view === 'SHOP_ALL') {
      navigate(buildShopUrl(shopAllCategory, searchQuery, sortOrder));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'ABOUT') {
      navigate('/about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'PRODUCT_DETAIL') {
      navigate(`/product/${selectedProduct.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDropCategoryChange = (cat: DropFilterCategory) => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'ALL') {
      next.delete('drop');
    } else {
      next.set('drop', cat.toLowerCase());
    }
    setSearchParams(next, { replace: false });
  };

  const handleShopCategoryChange = (cat: ShopAllCategory) => {
    navigate(buildShopUrl(cat, searchQuery, sortOrder));
  };

  const handleSearchChange = (q: string) => {
    const next = new URLSearchParams(searchParams);
    if (q) {
      next.set('q', q);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  };

  const handleSortChange = (sort: SortOrder) => {
    navigate(buildShopUrl(shopAllCategory, searchQuery, sort));
  };

  const handleSelectProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAdd = (product: Product, size: SizeOption) => {
    setBag((prev) => addItemToBag(prev, product, size));
    setBagOpen(true);
  };

  const handleAddSetToBag = (payload: {
    topProduct?: Product;
    bottomProduct?: Product;
    topSize: SizeOption;
    bottomSize: SizeOption;
    inclusionMode: SetInclusionMode;
    setCode?: string;
  }) => {
    setBag((prev) => addSetSelectionToBag(prev, payload));
    setBagOpen(true);
  };

  const handleSelectCategoryStrip = (category: ProductCategory) => {
    navigate(`/shop/${category.toLowerCase()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F3EF] text-[#111111]">
      <Header
        activeView={activeView}
        bagCount={bagCount}
        searchQuery={searchQuery}
        products={products}
        onNavigate={handleNavigate}
        onOpenBag={() => setBagOpen(true)}
        onSearchChange={handleSearchChange}
        onSelectProduct={handleSelectProduct}
      />

      <main className="flex-1 bg-[#F4F3EF]">
        {activeView === 'HOME' && (
          <>
            <section className="pt-14 border-b border-[#111111]">
              <div className="relative w-full h-[74svh] min-h-[480px] max-h-[820px] bg-[#0E0E0E] overflow-hidden">
                <img
                  src={heroImage}
                  alt="LAGIISM Drop 01 coastal concrete campaign in La Gi"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E]/85 via-[#0E0E0E]/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 max-w-[1440px] mx-auto px-4 md:px-8 pb-8 md:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#EAE8E1]">
                      {heroSubheadline}
                    </p>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[-0.04em] leading-[0.92] text-[#F4F3EF] mt-2">
                      {heroHeadline}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleNavigate('HOME', 'drop-collection')}
                      className="min-h-[44px] bg-[#F4F3EF] text-[#0E0E0E] border border-[#F4F3EF] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#9E3E24] hover:border-[#9E3E24] hover:text-[#F4F3EF] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {primaryCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('ABOUT')}
                      className="min-h-[44px] bg-[#0E0E0E]/85 text-[#F4F3EF] border border-[#F4F3EF] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#F4F3EF] hover:text-[#0E0E0E] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      EXPLORE STORY
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="drop-collection"
              className="py-14 md:py-20 scroll-mt-14"
            >
              {/* Sticky Drop 01 Filter Bar */}
              <div className="sticky top-14 z-30 bg-[#F4F3EF]/95 backdrop-blur-sm border-y border-[#111111]">
                <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6D68]">
                      NEW ARRIVALS // {coordinates}
                    </p>
                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[-0.03em] text-[#111111] mt-1">
                      {dropLabel}
                    </h2>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Drop 01 category filters"
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {DROP_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={dropCategory === tab.id}
                        onClick={() => handleDropCategoryChange(tab.id)}
                        className={`min-h-[40px] font-mono text-[11px] font-bold uppercase px-3.5 py-2 border border-[#111111] cursor-pointer transition-colors whitespace-nowrap ${
                          dropCategory === tab.id
                            ? 'bg-[#0E0E0E] text-[#F4F3EF]'
                            : 'bg-[#F4F3EF] text-[#111111] hover:bg-[#EAE8E1]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                  {visibleDropProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectProduct={handleSelectProduct}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Sentinel */}
                <div ref={dropSentinelRef} className="mt-8 flex justify-center">
                  {dropHasMore && (
                    <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6D68] py-2">
                      SCROLLING TO LOAD MORE ({visibleDropProducts.length} / {dropProducts.length})...
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Asymmetric Editorial Bridge to About Us Skateboarding Story */}
            <section className="border-t border-[#111111] bg-[#EAE8E1]">
              <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 border border-[#111111] bg-[#F4F3EF] overflow-hidden">
                  <img
                    src="/images/about/scene01-skatepark-bg.jpg"
                    alt="Illustrated La Gi coastal concrete skatepark editorial preview"
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[16/9] object-cover"
                  />
                </div>
                <div className="lg:col-span-5 space-y-4">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#9E3E24]">
                    EDITORIAL FILM // LA GI — SAIGON
                  </p>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[-0.03em] text-[#111111] leading-[0.98]">
                    THE SKATEBOARDING STORY BEHIND DROP 01
                  </h2>
                  <p className="text-sm leading-relaxed text-[#111111]/85 max-w-[46ch]">
                    Scroll through four illustrated 2.5D scenes—from the concrete seawall gathering in La Gi to a slow-motion stair kickflip in Saigon.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleNavigate('ABOUT')}
                      className="min-h-[44px] bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#9E3E24] transition-colors cursor-pointer"
                    >
                      ENTER ABOUT STORY →
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-[1440px] mx-auto px-4 md:px-8 pb-16 md:pb-20 border-t border-[#111111] pt-14">
              <div className="flex items-end justify-between pb-5 border-b border-[#111111]">
                <h2 className="text-xl md:text-3xl font-black uppercase tracking-[-0.03em] text-[#111111]">
                  ARCHIVE BY CATEGORY
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/shop');
                    window.scrollTo({ top: 0 });
                  }}
                  className="font-mono text-[11px] font-bold uppercase underline decoration-[#9E3E24] underline-offset-4 text-[#111111] hover:text-[#9E3E24] cursor-pointer"
                >
                  VIEW FULL ARCHIVE
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                {CATEGORY_STRIP.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategoryStrip(cat.id)}
                    className="group border border-[#D4D2CA] hover:border-[#111111] bg-[#F4F3EF] text-left cursor-pointer transition-colors flex flex-col"
                  >
                    <div className="aspect-[4/3] w-full bg-[#EAE8E1] overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-4 border-t border-[#D4D2CA] group-hover:bg-[#0E0E0E] group-hover:text-[#F4F3EF] transition-colors">
                      <div className="text-sm font-black uppercase tracking-[-0.02em]">
                        {cat.title}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.04em] opacity-75 mt-1">
                        {cat.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <ShopTheSet
              onAddSetToBag={handleAddSetToBag}
              onSelectProduct={handleSelectProduct}
            />
          </>
        )}

        {activeView === 'SHOP_ALL' && (
          <ShopAllView
            products={products}
            selectedCategory={shopAllCategory}
            searchQuery={searchQuery}
            sortOrder={sortOrder}
            onCategoryChange={handleShopCategoryChange}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onSelectProduct={handleSelectProduct}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {activeView === 'PRODUCT_DETAIL' && (
          <ProductDetailView
            product={selectedProduct}
            relatedProducts={products.filter((p) => p.id !== selectedProduct.id)}
            onBack={() =>
              window.history.length > 1 ? navigate(-1) : navigate('/shop')
            }
            onAddToBag={handleQuickAdd}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeView === 'ABOUT' && <AboutView onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />

      <BagDrawer
        isOpen={isBagOpen}
        items={bag}
        onClose={() => setBagOpen(false)}
        onUpdateQty={(key, delta) =>
          setBag((prev) => updateBagItemQuantity(prev, key, delta))
        }
        onRemoveItem={(key) => setBag((prev) => removeBagItem(prev, key))}
        onClearBag={() => setBag([])}
      />

      <AuthModal />
      <AccountModal />
    </div>
  );
}
