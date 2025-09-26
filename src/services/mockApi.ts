/**
 * Mock API Services
 * Central export for all mock API implementations
 */

// Import all mock API services
export { MentorshipsMockApiService } from './mockApis/mentorshipsMockApi';
export { QAMockApiService } from './mockApis/qaMockApi';
export { EventsMockApiService } from './mockApis/eventsMockApi';
export { SponsorsMockApiService } from './mockApis/sponsorsMockApi';
export { PartnersMockApiService } from './mockApis/partnersMockApi';
export { ChaptersMockApiService } from './mockApis/chaptersMockApi';
export { OpportunitiesMockApiService } from './mockApis/opportunitiesMockApi';
export { SpotlightsMockApiService } from './mockApis/spotlightsMockApi';

// Health check for all mock APIs
export const MockApiHealth = {
  async checkAll(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, { status: string; responseTime: number }>;
    timestamp: string;
  }> {
    const startTime = Date.now();
    const services: Record<string, { status: string; responseTime: number }> =
      {};

    try {
      // Check each service
      const checks = [
        {
          name: 'mentorships',
          check: () => MentorshipsMockApiService.healthCheck(),
        },
        { name: 'qa', check: () => QAMockApiService.healthCheck() },
        { name: 'events', check: () => EventsMockApiService.healthCheck() },
        { name: 'sponsors', check: () => SponsorsMockApiService.healthCheck() },
        { name: 'partners', check: () => PartnersMockApiService.healthCheck() },
        { name: 'chapters', check: () => ChaptersMockApiService.healthCheck() },
        {
          name: 'opportunities',
          check: () => OpportunitiesMockApiService.healthCheck(),
        },
        {
          name: 'spotlights',
          check: () => SpotlightsMockApiService.healthCheck(),
        },
      ];

      for (const { name, check } of checks) {
        const serviceStartTime = Date.now();
        try {
          await check();
          services[name] = {
            status: 'healthy',
            responseTime: Date.now() - serviceStartTime,
          };
        } catch (error) {
          services[name] = {
            status: 'unhealthy',
            responseTime: Date.now() - serviceStartTime,
          };
        }
      }

      const healthyServices = Object.values(services).filter(
        s => s.status === 'healthy'
      ).length;
      const totalServices = Object.keys(services).length;

      let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (healthyServices === 0) {
        overallStatus = 'unhealthy';
      } else if (healthyServices < totalServices) {
        overallStatus = 'degraded';
      }

      return {
        status: overallStatus,
        services,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

// Import and re-export individual services
import { MentorshipsMockApiService } from './mockApis/mentorshipsMockApi';
import { QAMockApiService } from './mockApis/qaMockApi';
import { EventsMockApiService } from './mockApis/eventsMockApi';
import { SponsorsMockApiService } from './mockApis/sponsorsMockApi';
import { PartnersMockApiService } from './mockApis/partnersMockApi';
import { ChaptersMockApiService } from './mockApis/chaptersMockApi';
import { OpportunitiesMockApiService } from './mockApis/opportunitiesMockApi';
import { SpotlightsMockApiService } from './mockApis/spotlightsMockApi';

// Export default configuration
export default {
  enabled: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  delay: parseInt(import.meta.env.VITE_MOCK_API_DELAY || '300'),
  services: {
    mentorships: MentorshipsMockApiService,
    qa: QAMockApiService,
    events: EventsMockApiService,
    sponsors: SponsorsMockApiService,
    partners: PartnersMockApiService,
    chapters: ChaptersMockApiService,
    opportunities: OpportunitiesMockApiService,
    spotlights: SpotlightsMockApiService,
  },
  health: MockApiHealth,
};
