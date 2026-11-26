import { API_ENDPOINTS } from '../constants/api';
import { apiGet, apiPost, apiPut } from '../lib/api-client';
import {
  AuthUser,
  CreateOrderRequest,
  OrderDto,
  UpdateProfileRequest,
} from '../types/api';

export const userService = {
  getProfile(): Promise<AuthUser> {
    return apiGet<AuthUser>(API_ENDPOINTS.USER.PROFILE);
  },

  updateProfile(payload: UpdateProfileRequest): Promise<AuthUser> {
    return apiPut<AuthUser>(API_ENDPOINTS.USER.PROFILE, payload);
  },

  getOrderHistory(): Promise<OrderDto[]> {
    return apiGet<OrderDto[]>(API_ENDPOINTS.USER.ORDERS);
  },

  placeOrder(payload: CreateOrderRequest): Promise<OrderDto> {
    return apiPost<OrderDto>(API_ENDPOINTS.USER.ORDERS, payload);
  },

  placeGuestOrder(payload: CreateOrderRequest): Promise<OrderDto> {
    return apiPost<OrderDto>(API_ENDPOINTS.PUBLIC.ORDERS, payload);
  },
};
