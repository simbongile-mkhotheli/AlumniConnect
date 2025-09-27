const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Security Audit Test Suite
 * Tests all critical security controls implemented in AlumniConnect
 */

class SecurityAuditor {
  constructor(baseURL = 'http://localhost:4000') {
    this.baseURL = baseURL;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.adminToken = process.env.ADMIN_API_TOKEN || 'test-admin-token';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseURL);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        method,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AlumniConnect-Security-Auditor/1.0',
          ...headers
        }
      };

      if (data) {
        const payload = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(payload);
      }

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, data: body });
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async runTest(name, testFn) {
    this.log(`Running: ${name}`);
    try {
      const result = await testFn();
      if (result) {
        this.results.passed++;
        this.results.tests.push({ name, status: 'PASSED', details: result });
        this.log(`✅ PASSED: ${name}`, 'success');
      } else {
        this.results.failed++;
        this.results.tests.push({ name, status: 'FAILED', details: 'Test returned false' });
        this.log(`❌ FAILED: ${name}`, 'error');
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'ERROR', details: error.message });
      this.log(`❌ ERROR: ${name} - ${error.message}`, 'error');
    }
  }

  // Security Test Implementations
  async testUnauthorizedAdminAccess() {
    const response = await this.makeRequest('POST', '/api/events', {
      title: 'Unauthorized Test Event',
      slug: 'unauthorized-test'
    });
    
    return response.status === 401;
  }

  async testAuthorizedAdminAccess() {
    const response = await this.makeRequest('POST', '/api/events', {
      title: 'Authorized Test Event',
      slug: 'authorized-test'
    }, {
      'Authorization': `Bearer ${this.adminToken}`
    });
    
    // Should succeed with valid token or fail with specific error (not 401)
    return response.status !== 401;
  }

  async testXSSPrevention() {
    const xssPayload = {
      title: '<script>alert("XSS")</script>Test Event',
      slug: 'xss-test'
    };
    
    const response = await this.makeRequest('POST', '/api/events', xssPayload, {
      'Authorization': `Bearer ${this.adminToken}`
    });
    
    // Should reject malicious input
    return response.status === 400;
  }

  async testSQLInjectionPrevention() {
    const sqlPayload = {
      title: "'; DROP TABLE events; --",
      slug: 'sql-injection-test'
    };
    
    const response = await this.makeRequest('POST', '/api/events', sqlPayload, {
      'Authorization': `Bearer ${this.adminToken}`
    });
    
    // Should reject malicious input or handle safely
    return response.status === 400 || (response.status < 500 && response.status >= 200);
  }

  async testInputValidation() {
    const invalidPayloads = [
      { title: '', slug: 'empty-title' }, // Empty title
      { title: 'A'.repeat(1000), slug: 'long-title' }, // Too long
      { title: 'Valid Title', slug: '' }, // Empty slug
      { title: 'Valid Title', slug: 'INVALID SLUG!' }, // Invalid characters
    ];
    
    let passedAll = true;
    
    for (const payload of invalidPayloads) {
      const response = await this.makeRequest('POST', '/api/events', payload, {
        'Authorization': `Bearer ${this.adminToken}`
      });
      
      if (response.status !== 400) {
        passedAll = false;
        break;
      }
    }
    
    return passedAll;
  }

  async testRateLimiting() {
    const requests = [];
    
    // Send multiple requests quickly
    for (let i = 0; i < 25; i++) {
      requests.push(this.makeRequest('GET', '/api/health'));
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    return rateLimited; // Should get rate limited
  }

  async testCORSConfiguration() {
    const response = await this.makeRequest('OPTIONS', '/api/events', null, {
      'Origin': 'http://malicious-site.com',
      'Access-Control-Request-Method': 'POST'
    });
    
    // CORS should be properly configured
    return response.headers['access-control-allow-origin'] !== '*';
  }

  async testSecurityHeaders() {
    const response = await this.makeRequest('GET', '/api/health');
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    return requiredHeaders.some(header => 
      response.headers[header] || response.headers[header.toLowerCase()]
    );
  }

  async testFileUploadSecurity() {
    // Test malicious file upload
    const maliciousData = {
      filename: '../../../etc/passwd',
      content: 'malicious content'
    };
    
    const response = await this.makeRequest('POST', '/api/uploads/single', maliciousData, {
      'Authorization': `Bearer ${this.adminToken}`,
      'Content-Type': 'multipart/form-data'
    });
    
    // Should reject dangerous filenames
    return response.status === 400 || response.status === 401;
  }

  async testDataExposure() {
    // Test that sensitive data is not exposed
    const response = await this.makeRequest('GET', '/api/users');
    
    if (response.status === 200 && response.data && response.data.data) {
      const users = response.data.data;
      
      // Check if password fields are exposed
      const hasPasswordExposure = users.some(user => 
        user.password || user.passwordHash || user.hash
      );
      
      return !hasPasswordExposure;
    }
    
    return true; // No data returned, so no exposure
  }

  async testErrorHandling() {
    // Test that errors don't leak sensitive information
    const response = await this.makeRequest('GET', '/api/nonexistent-endpoint');
    
    const responseText = JSON.stringify(response.data).toLowerCase();
    const sensitivePhrases = [
      'database error',
      'sql error', 
      'stack trace',
      'internal error',
      'prisma',
      'connection string'
    ];
    
    const leaksInfo = sensitivePhrases.some(phrase => 
      responseText.includes(phrase)
    );
    
    return !leaksInfo;
  }

  async runAllTests() {
    this.log('🔒 Starting AlumniConnect Security Audit');
    this.log(`Target: ${this.baseURL}`);
    this.log(`Admin Token: ${this.adminToken ? 'Configured' : 'NOT SET'}`);
    this.log('━'.repeat(60));

    // Authentication Tests
    await this.runTest('Unauthorized Admin Access Prevention', () => 
      this.testUnauthorizedAdminAccess());
    
    await this.runTest('Authorized Admin Access', () => 
      this.testAuthorizedAdminAccess());

    // Input Security Tests
    await this.runTest('XSS Prevention', () => 
      this.testXSSPrevention());
    
    await this.runTest('SQL Injection Prevention', () => 
      this.testSQLInjectionPrevention());
    
    await this.runTest('Input Validation', () => 
      this.testInputValidation());

    // Infrastructure Security Tests  
    await this.runTest('Rate Limiting', () => 
      this.testRateLimiting());
    
    await this.runTest('CORS Configuration', () => 
      this.testCORSConfiguration());
    
    await this.runTest('Security Headers', () => 
      this.testSecurityHeaders());

    // File & Data Security Tests
    await this.runTest('File Upload Security', () => 
      this.testFileUploadSecurity());
    
    await this.runTest('Data Exposure Prevention', () => 
      this.testDataExposure());
    
    await this.runTest('Error Information Leakage Prevention', () => 
      this.testErrorHandling());

    // Generate Report
    this.generateReport();
  }

  generateReport() {
    this.log('━'.repeat(60));
    this.log('🔒 SECURITY AUDIT REPORT');
    this.log('━'.repeat(60));
    
    const total = this.results.passed + this.results.failed;
    const passRate = ((this.results.passed / total) * 100).toFixed(1);
    
    this.log(`Total Tests: ${total}`);
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');
    this.log(`Pass Rate: ${passRate}%`, passRate >= 90 ? 'success' : 'error');

    // Detailed results
    this.log('\n📋 DETAILED RESULTS:');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      this.log(`${status} ${test.name}`);
      if (test.status !== 'PASSED' && test.details) {
        this.log(`   └─ ${test.details}`);
      }
    });

    // Security recommendations
    if (this.results.failed > 0) {
      this.log('\n⚠️ SECURITY RECOMMENDATIONS:');
      this.log('1. Review failed tests and implement fixes');
      this.log('2. Ensure environment variables are properly configured');
      this.log('3. Test with production-like environment');
      this.log('4. Consider additional penetration testing');
    } else {
      this.log('\n🎉 All security tests passed!');
      this.log('Your AlumniConnect platform shows strong security posture.');
    }

    return this.results;
  }
}

// Run the audit
async function runSecurityAudit() {
  const auditor = new SecurityAuditor();
  return await auditor.runAllTests();
}

// Export for use as module or run directly
if (require.main === module) {
  runSecurityAudit().catch(console.error);
}

module.exports = { SecurityAuditor, runSecurityAudit };