import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types/api';
import { axiosInstance } from './axios';

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await axiosInstance.get<ApiResponse<T>>(url, config);
  return res.data.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axiosInstance.post<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axiosInstance.put<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

export async function apiDelete<T = void>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axiosInstance.delete<ApiResponse<T>>(url, config);
  return res.data.data;
}
