/**
 * Environment configuration debugger
 */
import { shouldUseMockApi } from '@shared/services';

export class EnvironmentDebugger {
  static checkConfiguration(): void {
    console.log('🔧 Environment Configuration Check:');
    console.log('================================');

    // Check all relevant environment variables
    const envVars = {
      VITE_ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    };

    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`${key}:`, value, `(${typeof value})`);
    });

  // Check mock API flag specifically (via central helper and raw env)
  const mockApiEnabled = shouldUseMockApi();
  const rawEnv = import.meta.env.VITE_ENABLE_MOCK_API;
  const localOverride = typeof localStorage !== 'undefined' ? localStorage.getItem('useMockApi') : null;
    console.log('\n🎯 Mock API Status:');
  console.log('Raw env value (VITE_ENABLE_MOCK_API):', rawEnv);
  console.log('LocalStorage override (useMockApi):', localOverride);
  console.log('Effective shouldUseMockApi():', mockApiEnabled ? 'YES' : 'NO');

    // Check API base URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log('\n🌐 API Configuration:');
  console.log('Base URL:', apiBaseUrl || '(not set)');
  console.log('Note: If not set, the app falls back to same-origin \'/api\' with Vite proxy.');

    // Warnings
    if (!mockApiEnabled) {
      console.warn('⚠️ WARNING: Mock API is disabled. Real API will be used.');
    }

    // No strict port expectation anymore
  }

  static validateEnvironmentFile(): void {
    console.log('\n📄 Environment File Validation:');
    console.log('Recommended .env.development content (optional):');
    console.log('# Leave VITE_ENABLE_MOCK_API unset to use Real API by default');
    console.log('# VITE_ENABLE_MOCK_API=false');
    console.log('VITE_API_BASE_URL=http://localhost:4000/api');
    console.log('\nNotes:');
    console.log('- Set VITE_ENABLE_MOCK_API=true only when you explicitly want to run against mocks.');
    console.log("- If VITE_API_BASE_URL isn't set, the app uses same-origin '/api' via Vite proxy in dev.");
  }
}
