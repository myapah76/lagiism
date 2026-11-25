export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://api.yourdomain.com/api'
    : 'http://localhost:8080/api');

export const DEFAULT_TIMEOUT_MS = 30000;
export const UPLOAD_TIMEOUT_MS = 90000;

export const API_ENDPOINTS = {
  AUTH: {
    CSRF: '/auth/csrf',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PUBLIC: {
    HEALTH: '/public/health',
    HOMEPAGE: '/public/homepage',
    PRODUCTS: '/public/catalog/products',
    CATEGORIES: '/public/catalog/categories',
  },
  ADMIN: {
    CMS_HOMEPAGE: '/admin/cms/homepage',
    CMS_HERO: '/admin/cms/hero',
    CMS_SECTIONS: '/admin/cms/sections',
    CMS_REVIEWS: '/admin/cms/reviews',
    CMS_SETTINGS: '/admin/cms/settings',
    PRODUCTS: '/admin/catalog/products',
    CATEGORIES: '/admin/catalog/categories',
    ACCOUNTS: '/admin/accounts',
    AUDIT_LOGS: '/admin/audit-logs',
    SMTP: '/admin/smtp',
    MEDIA_UPLOAD: '/admin/media/upload',
    DB_STATUS: '/admin/database/status',
    DB_EXPORT: '/admin/database/export',
    DB_PREVIEW: '/admin/database/preview',
    DB_RESTORE: '/admin/database/restore',
  },
} as const;
