import { API_ENDPOINTS, UPLOAD_TIMEOUT_MS } from '../constants/api';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api-client';
import {
  AccountDto,
  AdminCreateOrderRequest,
  AuditLogDto,
  CloudinaryUploadResult,
  OrderDto,
  SmtpConfigDto,
} from '../types/api';

export const adminService = {
  listAccounts(q?: string): Promise<AccountDto[]> {
    return apiGet<AccountDto[]>(API_ENDPOINTS.ADMIN.ACCOUNTS, {
      params: q && q.trim() ? { q: q.trim() } : undefined,
    });
  },

  createAccount(payload: {
    email: string;
    fullName: string;
    password: string;
    role: string;
  }): Promise<AccountDto> {
    return apiPost<AccountDto>(API_ENDPOINTS.ADMIN.ACCOUNTS, payload);
  },

  deleteAccount(id: number): Promise<void> {
    return apiDelete(`${API_ENDPOINTS.ADMIN.ACCOUNTS}/${id}`);
  },

  listOrders(): Promise<OrderDto[]> {
    return apiGet<OrderDto[]>(API_ENDPOINTS.ADMIN.ORDERS);
  },

  listUserOrders(userId: number): Promise<OrderDto[]> {
    return apiGet<OrderDto[]>(`${API_ENDPOINTS.ADMIN.ORDERS}/user/${userId}`);
  },

  createOrder(payload: AdminCreateOrderRequest): Promise<OrderDto> {
    return apiPost<OrderDto>(API_ENDPOINTS.ADMIN.ORDERS, payload);
  },

  updateOrderStatus(orderId: number, status: string): Promise<OrderDto> {
    return apiPut<OrderDto>(`${API_ENDPOINTS.ADMIN.ORDERS}/${orderId}/status`, {
      status,
    });
  },

  listAuditLogs(): Promise<AuditLogDto[]> {
    return apiGet<AuditLogDto[]>(API_ENDPOINTS.ADMIN.AUDIT_LOGS);
  },

  getSmtpConfig(): Promise<SmtpConfigDto | null> {
    return apiGet<SmtpConfigDto | null>(API_ENDPOINTS.ADMIN.SMTP);
  },

  updateSmtpConfig(payload: {
    host: string;
    port: number;
    username: string;
    password?: string;
    fromEmail: string;
    fromName: string;
    useTls: boolean;
    useSsl: boolean;
    enabled: boolean;
  }): Promise<SmtpConfigDto> {
    return apiPut<SmtpConfigDto>(API_ENDPOINTS.ADMIN.SMTP, payload);
  },

  sendTestEmail(toEmail: string): Promise<void> {
    return apiPost<void>(`${API_ENDPOINTS.ADMIN.SMTP}/test`, { toEmail });
  },

  uploadImage(
    file: File,
    folder = 'general',
    oldPublicId?: string
  ): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return apiPost<CloudinaryUploadResult>(API_ENDPOINTS.ADMIN.MEDIA_UPLOAD, formData, {
      params: { folder, oldPublicId },
      timeout: UPLOAD_TIMEOUT_MS,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
