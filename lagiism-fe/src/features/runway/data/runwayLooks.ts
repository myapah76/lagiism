import { PRODUCTS } from '../../../data/catalog';
import { Product } from '../../../types/store';

export interface RunwayVariant {
  id: string;
  label: string;
  optionName: string;
  available: boolean;
}

export interface RunwayProductPin {
  x: number; // % of model container width
  y: number; // % of model container height
  label: string;
}

export interface RunwayProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: 'VND';
  image: string;
  originalUrl: string;
  optionName: string;
  variants: RunwayVariant[];
  available: boolean;
  badge: string | null;
  pin: RunwayProductPin;
}

export interface RunwayLook {
  id: string;
  number: number;
  name: string;
  subtitle: string;
  hero: {
    image: string;
    alt: string;
  };
  model: {
    image: string;
    alt: string;
  };
  products: RunwayProduct[];
}

const productMap = new Map<string, Product>(PRODUCTS.map((p) => [p.id, p]));

function buildRunwayProduct(
  productId: string,
  pin: { x: number; y: number },
  badge: string | null = null
): RunwayProduct | null {
  const src = productMap.get(productId);
  if (!src) return null;

  const isOneSize = src.category === 'ACCESSORIES';
  const optionName = isOneSize ? 'Fit' : 'Size';
  const variants: RunwayVariant[] = isOneSize
    ? [{ id: `${src.id}::ONE_SIZE`, label: 'ONE SIZE', optionName, available: true }]
    : src.sizes.map((sz) => ({
        id: `${src.id}::${sz}`,
        label: sz,
        optionName,
        available: true,
      }));

  return {
    id: src.id,
    name: src.name,
    category: src.category,
    price: src.priceVnd,
    currency: 'VND',
    image: src.image,
    originalUrl: `/product/${src.id}`,
    optionName,
    variants,
    available: variants.some((v) => v.available),
    badge,
    pin: {
      x: pin.x,
      y: pin.y,
      label: src.name,
    },
  };
}

function collectValid(items: (RunwayProduct | null)[]): RunwayProduct[] {
  return items.filter((item): item is RunwayProduct => item !== null);
}

/**
 * Six editorial runway looks grounded strictly in the real LAGIISM Drop 01 catalog
 * and existing transparent character cutout assets.
 */
export const RUNWAY_LOOKS: RunwayLook[] = [
  {
    id: 'look-01',
    number: 1,
    name: 'Concrete Routine',
    subtitle: 'Sun-bleached boxy jersey paired with rigid 14oz indigo selvedge.',
    hero: {
      image: '/images/about/protagonist-push.png',
      alt: 'LAGIISM Look 01 — Concrete Routine skate silhouette',
    },
    model: {
      image: '/images/about/protagonist-push.png',
      alt: 'Model wearing Concrete Routine look',
    },
    products: collectValid([
      buildRunwayProduct('lg-tee-01', { x: 52, y: 34 }, '280 GSM'),
      buildRunwayProduct('lg-denim-01', { x: 48, y: 66 }, '14 OZ RAW'),
    ]),
  },
  {
    id: 'look-02',
    number: 2,
    name: 'Seawall Squall',
    subtitle: 'Windproof ripstop shell engineered for coastal rain and abrasion.',
    hero: {
      image: '/images/about/skater-linh.png',
      alt: 'LAGIISM Look 02 — Seawall Squall shell and carpenter denim',
    },
    model: {
      image: '/images/about/skater-linh.png',
      alt: 'Model wearing Seawall Squall look',
    },
    products: collectValid([
      buildRunwayProduct('lg-outer-01', { x: 52, y: 35 }, 'DWR SHELL'),
      buildRunwayProduct('lg-denim-02', { x: 48, y: 68 }, 'CARPENTER'),
    ]),
  },
  {
    id: 'look-03',
    number: 3,
    name: 'Salt Air Transit',
    subtitle: 'Overdyed raw-seam long sleeve and waxed 18oz canvas utility carry.',
    hero: {
      image: '/images/about/skater-minh.png',
      alt: 'LAGIISM Look 03 — Salt Air Transit long-sleeve and waxed tote',
    },
    model: {
      image: '/images/about/skater-minh.png',
      alt: 'Model wearing Salt Air Transit look',
    },
    products: collectValid([
      buildRunwayProduct('lg-tee-02', { x: 53, y: 36 }, '310 GSM'),
      buildRunwayProduct('lg-acc-01', { x: 35, y: 50 }, '18 OZ WAXED'),
      buildRunwayProduct('lg-denim-02', { x: 52, y: 68 }, null),
    ]),
  },
  {
    id: 'look-04',
    number: 4,
    name: 'Monsoon Heavyweight',
    subtitle: '500GSM sun-faded French terry layered over wide-leg selvedge.',
    hero: {
      image: '/images/about/skater-tuan.png',
      alt: 'LAGIISM Look 04 — Monsoon Heavyweight 500GSM hoodie and raw denim',
    },
    model: {
      image: '/images/about/skater-tuan.png',
      alt: 'Model wearing Monsoon Heavyweight look',
    },
    products: collectValid([
      buildRunwayProduct('lg-outer-02', { x: 54, y: 36 }, '500 GSM'),
      buildRunwayProduct('lg-denim-01', { x: 50, y: 65 }, '14 OZ RAW'),
    ]),
  },
  {
    id: 'look-05',
    number: 5,
    name: 'District 01 Night',
    subtitle: 'Structured pitch-asphalt mock-neck and wide architectural drape.',
    hero: {
      image: '/images/about/skater-ha.png',
      alt: 'LAGIISM Look 05 — District 01 Night outerwear and wide trousers',
    },
    model: {
      image: '/images/about/skater-ha.png',
      alt: 'Model wearing District 01 Night look',
    },
    products: collectValid([
      buildRunwayProduct('lg-outer-01', { x: 52, y: 34 }, 'OUTERWEAR'),
      buildRunwayProduct('lg-tee-03', { x: 52, y: 45 }, '330 GSM'),
      buildRunwayProduct('lg-denim-02', { x: 50, y: 70 }, null),
    ]),
  },
  {
    id: 'look-06',
    number: 6,
    name: 'Breakwater Horizon',
    subtitle: 'Stripped-back coastal uniform built for everyday concrete motion.',
    hero: {
      image: '/images/about/protagonist-rear.png',
      alt: 'LAGIISM Look 06 — Breakwater Horizon rear uniform silhouette',
    },
    model: {
      image: '/images/about/protagonist-rear.png',
      alt: 'Model wearing Breakwater Horizon look',
    },
    products: collectValid([
      buildRunwayProduct('lg-tee-01', { x: 50, y: 35 }, 'WASHED'),
      buildRunwayProduct('lg-denim-01', { x: 50, y: 65 }, 'SELVEDGE'),
      buildRunwayProduct('lg-acc-01', { x: 64, y: 52 }, 'CARRY'),
    ]),
  },
];

export function findRunwayProductById(productId: string): RunwayProduct | undefined {
  for (const look of RUNWAY_LOOKS) {
    const match = look.products.find((p) => p.id === productId);
    if (match) return match;
  }
  return undefined;
}
