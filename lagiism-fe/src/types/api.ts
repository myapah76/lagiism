export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STAFF' | 'USER' | string;
  roles?: string[];
  authProvider?: 'LOCAL' | 'GOOGLE' | string;
  avatarUrl?: string;
  phone?: string;
  defaultAddress?: string;
  defaultCity?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  defaultAddress?: string;
  defaultCity?: string;
}

export interface OrderItemDto {
  id: number;
  productSlug: string;
  productName: string;
  size: string;
  colorName?: string;
  unitPriceVnd: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderDto {
  id: number;
  orderCode: string;
  userId?: number | null;
  userEmail?: string | null;
  status: string;
  orderSource: string;
  paymentMethod: string;
  totalVnd: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  note?: string;
  items: OrderItemDto[];
  createdAt: string;
}

export interface CreateOrderRequest {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  paymentMethod?: string;
  note?: string;
  items: {
    productSlug: string;
    productName: string;
    size: string;
    colorName?: string;
    unitPriceVnd: number;
    quantity: number;
    imageUrl?: string;
  }[];
}

export interface AdminCreateOrderRequest extends CreateOrderRequest {
  userId?: number | null;
  orderSource: string;
  status?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: AuthUser;
}

export interface CmsHeroDto {
  id: number;
  headline: string;
  subheadline: string;
  badgeText?: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  imageUrl: string;
  imagePublicId?: string;
  active: boolean;
  updatedAt: string;
}

export interface CmsSectionDto {
  id: number;
  sectionKey: string;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  imagePublicId?: string;
  sortOrder: number;
  active: boolean;
  updatedAt: string;
}

export interface CmsReviewDto {
  id: number;
  authorName: string;
  authorLocation?: string;
  rating: number;
  comment: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface HomepageAggregateDto {
  hero: CmsHeroDto | null;
  sections: CmsSectionDto[];
  reviews: CmsReviewDto[];
  settings: Record<string, string>;
}

export interface CategoryDto {
  id: number;
  code: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imagePublicId?: string;
  sortOrder: number;
  active: boolean;
}

export interface ProductDto {
  id: number;
  slug: string;
  sku: string;
  name: string;
  nameVi?: string;
  priceVnd: number;
  categoryCode: string;
  setSlot: 'TOP' | 'BOTTOM' | 'NONE' | string;
  colorName: string;
  colorHex: string;
  sizes: string[];
  imageUrl: string;
  imagePublicId?: string;
  secondaryImageUrl?: string;
  secondaryImagePublicId?: string;
  glbModelSlot?: string;
  description?: string;
  gsm?: string;
  fabric?: string;
  fit?: string;
  origin?: string;
  coordinates?: string;
  badgeText?: string;
  active: boolean;
  sortOrder: number;
}

export interface AccountDto {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  defaultAddress?: string;
  defaultCity?: string;
  role: string;
  roles?: string[];
  authProvider?: string;
  avatarUrl?: string;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuditLogDto {
  id: number;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  createdAt: string;
}

export interface SmtpConfigDto {
  id: number;
  host: string;
  port: number;
  username: string;
  hasPassword: boolean;
  fromEmail: string;
  fromName: string;
  useTls: boolean;
  useSsl: boolean;
  enabled: boolean;
  updatedAt: string;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export interface DatabaseStatusDto {
  databaseProduct: string;
  databaseVersion: string;
  healthy: boolean;
  tableCounts: Record<string, number>;
}

export interface SqlPreviewDto {
  totalLines: number;
  statementCount: number;
  containsDropOrTruncate: boolean;
  sampleLines: string[];
}
