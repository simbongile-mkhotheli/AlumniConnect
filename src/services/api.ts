import axios from 'axios';
import type { ApiResponse, PaginatedResponse } from '../types';
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
    // Determine normalized base URL. We expect backend endpoints to live under /api.
    // If user configured VITE_API_BASE_URL without the trailing /api (e.g. https://service.onrender.com)
    // we'll still mount requests under /api by rewriting request URLs below.
    const configuredBase = import.meta.env.VITE_API_BASE_URL || '/api';
    this.client = axios.create({
      baseURL: configuredBase,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        if (import.meta.env.DEV) {
          console.log(
            `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
            config.data
          );
        }

        // If backend mounts everything under /api but the configured base URL does NOT include /api
        // (e.g. baseURL = https://service.onrender.com) and the request path starts with a single '/'
        // we prefix '/api' to avoid 404s like /events -> /api/events.
        try {
          const baseHasApi = /\/api\/?$/.test(this.client.defaults.baseURL || '');
          if (!baseHasApi && typeof config.url === 'string') {
            // Only rewrite root-relative (starts with '/') but not already '/api/...'
            if (config.url.startsWith('/') && !config.url.startsWith('/api/')) {
              config.url = `/api${config.url}`;
            }
          }
        } catch (e) {
          // Fail silent – never block the request
        }
        return config;
      },
      (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(
            `[API Response] ${response.status} ${response.config.url}`,
            response.data
          );
        }
        return response;
      },
      (error: AxiosError) => {
        console.error('[API Response Error]', error);

        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          // Forbidden - show access denied message
          console.warn('Access denied to resource');
        } else if (error.response?.status >= 500) {
          // Server error - show generic error message
          console.error('Server error occurred');
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Helper to normalize API responses
   * Handles both wrapped ({ data, success, message }) and unwrapped responses
   */
  private normalizeResponse<T>(responseData: any): ApiResponse<T> {
    // Check if response is already wrapped
    if (
      responseData &&
      typeof responseData === 'object' &&
      'success' in responseData
    ) {
      return responseData as ApiResponse<T>;
    }

    // If response is unwrapped, wrap it
    return {
      data: responseData,
      success: true,
      message: 'Request successful',
    };
  }

  /**
   * Helper to normalize paginated responses
   */
  private normalizePaginatedResponse<T>(
    responseData: any,
    page: number,
    limit: number
  ): PaginatedResponse<T> {
    // Check if response is already wrapped with pagination
    if (
      responseData &&
      typeof responseData === 'object' &&
      'pagination' in responseData
    ) {
      return responseData as PaginatedResponse<T>;
    }

    // Check if response is wrapped but without pagination
    if (
      responseData &&
      typeof responseData === 'object' &&
      'success' in responseData
    ) {
      const data = Array.isArray(responseData.data) ? responseData.data : [];
      return {
        data,
        pagination: {
          page,
          limit,
          total: data.length,
          totalPages: Math.ceil(data.length / limit),
        },
        success: responseData.success,
        message: responseData.message,
        error: responseData.error,
      };
    }

    // If response is raw array, wrap it with pagination
    const data = Array.isArray(responseData) ? responseData : [];
    return {
      data,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
      },
      success: true,
      message: 'Request successful',
    };
  }

  /**
   * Generic GET request
   */
  async get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return this.normalizeResponse<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return this.normalizeResponse<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return this.normalizeResponse<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data);
      return this.normalizeResponse<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return this.normalizeResponse<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  /**
   * Paginated GET request
   */
  async getPaginated<T>(
    url: string,
    page: number = 1,
    limit: number = 20,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.client.get(url, {
        params: {
          _page: page,
          _limit: limit,
          ...params,
        },
      });

      return this.normalizePaginatedResponse<T>(response.data, page, limit);
    } catch (error) {
      return this.handlePaginatedError<T>(error as AxiosError);
    }
  }

  /**
   * File upload request
   */
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
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });

      return this.normalizeResponse<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  /**
   * Bulk operations request
   */
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

      return this.normalizeResponse<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  /**
   * Handle API errors
   */
  private handleError<T>(error: AxiosError): ApiResponse<T> {
    const message =
      error.response?.data?.message || error.message || 'An error occurred';
    const statusCode = error.response?.status || 500;

    return {
      data: null as T,
      success: false,
      message,
      error: {
        code: statusCode,
        message,
        details: error.response?.data,
      },
    };
  }

  /**
   * Handle paginated API errors
   */
  private handlePaginatedError<T>(error: AxiosError): PaginatedResponse<T> {
    const message =
      error.response?.data?.message || error.message || 'An error occurred';
    const statusCode = error.response?.status || 500;

    return {
      data: [] as T[],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      success: false,
      message,
      error: {
        code: statusCode,
        message,
        details: error.response?.data,
      },
    };
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    return this.get('/health');
  }

  /**
   * Get API client instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Create singleton then re-export its methods as a plain object to cooperate with vi.mock('../api') style auto-mocking of functions.
const apiSingleton = new ApiServiceClass();

const exported: ApiClient = {
  get: apiSingleton.get.bind(apiSingleton),
  post: apiSingleton.post.bind(apiSingleton),
  put: apiSingleton.put.bind(apiSingleton),
  patch: apiSingleton.patch.bind(apiSingleton),
  delete: apiSingleton.delete.bind(apiSingleton),
  getPaginated: apiSingleton.getPaginated.bind(apiSingleton),
  uploadFile: apiSingleton.uploadFile.bind(apiSingleton),
  bulkOperation: apiSingleton.bulkOperation.bind(apiSingleton),
  healthCheck: apiSingleton.healthCheck.bind(apiSingleton),
  getClient: apiSingleton.getClient.bind(apiSingleton),
};

export default exported;
