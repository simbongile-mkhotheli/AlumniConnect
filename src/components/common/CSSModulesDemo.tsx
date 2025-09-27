import React, { useState } from 'react';
import { LoadingSpinner, CardSkeleton, LoadingOverlay } from './LoadingSpinner';
import { 
  LoadingSpinnerModular, 
  CardSkeletonModular, 
  LoadingOverlayModular 
} from './LoadingSpinnerModular';

interface CSSModulesDemoProps {}

export const CSSModulesDemo: React.FC<CSSModulesDemoProps> = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        CSS Modules Migration Demo
      </h1>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>
          🎯 Proof of Concept: LoadingSpinner Component
        </h2>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Side-by-side comparison of Vanilla CSS vs CSS Modules implementation
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* Original Vanilla CSS Implementation */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#dc2626' }}>
            ❌ Current: Vanilla CSS (Global)
          </h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Loading Spinners</h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <LoadingSpinner size="small" text="Small" />
              <LoadingSpinner size="medium" text="Medium" />
              <LoadingSpinner size="large" text="Large" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <LoadingSpinner color="primary" text="Primary" />
              <LoadingSpinner color="secondary" text="Secondary" />
              <LoadingSpinner color="white" text="White" />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Card Skeleton</h4>
            <CardSkeleton lines={4} />
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem' }}>Loading Overlay</h4>
            <LoadingOverlay isLoading={showOverlay}>
              <div style={{ 
                height: '100px', 
                background: '#f3f4f6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '4px'
              }}>
                Content behind overlay
              </div>
            </LoadingOverlay>
            <button 
              onClick={() => setShowOverlay(!showOverlay)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Toggle Overlay
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
            <strong style={{ color: '#dc2626' }}>Issues:</strong>
            <ul style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
              <li>Global CSS conflicts</li>
              <li>No scoping protection</li>
              <li>Hard to maintain</li>
              <li>Risk of style leakage</li>
            </ul>
          </div>
        </div>

        {/* New CSS Modules Implementation */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#059669' }}>
            ✅ New: CSS Modules (Scoped)
          </h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Enhanced Loading Spinners</h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Size Variants:</strong>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <LoadingSpinnerModular size="small" text="Small" />
                <LoadingSpinnerModular size="medium" text="Medium" />
                <LoadingSpinnerModular size="large" text="Large" />
                <LoadingSpinnerModular size="extraLarge" text="XL" />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Animation Variants:</strong>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <LoadingSpinnerModular variant="spin" text="Spin" />
                <LoadingSpinnerModular variant="bounce" text="Bounce" />
                <LoadingSpinnerModular variant="pulse" text="Pulse" />
                <LoadingSpinnerModular variant="grow" text="Grow" />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Special Variants:</strong>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <LoadingSpinnerModular variant="dots" color="primary" text="Dots" />
                <LoadingSpinnerModular variant="ring" color="gradient" text="Ring" />
                <LoadingSpinnerModular variant="bars" color="gradientSuccess" text="Bars" />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Color Variants:</strong>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <LoadingSpinnerModular color="primary" text="Primary" />
                <LoadingSpinnerModular color="success" text="Success" />
                <LoadingSpinnerModular color="warning" text="Warning" />
                <LoadingSpinnerModular color="error" text="Error" />
                <LoadingSpinnerModular color="gradient" text="Gradient" />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Progress Spinner:</strong>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <LoadingSpinnerModular 
                  variant="ring" 
                  color="primary" 
                  showProgress={true} 
                  progress={75} 
                  text="Loading 75%" 
                />
                <LoadingSpinnerModular 
                  variant="spin" 
                  color="success" 
                  showProgress={true} 
                  progress={45} 
                  text="Progress" 
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Card Skeleton</h4>
            <CardSkeletonModular lines={4} />
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem' }}>Loading Overlay</h4>
            <LoadingOverlayModular isLoading={showOverlay}>
              <div style={{ 
                height: '100px', 
                background: '#f3f4f6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '4px'
              }}>
                Content behind overlay
              </div>
            </LoadingOverlayModular>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
            <strong style={{ color: '#059669' }}>Benefits:</strong>
            <ul style={{ marginTop: '0.5rem', color: '#059669', fontSize: '0.875rem' }}>
              <li>✅ Scoped CSS classes</li>
              <li>✅ No naming conflicts</li>
              <li>✅ Better maintainability</li>
              <li>✅ Type-safe class names</li>
              <li>✅ Automatic optimization</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>🔍 Developer Tools Comparison</h3>
        <p style={{ marginBottom: '1rem' }}>
          Open browser dev tools and inspect the elements above to see the difference:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <strong>Vanilla CSS:</strong>
            <code style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
              class="animate-spin rounded-full..."
            </code>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Generic class names, potential conflicts
            </p>
          </div>
          <div>
            <strong>CSS Modules:</strong>
            <code style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#dcfce7', borderRadius: '4px' }}>
              class="LoadingSpinner__spinner___a1b2c"
            </code>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Scoped class names, no conflicts possible
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>📊 Migration Benefits Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>🛡️ Isolation:</strong>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              CSS classes are automatically scoped to prevent conflicts
            </p>
          </div>
          <div>
            <strong>🔧 Maintainability:</strong>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Easier to refactor and maintain component styles
            </p>
          </div>
          <div>
            <strong>⚡ Performance:</strong>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Dead code elimination and optimized CSS bundles
            </p>
          </div>
          <div>
            <strong>🎯 Type Safety:</strong>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              TypeScript integration for class name validation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSSModulesDemo;