import { API_ENDPOINTS, UPLOAD_TIMEOUT_MS } from '../constants/api';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api-client';
import {
  AccountDto,
  AuditLogDto,
  CloudinaryUploadResult,
  SmtpConfigDto,
} from '../types/api';

export const adminService = {
  listAccounts(): Promise<AccountDto[]> {
    return apiGet<AccountDto[]>(API_ENDPOINTS.ADMIN.ACCOUNTS);
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
