import { API_ENDPOINTS, UPLOAD_TIMEOUT_MS } from '../constants/api';
import { apiGet, apiPost } from '../lib/api-client';
import { axiosInstance } from '../lib/axios';
import { DatabaseStatusDto, SqlPreviewDto } from '../types/api';

export const databaseService = {
  getStatus(): Promise<DatabaseStatusDto> {
    return apiGet<DatabaseStatusDto>(API_ENDPOINTS.ADMIN.DB_STATUS);
  },

  async exportSqlDump(): Promise<Blob> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.DB_EXPORT, {
      responseType: 'blob',
      timeout: UPLOAD_TIMEOUT_MS,
    });
    return res.data as Blob;
  },

  previewSql(file: File): Promise<SqlPreviewDto> {
    const formData = new FormData();
    formData.append('file', file);
    return apiPost<SqlPreviewDto>(API_ENDPOINTS.ADMIN.DB_PREVIEW, formData, {
      timeout: UPLOAD_TIMEOUT_MS,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  restoreSql(file: File, confirmed: boolean): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return apiPost<void>(API_ENDPOINTS.ADMIN.DB_RESTORE, formData, {
      params: { confirmed },
      timeout: UPLOAD_TIMEOUT_MS,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
