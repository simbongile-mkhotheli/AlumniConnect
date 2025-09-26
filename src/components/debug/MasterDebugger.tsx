import React, { useState, useEffect } from 'react';
import { ServerDebugger } from '../../utils/debug-server-check';
import { EnvironmentDebugger } from '../../utils/environment-debugger';
import { ServiceDebugger } from '../../utils/service-debugger';

export const MasterDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'server' | 'env' | 'services' | 'summary'
  >('summary');
  const [debugResults, setDebugResults] = useState<any>({});

  const runFullDiagnostic = async () => {
    console.log('🚀 Starting Full Diagnostic...');
    console.log('===============================');

    // Environment check
    console.log('\n1️⃣ Environment Configuration:');
    EnvironmentDebugger.checkConfiguration();
    EnvironmentDebugger.validateEnvironmentFile();

    // Server check
    console.log('\n2️⃣ Server Status:');
    await ServerDebugger.checkServerStatus();
    await ServerDebugger.checkDatabaseFile();

    // Service check
    console.log('\n3️⃣ Service Layer:');
    await ServiceDebugger.runFullServiceDebug();

    console.log('\n✅ Full diagnostic complete! Check console output above.');
    console.log('🔍 Look for ❌ (errors) and ⚠️ (warnings) in the output.');
  };

  useEffect(() => {
    // Auto-run diagnostic on mount
    if (isVisible) {
      runFullDiagnostic();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 20px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
        }}
      >
        🚨 Debug Empty Data Issue
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50px',
        left: '50px',
        right: '50px',
        bottom: '50px',
        background: 'white',
        border: '3px solid #dc3545',
        borderRadius: '12px',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '2px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8f9fa',
        }}
      >
        <h2 style={{ margin: 0, color: '#dc3545' }}>
          🚨 Alumni Connect Debug Console
        </h2>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6c757d',
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e9ecef',
          background: '#f8f9fa',
        }}
      >
        {[
          { key: 'summary', label: '📋 Summary' },
          { key: 'env', label: '🔧 Environment' },
          { key: 'server', label: '🖥️ Server' },
          { key: 'services', label: '⚙️ Services' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === tab.key ? 'white' : 'transparent',
              borderBottom:
                activeTab === tab.key ? '2px solid #dc3545' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto',
        }}
      >
        {activeTab === 'summary' && (
          <div>
            <h3>🎯 Quick Diagnosis</h3>
            <p>
              This debug console will help identify why opportunities and
              mentorships are showing as empty.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={runFullDiagnostic}
                style={{
                  padding: '12px 24px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginRight: '10px',
                }}
              >
                🚀 Run Full Diagnostic
              </button>
            </div>

            <div
              style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '6px',
              }}
            >
              <h4>Common Issues to Check:</h4>
              <ul>
                <li>❌ Mock server not reachable at your configured API base (VITE_API_BASE_URL or /api)</li>
                <li>❌ VITE_ENABLE_MOCK_API not set to 'true'</li>
                <li>❌ Database file (db.json) missing or empty</li>
                <li>❌ Service layer not using mock API</li>
                <li>❌ Filters too restrictive</li>
                <li>❌ API response format mismatch</li>
              </ul>
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                background: '#d4edda',
                borderRadius: '6px',
              }}
            >
              <h4>✅ How to Fix:</h4>
              <ol>
                <li>Open browser console (F12)</li>
                <li>Click "Run Full Diagnostic" above</li>
                <li>Look for ❌ errors and ⚠️ warnings</li>
                <li>Follow the specific instructions for each issue</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'env' && (
          <div>
            <h3>🔧 Environment Configuration</h3>
            <button
              onClick={() => EnvironmentDebugger.checkConfiguration()}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}
            >
              Check Environment
            </button>
            <div
              style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '6px',
              }}
            >
              <p>Check the browser console for environment variable details.</p>
              <p>
                <strong>Expected values:</strong>
              </p>
              <pre
                style={{
                  background: '#e9ecef',
                  padding: '10px',
                  borderRadius: '4px',
                }}
              >
                {`VITE_ENABLE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:4000/api`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'server' && (
          <div>
            <h3>🖥️ Server Status</h3>
            <button
              onClick={() => ServerDebugger.checkServerStatus()}
              style={{
                padding: '8px 16px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '15px',
                marginRight: '10px',
              }}
            >
              Check Server
            </button>
            <button
              onClick={() => ServerDebugger.checkDatabaseFile()}
              style={{
                padding: '8px 16px',
                background: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}
            >
              Check Database
            </button>
            <div
              style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '6px',
              }}
            >
              <p>
                Check the browser console for server connectivity and data
                availability.
              </p>
              <p>
                Use the health check to verify the real backend:
              </p>
              <pre
                style={{
                  background: '#e9ecef',
                  padding: '10px',
                  borderRadius: '4px',
                }}
              >
                {`GET http://localhost:4000/api/health`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <h3>⚙️ Service Layer</h3>
            <button
              onClick={() => ServiceDebugger.runFullServiceDebug()}
              style={{
                padding: '8px 16px',
                background: '#fd7e14',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}
            >
              Test Services
            </button>
            <div
              style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '6px',
              }}
            >
              <p>
                Check the browser console for service layer testing results.
              </p>
              <p>
                This will test both OpportunitiesService and MentorshipService
                to ensure they're working correctly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '15px 20px',
          borderTop: '1px solid #e9ecef',
          background: '#f8f9fa',
          fontSize: '12px',
          color: '#6c757d',
        }}
      >
        💡 Tip: Keep browser console open (F12) to see detailed debug
        information
      </div>
    </div>
  );
};
