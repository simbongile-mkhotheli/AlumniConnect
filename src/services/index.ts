/**
 * Services Index
 * Central export point for all API services, configurations, and utilities
 */

// Core API Service
export { default as ApiService } from './api';

// Endpoints Configuration
export * from './endpoints';

// Individual Service Modules
import ApiService from './api';
import { shouldUseMockApi } from './useMockApi';
import { EventsService } from '../features/events/services'; // Updated import path
import { SponsorsService } from '../features/sponsors/services'; // Updated import path
import { ChaptersService } from '../features/chapters/services'; // Updated import path
import { MentorshipService } from '../features/mentorship/services'; // Updated import path
import { PartnersService } from '../features/partners/services'; // Updated import path
import { OpportunitiesService } from '../features/opportunities/services'; // Updated import path
import { QAService } from '../features/qa/services'; // Updated import path
import { SpotlightsService } from '../features/spotlights/services'; // Updated import path

// Export individual services for direct imports
export { EventsService };
export { SponsorsService };
export { PartnersService };
export { ChaptersService };
export { OpportunitiesService };
export { MentorshipService };
export { QAService };
export { SpotlightsService };

// Mock API Services
export * from './mockApi';

// Type Re-exports for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  FilterState,
  Sponsor,
  Partner,
  Event,
  Chapter,
  Opportunity,
  Mentorship,
  QAItem,
  Spotlight,
  User,
} from '../types';

/**
 * Service Factory
 * Creates and manages service instances
 */
export class ServiceFactory {
  private static services = new Map();

  /**
   * Create service instance
   */
  static createService<T>(ServiceClass: new () => T): T {
    const serviceName = ServiceClass.name;

    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, new ServiceClass());
    }

    return this.services.get(serviceName);
  }

  /**
   * Get all available services
   */
  static getServices(): string[] {
    return [
      'EventsService',
      'SponsorsService',
      'PartnersService',
      'ChaptersService',
      'OpportunitiesService',
      'MentorshipService',
      'QAService',
      'SpotlightsService',
    ];
  }

  /**
   * Get service by name
   */
  static getService(serviceName: string): any {
    const serviceMap: Record<string, any> = {
      EventsService,
      SponsorsService,
      PartnersService,
      ChaptersService,
      OpportunitiesService,
      MentorshipService,
      QAService,
      SpotlightsService,
    };

    return serviceMap[serviceName] || null;
  }
}

/**
 * Service Health Checker
 * Monitors API and service health
 */
export class ServiceHealth {
  /**
   * Check individual service health
   */
  static async checkServiceHealth(serviceName: string): Promise<{
    service: string;
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    timestamp: string;
  }> {
    const startTime = Date.now();

    try {
      const service = ServiceFactory.getService(serviceName);
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }

      // For mock services, check if they have a healthCheck method
      if (shouldUseMockApi()) {
        const mockApiHealth = await import('./mockApi');
        await mockApiHealth.MockApiHealth.checkAll();
      } else {
        // For real API, use the base API service health check
        await ApiService.healthCheck();
      }

      return {
        service: serviceName,
        status: 'healthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get API status
   */
  static async getStatus(): Promise<{
    api: 'online' | 'offline';
    mode: 'production' | 'mock';
    timestamp: string;
  }> {
    try {
      if (shouldUseMockApi()) {
        return {
          api: 'online',
          mode: 'mock',
          timestamp: new Date().toISOString(),
        };
      } else {
        await ApiService.healthCheck();
        return {
          api: 'online',
          mode: 'production',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        api: 'offline',
        mode: shouldUseMockApi() ? 'mock' : 'production',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get comprehensive health report
   */
  static async getHealthReport(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    api: 'online' | 'offline';
    mode: 'production' | 'mock';
    services: Array<{
      service: string;
      status: 'healthy' | 'unhealthy';
      responseTime: number;
    }>;
    timestamp: string;
    lastChecked: string;
  }> {
    const apiStatus = await this.getStatus();
    const services = ServiceFactory.getServices();
    const serviceHealthChecks = await Promise.all(
      services.map(service => this.checkServiceHealth(service))
    );

    const healthyServices = serviceHealthChecks.filter(
      s => s.status === 'healthy'
    ).length;
    const totalServices = serviceHealthChecks.length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (apiStatus.api === 'offline' || healthyServices === 0) {
      overallStatus = 'unhealthy';
    } else if (healthyServices < totalServices) {
      overallStatus = 'degraded';
    }

    return {
      overall: overallStatus,
      api: apiStatus.api,
      mode: apiStatus.mode,
      services: serviceHealthChecks.map(
        ({ service, status, responseTime }) => ({
          service,
          status,
          responseTime,
        })
      ),
      timestamp: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Cache Manager
 * Manages local storage cache for API responses
 */
export class CacheManager {
  private static readonly CACHE_PREFIX = 'alumni_connect_cache_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Clear all cached data
   */
  static clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clear cache for specific service
   */
  static clearService(serviceName: string): void {
    const keys = Object.keys(localStorage);
    const servicePrefix = `${this.CACHE_PREFIX}${serviceName.toLowerCase()}_`;

    keys.forEach(key => {
      if (key.startsWith(servicePrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clear expired cache entries
   */
  static clearExpired(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}');
          if (cached.expiry && cached.expiry < now) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    totalKeys: number;
    totalSize: number;
    serviceBreakdown: Record<string, number>;
    expiredEntries: number;
  } {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
    const now = Date.now();

    let totalSize = 0;
    let expiredEntries = 0;
    const serviceBreakdown: Record<string, number> = {};

    cacheKeys.forEach(key => {
      const value = localStorage.getItem(key) || '';
      totalSize += value.length;

      // Extract service name from key
      const serviceName = key.replace(this.CACHE_PREFIX, '').split('_')[0];
      serviceBreakdown[serviceName] = (serviceBreakdown[serviceName] || 0) + 1;

      // Check if expired
      try {
        const cached = JSON.parse(value);
        if (cached.expiry && cached.expiry < now) {
          expiredEntries++;
        }
      } catch (error) {
        expiredEntries++;
      }
    });

    return {
      totalKeys: cacheKeys.length,
      totalSize,
      serviceBreakdown,
      expiredEntries,
    };
  }

  /**
   * Optimize cache by removing expired and large unused items
   */
  static optimize(): {
    removedExpired: number;
    removedLarge: number;
    totalRemoved: number;
  } {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
    const now = Date.now();

    let removedExpired = 0;
    let removedLarge = 0;

    // Remove expired entries
    cacheKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key) || '';
        const cached = JSON.parse(value);

        if (cached.expiry && cached.expiry < now) {
          localStorage.removeItem(key);
          removedExpired++;
        } else if (value.length > 100000) {
          // Remove entries larger than 100KB
          localStorage.removeItem(key);
          removedLarge++;
        }
      } catch (error) {
        localStorage.removeItem(key);
        removedExpired++;
      }
    });

    return {
      removedExpired,
      removedLarge,
      totalRemoved: removedExpired + removedLarge,
    };
  }
}

/**
 * Batch Operations
 * Utility for performing multiple API calls with concurrency control
 */
export class BatchOperations {
  /**
   * Execute operations in parallel with concurrency limit
   */
  static async executeInParallel<T>(
    operations: Array<() => Promise<T>>,
    concurrency: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const operation of operations) {
      const promise = operation().then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Execute operations with retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  }
}

/**
 * Service Configuration
 */
export const serviceConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  retryCount: 3,
  retryDelay: 1000,
  cacheEnabled: true,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  batchSize: 10,
  concurrency: 3,
};

// Default export with all services and utilities
export default {
  // Services
  EventsService,
  SponsorsService,
  PartnersService,
  ChaptersService,
  OpportunitiesService,
  MentorshipService,
  QAService,
  SpotlightsService,

  // Utilities
  ServiceFactory,
  ServiceHealth,
  CacheManager,
  BatchOperations,

  // Configuration
  config: serviceConfig,

  // Core API
  ApiService,
};
