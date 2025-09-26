/**
 * Debug utility to check backend server status and data availability
 */

export class ServerDebugger {
  private static readonly API_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

  static async checkServerStatus(): Promise<void> {
    console.log('🔍 Checking Backend Server Status...');

    try {
    // Test server connectivity
    const healthResponse = await fetch(`${this.API_BASE}/health`);
      console.log(
        '✅ Server connectivity:',
        healthResponse.ok ? 'OK' : 'FAILED'
      );
    } catch (error) {
      console.error('❌ Server not reachable:', error);
      return;
    }

    // Test opportunities endpoint
    await this.testEndpoint('/opportunities', 'Opportunities');

    // Test mentorships endpoint
    await this.testEndpoint('/mentorships', 'Mentorships');
  }

  private static async testEndpoint(
    endpoint: string,
    name: string
  ): Promise<void> {
    try {
    const url = `${this.API_BASE}${endpoint}?page=1&limit=5`;
    const response = await fetch(url);
      const data = await response.json();

      console.log(`📊 ${name} Endpoint:`, {
        status: response.status,
        ok: response.ok,
        dataType: typeof data,
        isArray: Array.isArray(data),
        count: Array.isArray(data) ? data.length : 'N/A',
        hasSuccess: 'success' in data,
        successValue: data.success,
        hasData: 'data' in data,
        dataCount: data.data
          ? Array.isArray(data.data)
            ? data.data.length
            : 'Not array'
          : 'No data property',
        total: data.pagination?.total ?? 'unknown',
      });

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log(`📝 Sample ${name} item:`, data.data[0]);
      }
    } catch (error) {
      console.error(`❌ ${name} endpoint failed:`, error);
    }
  }

  static async checkDatabaseFile(): Promise<void> {
    console.log('🗄️ Checking database contents via API (counts)...');

    const endpoints = [
      { name: 'opportunities', path: '/opportunities' },
      { name: 'mentorships', path: '/mentorships' },
      { name: 'events', path: '/events' },
      { name: 'sponsors', path: '/sponsors' },
    ];

    const results: Record<string, number | string> = {};
    for (const ep of endpoints) {
      try {
        const res = await fetch(`${this.API_BASE}${ep.path}?page=1&limit=1`);
        if (!res.ok) {
          results[ep.name] = 'unreachable';
          continue;
        }
        const body = await res.json();
        const total = body?.pagination?.total ?? (Array.isArray(body?.data) ? body.data.length : 'unknown');
        results[ep.name] = total;
      } catch (e) {
        results[ep.name] = 'error';
      }
    }
    console.log('📋 Estimated record counts:', results);
  }
}
