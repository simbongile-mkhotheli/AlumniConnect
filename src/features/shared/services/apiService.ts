import axios from 'axios';
import type { ApiResponse, PaginatedResponse } from '@shared/types';

// Minimal public API typing so callers can use generics again while keeping spy-friendly plain object export.
export interface ApiClient {
  get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
  getPaginated<T>(
    url: string,
    page?: number,
    limit?: number,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>>;
  uploadFile<T>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>>;
  bulkOperation<T>(
    url: string,
    operation: string,
    ids: string[]
  ): Promise<ApiResponse<T>>;
  healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>>;
  getClient(): any;
}

// Define axios types locally to avoid import issues
type AxiosInstance = any;
type AxiosRequestConfig = any;
type AxiosResponse = any;
type AxiosError = any;

/**
 * Core API Service
 * Centralized HTTP client with interceptors and error handling
 * Handles both wrapped and unwrapped API responses for compatibility
 */
class ApiServiceClass {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private wrapResponse<T>(data: T, success: boolean = true, message?: string): ApiResponse<T> {
    return {
      data,
      success,
      message: message || (success ? 'Success' : 'Error'),
    };
  }

  private handleApiError(error: any): ApiResponse<any> {
    console.error('API Error:', error);
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';
    
    const errorCode = error.response?.status || 500;
    
    return {
      data: null,
      success: false,
      message: errorMessage,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    };
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      
      // Handle both wrapped and unwrapped responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      
      return this.wrapResponse(response.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      
      return this.wrapResponse(response.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      
      return this.wrapResponse(response.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data);
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      
      return this.wrapResponse(response.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      
      return this.wrapResponse(response.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async getPaginated<T>(
    url: string,
    page: number = 1,
    limit: number = 20,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    try {
      const queryParams = {
        page,
        limit,
        ...params,
      };

      const response = await this.client.get(url, { params: queryParams });
      
      // Handle both wrapped and unwrapped responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as PaginatedResponse<T>;
      }
      
      // If response is not wrapped, assume it's the data array and create pagination info
      return {
        data: response.data,
        pagination: {
          page,
          limit,
          total: response.data.length,
          totalPages: Math.ceil(response.data.length / limit),
        },
        success: true,
        message: 'Data retrieved successfully',
      };
    } catch (error) {
      const errorResponse = this.handleApiError(error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        success: false,
        message: errorResponse.message,
        error: errorResponse.error,
      };
    }
  }

  async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, JSON.stringify(value));
        });
      }

      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }

      return this.wrapResponse(response.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async bulkOperation<T>(
    url: string,
    operation: string,
    ids: string[]
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(`${url}/bulk`, {
        operation,
        ids,
      });

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }

      return this.wrapResponse(response.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await this.client.get('/health');
      
      return this.wrapResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  getClient() {
    return this.client;
  }
}

export const ApiService = new ApiServiceClass();
export default ApiService;