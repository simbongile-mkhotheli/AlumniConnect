import React, { useEffect, useState } from 'react';
import { OpportunitiesService } from '../../services/opportunitiesService';
import { MentorshipService } from '../../services/mentorshipService';

export const ManagementPagesDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  const runDiagnostic = async () => {
    console.log('🔍 Running Management Pages Diagnostic...');

    const results: any = {
      timestamp: new Date().toISOString(),
      opportunities: {},
      mentorships: {},
      environment: {
        VITE_ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API,
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      },
    };

    // Test Opportunities Service
    try {
      console.log('🔄 Testing OpportunitiesService...');
      const oppResponse = await OpportunitiesService.getOpportunities(1, 20);
      results.opportunities = {
        success: oppResponse.success,
        dataLength: oppResponse.data?.length || 0,
        data: oppResponse.data,
        error: oppResponse.error,
        message: oppResponse.message,
      };
      console.log('📊 Opportunities Response:', oppResponse);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      results.opportunities = {
        success: false,
        error: err.message,
        stack: err.stack,
      };
      console.error('❌ Opportunities Error:', err);
    }

    // Test Mentorship Service
    try {
      console.log('🔄 Testing MentorshipService...');
      const mentorResponse = await MentorshipService.getMentorships(1, 20);
      results.mentorships = {
        success: mentorResponse.success,
        dataLength: mentorResponse.data?.length || 0,
        data: mentorResponse.data,
        error: mentorResponse.error,
        message: mentorResponse.message,
      };
      console.log('📊 Mentorships Response:', mentorResponse);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      results.mentorships = {
        success: false,
        error: err.message,
        stack: err.stack,
      };
      console.error('❌ Mentorships Error:', err);
    }

    setDebugInfo(results);
    console.log('🎯 Diagnostic Complete:', results);
  };

  useEffect(() => {
    // Auto-run diagnostic when component mounts
    runDiagnostic();
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '12px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
        }}
      >
        🚨 Debug Empty Pages
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        border: '2px solid #dc3545',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 10000,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ margin: 0, color: '#dc3545' }}>
          🚨 Management Pages Debug Console
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={runDiagnostic}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px',
          }}
        >
          🔄 Re-run Diagnostic
        </button>
      </div>

      <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
        <h4>🌍 Environment:</h4>
        <pre
          style={{
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(debugInfo.environment, null, 2)}
        </pre>

        <h4>💼 Opportunities Service:</h4>
        <pre
          style={{
            backgroundColor: debugInfo.opportunities?.success
              ? '#d4edda'
              : '#f8d7da',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(debugInfo.opportunities, null, 2)}
        </pre>

        <h4>🤝 Mentorships Service:</h4>
        <pre
          style={{
            backgroundColor: debugInfo.mentorships?.success
              ? '#d4edda'
              : '#f8d7da',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(debugInfo.mentorships, null, 2)}
        </pre>
      </div>
    </div>
  );
};
