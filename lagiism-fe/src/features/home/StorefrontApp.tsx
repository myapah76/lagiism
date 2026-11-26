import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AboutView } from '../../components/AboutView';
import { AccountModal } from '../../components/AccountModal';
import { AuthModal } from '../../components/AuthModal';
import { BagDrawer } from '../../components/BagDrawer';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { ProductDetailView } from '../../components/ProductDetailView';
import { ShopAllView } from '../../components/ShopAllView';
import { ShopTheSet } from '../../components/ShopTheSet';
import { HomeHero } from './components/HomeHero';
import { HomeDropCollection } from './components/HomeDropCollection';
import { HomeEditorialFilm } from './components/HomeEditorialFilm';
import { HomeCategoryArchive } from './components/HomeCategoryArchive';

gsap.registerPlugin(ScrollTrigger, useGSAP);
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

  const homeRootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (activeView !== 'HOME') return;
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      // Restrained editorial hero entrance (line-by-line + subtle image sharpen/settle)
      const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      introTl
        .fromTo('[data-hero-media]', { scale: 1.07, autoAlpha: 0.7 }, { scale: 1.0, autoAlpha: 1, duration: 1.05 }, 0)
        .fromTo('[data-hero-line]', { yPercent: 105, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.72, stagger: 0.09 }, 0.14)
        .fromTo('[data-hero-meta]', { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08 }, 0.28);

      // Restrained scroll-linked parallax on Hero & Editorial Film imagery (zero pinning!)
      gsap.to('[data-hero-media]', {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-home-hero]',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.fromTo(
        '[data-film-media]',
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-home-section="editorial-film"]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // Editorial ScrollTrigger.batch reveal for product & category cards
      gsap.set('[data-reveal-card]', { y: 20, autoAlpha: 0 });
      ScrollTrigger.batch('[data-reveal-card]', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            autoAlpha: 1,
            duration: 0.55,
            stagger: 0.06,
            ease: 'power2.out',
            overwrite: true,
          }),
      });
    },
    { scope: homeRootRef, dependencies: [activeView], revertOnUpdate: true }
  );

  return (
    <div ref={homeRootRef} className="min-h-screen flex flex-col bg-[#F4F3EF] text-[#111111]">
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
            <HomeHero
              heroImage={heroImage}
              heroHeadline={heroHeadline}
              heroSubheadline={heroSubheadline}
              coordinates={coordinates}
              primaryCta={primaryCta}
              onNavigate={handleNavigate}
            />

            <HomeDropCollection
              dropLabel={dropLabel}
              coordinates={coordinates}
              tabs={DROP_TABS}
              activeCategory={dropCategory}
              visibleProducts={visibleDropProducts}
              totalCount={dropProducts.length}
              hasMore={dropHasMore}
              sentinelRef={dropSentinelRef}
              onCategoryChange={handleDropCategoryChange}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={handleQuickAdd}
            />

            <HomeEditorialFilm onNavigate={handleNavigate} />

            <HomeCategoryArchive
              categories={CATEGORY_STRIP}
              onSelectCategory={handleSelectCategoryStrip}
              onViewFullArchive={() => {
                navigate('/shop');
                window.scrollTo({ top: 0 });
              }}
            />

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
