/**
 * Service layer debugger for opportunities and mentorships
 */

import { EventsService } from '@features/events/services';
import { SponsorsService } from '@features/sponsors/services';
import { ChaptersService } from '@features/chapters/services';
import { QAService } from '@features/qa/services';
import { OpportunitiesService } from '@features/opportunities/services';
import { MentorshipService } from '@features/mentorship/services';
import { shouldUseMockApi } from '@shared/services';

export class ServiceDebugger {
  static async debugOpportunitiesService(): Promise<void> {
    console.log('🔍 Debugging Opportunities Service...');
    console.log('=====================================');

    try {
  // Report effective mock/real mode
  const useMockApi = shouldUseMockApi();
      console.log('📊 Service Configuration:');
      console.log('- useMockApi():', useMockApi);
      console.log('- Service will use:', useMockApi ? 'Mock API' : 'Real API');

      // Test basic getOpportunities call
      console.log('\n📞 Testing getOpportunities()...');
      const startTime = Date.now();
      const response = await OpportunitiesService.getOpportunities(1, 10);
      const endTime = Date.now();

      console.log('⏱️ Response time:', `${endTime - startTime}ms`);
      console.log('📋 Response structure:', {
        type: typeof response,
        hasSuccess: 'success' in response,
        success: response.success,
        hasData: 'data' in response,
        dataType: typeof response.data,
        isDataArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        hasError: 'error' in response,
        error: response.error,
      });

      if (response.success && Array.isArray(response.data)) {
        console.log('✅ Service working correctly');
        console.log('📝 Sample opportunity:', response.data[0]);
      } else {
        console.error('❌ Service response invalid:', response);
      }

      // Test with filters
      console.log('\n🔍 Testing with filters...');
      const filteredResponse = await OpportunitiesService.getOpportunities(
        1,
        10,
        {
          status: 'active',
          type: '',
          level: '',
          search: '',
        }
      );
      console.log(
        '📊 Filtered response count:',
        Array.isArray(filteredResponse.data)
          ? filteredResponse.data.length
          : 'Invalid'
      );
    } catch (error) {
      console.error('❌ Opportunities Service Error:', error);
    }
  }

  static async debugMentorshipService(): Promise<void> {
    console.log('\n🔍 Debugging Mentorship Service...');
    console.log('===================================');

    try {
  // Report effective mock/real mode
  const useMockApi = shouldUseMockApi();
      console.log('📊 Service Configuration:');
      console.log('- useMockApi():', useMockApi);
      console.log('- Service will use:', useMockApi ? 'Mock API' : 'Real API');

      // Test basic getMentorships call
      console.log('\n📞 Testing getMentorships()...');
      const startTime = Date.now();
      const response = await MentorshipService.getMentorships(1, 10);
      const endTime = Date.now();

      console.log('⏱️ Response time:', `${endTime - startTime}ms`);
      console.log('📋 Response structure:', {
        type: typeof response,
        hasSuccess: 'success' in response,
        success: response.success,
        hasData: 'data' in response,
        dataType: typeof response.data,
        isDataArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        hasError: 'error' in response,
        error: response.error,
      });

      if (response.success && Array.isArray(response.data)) {
        console.log('✅ Service working correctly');
        console.log('📝 Sample mentorship:', response.data[0]);
      } else {
        console.error('❌ Service response invalid:', response);
      }

      // Test with filters
      console.log('\n🔍 Testing with filters...');
      const filteredResponse = await MentorshipService.getMentorships(1, 10, {
        status: 'active',
        type: '',
        category: '',
        search: '',
      });
      console.log(
        '📊 Filtered response count:',
        Array.isArray(filteredResponse.data)
          ? filteredResponse.data.length
          : 'Invalid'
      );
    } catch (error) {
      console.error('❌ Mentorship Service Error:', error);
    }
  }

  static async runFullServiceDebug(): Promise<void> {
    console.log('🚀 Running Full Service Debug...');
    console.log('=================================');

    await this.debugOpportunitiesService();
    await this.debugMentorshipService();

    console.log(
      '\n✅ Service debugging complete. Check console output above for issues.'
    );
  }
}
