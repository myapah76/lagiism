import { API_ENDPOINTS } from '../constants/api';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api-client';
import {
  CmsHeroDto,
  CmsReviewDto,
  CmsSectionDto,
  HomepageAggregateDto,
} from '../types/api';

export const cmsService = {
  getPublicHomepage(): Promise<HomepageAggregateDto> {
    return apiGet<HomepageAggregateDto>(API_ENDPOINTS.PUBLIC.HOMEPAGE);
  },

  updateHero(payload: Omit<CmsHeroDto, 'id' | 'updatedAt'>): Promise<CmsHeroDto> {
    return apiPut<CmsHeroDto>(API_ENDPOINTS.ADMIN.CMS_HERO, payload);
  },

  listSections(): Promise<CmsSectionDto[]> {
    return apiGet<CmsSectionDto[]>(API_ENDPOINTS.ADMIN.CMS_SECTIONS);
  },

  createSection(payload: Omit<CmsSectionDto, 'id' | 'updatedAt'>): Promise<CmsSectionDto> {
    return apiPost<CmsSectionDto>(API_ENDPOINTS.ADMIN.CMS_SECTIONS, payload);
  },

  updateSection(
    id: number,
    payload: Omit<CmsSectionDto, 'id' | 'updatedAt'>
  ): Promise<CmsSectionDto> {
    return apiPut<CmsSectionDto>(`${API_ENDPOINTS.ADMIN.CMS_SECTIONS}/${id}`, payload);
  },

  deleteSection(id: number): Promise<void> {
    return apiDelete(`${API_ENDPOINTS.ADMIN.CMS_SECTIONS}/${id}`);
  },

  listReviews(): Promise<CmsReviewDto[]> {
    return apiGet<CmsReviewDto[]>(API_ENDPOINTS.ADMIN.CMS_REVIEWS);
  },

  createReview(payload: Omit<CmsReviewDto, 'id' | 'createdAt'>): Promise<CmsReviewDto> {
    return apiPost<CmsReviewDto>(API_ENDPOINTS.ADMIN.CMS_REVIEWS, payload);
  },

  deleteReview(id: number): Promise<void> {
    return apiDelete(`${API_ENDPOINTS.ADMIN.CMS_REVIEWS}/${id}`);
  },

  updateSettings(updates: Record<string, string>): Promise<Record<string, string>> {
    return apiPut<Record<string, string>>(API_ENDPOINTS.ADMIN.CMS_SETTINGS, updates);
  },
};
