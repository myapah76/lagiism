import {
  BagItem,
  CustomizeArtifact,
  DropFilterCategory,
  Product,
  SetInclusionMode,
  ShopAllCategory,
  SizeOption,
} from '../types/store';

/**
 * Format an integer VND amount using dot thousands separators and trailing ₫ symbol.
 * Example: 850000 -> "850.000₫"
 */
export function formatVND(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  return `${safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}₫`;
}

/**
 * Filter products for the Homepage DROP 01 // NEW COLLECTION grid.
 */
export function filterDropProducts(
  products: Product[],
  category: DropFilterCategory
): Product[] {
  if (category === 'ALL') {
    return products;
  }
  return products.filter((p) => p.category === category);
}

/**
 * Filter and sort products for the SHOP ALL archive view + Search query.
 */
export function filterAndSortCatalog(
  products: Product[],
  options: {
    category: ShopAllCategory;
    query: string;
    sort: 'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC';
  }
): Product[] {
  const trimmed = options.query.trim().toLowerCase();

  let list = products.filter((p) => {
    const matchesCat =
      options.category === 'ALL' || p.category === options.category;
    if (!matchesCat) return false;
    if (!trimmed) return true;
    return (
      p.name.toLowerCase().includes(trimmed) ||
      p.nameVi.toLowerCase().includes(trimmed) ||
      p.category.toLowerCase().includes(trimmed) ||
      p.colorName.toLowerCase().includes(trimmed) ||
      p.specs.sku.toLowerCase().includes(trimmed)
    );
  });

  if (options.sort === 'PRICE_ASC') {
    list = [...list].sort((a, b) => a.priceVnd - b.priceVnd);
  } else if (options.sort === 'PRICE_DESC') {
    list = [...list].sort((a, b) => b.priceVnd - a.priceVnd);
  }
  return list;
}

/**
 * Calculate the live VND total for the SHOP THE SET builder.
 */
export function calculateSetTotal(params: {
  topProduct?: Product;
  bottomProduct?: Product;
  inclusionMode: SetInclusionMode;
}): number {
  const { topProduct, bottomProduct, inclusionMode } = params;
  let total = 0;
  if (
    (inclusionMode === 'BOTH' || inclusionMode === 'TOP_ONLY') &&
    topProduct
  ) {
    total += topProduct.priceVnd;
  }
  if (
    (inclusionMode === 'BOTH' || inclusionMode === 'BOTTOM_ONLY') &&
    bottomProduct
  ) {
    total += bottomProduct.priceVnd;
  }
  return total;
}

/**
 * Create a deterministic bag key from product ID, size, and optional set label.
 */
export function createBagItemKey(
  productId: string,
  size: SizeOption,
  setTag?: string
): string {
  return `${productId}__${size}__${setTag || 'SINGLE'}`;
}

/**
 * Add a product (or increment quantity if identical item+size+setTag exists) to bag.
 */
export function addItemToBag(
  bag: BagItem[],
  product: Product,
  size: SizeOption,
  setTag?: string
): BagItem[] {
  const key = createBagItemKey(product.id, size, setTag);
  const existing = bag.find((item) => item.key === key);
  if (existing) {
    return bag.map((item) =>
      item.key === key ? { ...item, quantity: item.quantity + 1 } : item
    );
  }
  return [
    ...bag,
    {
      key,
      productId: product.id,
      name: product.name,
      priceVnd: product.priceVnd,
      size,
      colorName: product.colorName,
      colorHex: product.colorHex,
      image: product.image,
      quantity: 1,
      setTag,
    },
  ];
}

/**
 * Add the selected items from SHOP THE SET builder into the bag.
 */
export function addSetSelectionToBag(
  bag: BagItem[],
  params: {
    topProduct?: Product;
    bottomProduct?: Product;
    topSize: SizeOption;
    bottomSize: SizeOption;
    inclusionMode: SetInclusionMode;
    setCode?: string;
  }
): BagItem[] {
  let nextBag = bag;
  const tag = params.inclusionMode === 'BOTH' ? params.setCode : undefined;

  if (
    (params.inclusionMode === 'BOTH' || params.inclusionMode === 'TOP_ONLY') &&
    params.topProduct
  ) {
    nextBag = addItemToBag(nextBag, params.topProduct, params.topSize, tag);
  }
  if (
    (params.inclusionMode === 'BOTH' ||
      params.inclusionMode === 'BOTTOM_ONLY') &&
    params.bottomProduct
  ) {
    nextBag = addItemToBag(
      nextBag,
      params.bottomProduct,
      params.bottomSize,
      tag
    );
  }
  return nextBag;
}

export function updateBagItemQuantity(
  bag: BagItem[],
  key: string,
  delta: number
): BagItem[] {
  return bag
    .map((item) =>
      item.key === key ? { ...item, quantity: item.quantity + delta } : item
    )
    .filter((item) => item.quantity > 0);
}

export function removeBagItem(bag: BagItem[], key: string): BagItem[] {
  return bag.filter((item) => item.key !== key);
}

export function calculateBagSubtotal(bag: BagItem[]): number {
  return bag.reduce((sum, item) => sum + item.priceVnd * item.quantity, 0);
}

export function calculateBagCount(bag: BagItem[]): number {
  return bag.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Normalize rotation angle to [0, 360) degrees for 3D turntable display.
 */
export function normalizeAzimuth(deg: number): number {
  const mod = deg % 360;
  return mod < 0 ? mod + 360 : Math.round(mod);
}

/**
 * Convert a CustomizeArtifact into a Product-compatible object for the Set Builder & Bag.
 */
export function artifactToProduct(artifact: CustomizeArtifact): Product {
  return {
    id: artifact.id,
    name: artifact.name,
    nameVi: artifact.nameVi,
    priceVnd: artifact.priceVnd,
    category: artifact.category === 'top' ? 'TEES' : 'DENIM',
    setSlot: artifact.category === 'top' ? 'TOP' : 'BOTTOM',
    colorName: artifact.colorName,
    colorHex: artifact.colorHex,
    sizes: ['S', 'M', 'L', 'XL'],
    image: artifact.image,
    secondaryImage: artifact.image,
    glbModelSlot: artifact.glbModelSlot,
    description: `${artifact.subLabel} — LAGIISM Freeform Rigging Archive piece.`,
    specs: {
      sku: artifact.id.toUpperCase(),
      gsm: artifact.subLabel,
      fabric: 'LAGIISM ARCHIVE TEXTILE',
      fit: 'MODULAR SET FIT',
      origin: 'LA GI — TP.HCM, VN',
      coordinates: '10.681° N // 107.771° E',
    },
  };
}

/**
 * Derive SetInclusionMode from nullable top/bottom active selections.
 */
export function deriveInclusionMode(
  activeTopId: string | null,
  activeBottomId: string | null
): SetInclusionMode | 'NONE' {
  if (activeTopId && activeBottomId) return 'BOTH';
  if (activeTopId) return 'TOP_ONLY';
  if (activeBottomId) return 'BOTTOM_ONLY';
  return 'NONE';
}

/**
 * Toggle binding an artifact card from the CUSTOMIZE LOOK canvas with the Top/Bottom slots.
 */
export function toggleArtifactBinding(
  current: {
    activeTopId: string | null;
    activeBottomId: string | null;
  },
  artifact: CustomizeArtifact
): {
  activeTopId: string | null;
  activeBottomId: string | null;
} {
  if (artifact.category === 'top') {
    return {
      activeTopId: current.activeTopId === artifact.id ? null : artifact.id,
      activeBottomId: current.activeBottomId,
    };
  }
  return {
    activeTopId: current.activeTopId,
    activeBottomId:
      current.activeBottomId === artifact.id ? null : artifact.id,
  };
}

