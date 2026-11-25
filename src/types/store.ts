export type ProductCategory = 'TEES' | 'DENIM' | 'OUTERWEAR' | 'ACCESSORIES';

export type DropFilterCategory = 'ALL' | 'TEES' | 'DENIM' | 'OUTERWEAR';

export type ShopAllCategory = 'ALL' | ProductCategory;

export type SizeOption = 'S' | 'M' | 'L' | 'XL';

export type ActiveView = 'HOME' | 'SHOP_ALL' | 'PRODUCT_DETAIL' | 'ABOUT';

export type SetViewMode = '2D_STUDIO' | '3D_MODEL';

export type SetInclusionMode = 'BOTH' | 'TOP_ONLY' | 'BOTTOM_ONLY';

export interface ProductSpec {
  sku: string;
  gsm: string;
  fabric: string;
  fit: string;
  origin: string;
  coordinates: string;
}

export interface Product {
  id: string;
  name: string;
  nameVi: string;
  priceVnd: number;
  category: ProductCategory;
  setSlot: 'TOP' | 'BOTTOM' | 'NONE';
  colorName: string;
  colorHex: string;
  sizes: SizeOption[];
  image: string;
  secondaryImage: string;
  glbModelSlot: string;
  description: string;
  specs: ProductSpec;
}

export interface CategoryStripItem {
  id: ProductCategory;
  title: string;
  subtitle: string;
  image: string;
}

export interface PresetSet {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  topId: string;
  bottomId: string;
  lookbookImage: string;
}

export interface BagItem {
  key: string;
  productId: string;
  name: string;
  priceVnd: number;
  size: SizeOption;
  colorName: string;
  colorHex: string;
  image: string;
  quantity: number;
  setTag?: string;
}

export type CustomizeSlotCategory = 'top' | 'bottom';

export interface CustomizeArtifact {
  id: string;
  name: string;
  nameVi: string;
  category: CustomizeSlotCategory;
  subLabel: string;
  priceVnd: number;
  image: string;
  colorName: string;
  colorHex: string;
  glbModelSlot: string;
  tiltDeg: number;
  cornerTag?: {
    label: string;
    position: 'top-left' | 'top-right' | 'bottom-right';
    variant: 'muted' | 'dark' | 'acid';
  };
}

