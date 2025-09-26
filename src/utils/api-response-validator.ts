/**
 * API Response validation utility
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponseValidator {
  static validateApiResponse<T>(
    response: any,
    expectedType: string
  ): response is ApiResponse<T> {
    console.log(`🔍 Validating ${expectedType} response:`, response);

    if (!response) {
      console.error(`❌ ${expectedType}: Response is null/undefined`);
      return false;
    }

    if (typeof response !== 'object') {
      console.error(
        `❌ ${expectedType}: Response is not an object`,
        typeof response
      );
      return false;
    }

    // Check for success property
    if (!('success' in response)) {
      console.error(`❌ ${expectedType}: Response missing 'success' property`);
      return false;
    }

    if (typeof response.success !== 'boolean') {
      console.error(
        `❌ ${expectedType}: 'success' property is not boolean`,
        typeof response.success
      );
      return false;
    }

    if (!response.success) {
      console.error(
        `❌ ${expectedType}: Response indicates failure`,
        response.error || response.message
      );
      return false;
    }

    // Check for data property
    if (!('data' in response)) {
      console.error(`❌ ${expectedType}: Response missing 'data' property`);
      return false;
    }

    console.log(`✅ ${expectedType}: Valid response structure`);
    return true;
  }

  static validateArrayResponse<T extends object>(
    response: any,
    expectedType: string
  ): response is ApiResponse<T[]> {
    if (!this.validateApiResponse<T[]>(response, expectedType)) {
      return false;
    }

    if (!Array.isArray(response.data)) {
      console.error(
        `❌ ${expectedType}: Data is not an array`,
        typeof response.data
      );
      console.log('Data value:', response.data);
      return false;
    }

    console.log(
      `✅ ${expectedType}: Valid array response with ${response.data.length} items`
    );

    if (
      response.data.length > 0 &&
      response.data[0] &&
      typeof response.data[0] === 'object'
    ) {
      console.log(
        `📝 ${expectedType}: Sample item structure:`,
        Object.keys(response.data[0])
      );
    }

    return true;
  }

  static validatePaginatedResponse<T extends object>(
    response: any,
    expectedType: string
  ): response is PaginatedResponse<T> {
    if (!this.validateArrayResponse<T>(response, expectedType)) {
      return false;
    }

    // Check pagination info (optional)
    if ('pagination' in response) {
      const pagination = response.pagination;
      console.log(`📊 ${expectedType}: Pagination info:`, pagination);

      if (typeof pagination !== 'object' || pagination === null) {
        console.warn(`⚠️ ${expectedType}: Pagination is not an object`);
      } else {
        const requiredPaginationFields = [
          'page',
          'limit',
          'total',
          'totalPages',
        ];
        const missingFields = requiredPaginationFields.filter(
          field => !(field in pagination)
        );

        if (missingFields.length > 0) {
          console.warn(
            `⚠️ ${expectedType}: Missing pagination fields:`,
            missingFields
          );
        }
      }
    } else {
      console.log(`ℹ️ ${expectedType}: No pagination info provided`);
    }

    return true;
  }

  static logResponseDetails(response: any, context: string): void {
    console.group(`📋 ${context} Response Details`);

    console.log('Response type:', typeof response);
    console.log('Response keys:', response ? Object.keys(response) : 'N/A');

    if (response) {
      console.log('Success:', response.success);
      console.log('Message:', response.message);
      console.log('Error:', response.error);
      console.log('Data type:', typeof response.data);
      console.log('Data is array:', Array.isArray(response.data));
      console.log(
        'Data length:',
        Array.isArray(response.data) ? response.data.length : 'N/A'
      );

      if (response.pagination) {
        console.log('Pagination:', response.pagination);
      }
    }

    console.groupEnd();
  }

  static createMockValidResponse<T>(
    data: T[],
    message = 'Success'
  ): ApiResponse<T[]> {
    return {
      data,
      success: true,
      message,
    };
  }

  static createMockErrorResponse(
    message = 'Error',
    error?: any
  ): ApiResponse<never> {
    return {
      data: null as never,
      success: false,
      message,
      error,
    };
  }
}
