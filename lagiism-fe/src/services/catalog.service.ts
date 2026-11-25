import { API_ENDPOINTS } from '../constants/api';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api-client';
import { CategoryDto, ProductDto } from '../types/api';

export const catalogService = {
  listPublicProducts(category?: string): Promise<ProductDto[]> {
    return apiGet<ProductDto[]>(API_ENDPOINTS.PUBLIC.PRODUCTS, {
      params: category && category !== 'ALL' ? { category } : undefined,
    });
  },

  listPublicCategories(): Promise<CategoryDto[]> {
    return apiGet<CategoryDto[]>(API_ENDPOINTS.PUBLIC.CATEGORIES);
  },

  listAdminProducts(): Promise<ProductDto[]> {
    return apiGet<ProductDto[]>(API_ENDPOINTS.ADMIN.PRODUCTS);
  },

  createProduct(payload: Omit<ProductDto, 'id'>): Promise<ProductDto> {
    return apiPost<ProductDto>(API_ENDPOINTS.ADMIN.PRODUCTS, payload);
  },

  updateProduct(id: number, payload: Omit<ProductDto, 'id'>): Promise<ProductDto> {
    return apiPut<ProductDto>(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`, payload);
  },

  deleteProduct(id: number): Promise<void> {
    return apiDelete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
  },

  listAdminCategories(): Promise<CategoryDto[]> {
    return apiGet<CategoryDto[]>(API_ENDPOINTS.ADMIN.CATEGORIES);
  },

  createCategory(payload: Omit<CategoryDto, 'id'>): Promise<CategoryDto> {
    return apiPost<CategoryDto>(API_ENDPOINTS.ADMIN.CATEGORIES, payload);
  },

  deleteCategory(id: number): Promise<void> {
    return apiDelete(`${API_ENDPOINTS.ADMIN.CATEGORIES}/${id}`);
  },
};
