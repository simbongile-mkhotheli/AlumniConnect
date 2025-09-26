import React, { useEffect, useState } from 'react';

interface FilterDebuggerProps {
  filters: any;
  data: any[];
  filteredData: any[];
  title: string;
}

export const FilterDebugger: React.FC<FilterDebuggerProps> = ({
  filters,
  data,
  filteredData,
  title,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log(`🔍 ${title} Filter Debug:`, {
      originalDataCount: data.length,
      filteredDataCount: filteredData.length,
      filters: filters,
      filterActive: Object.values(filters).some(value => value && value !== ''),
      sampleOriginalItem: data[0],
      sampleFilteredItem: filteredData[0],
    });

    // Check if filters are too restrictive
    if (data.length > 0 && filteredData.length === 0) {
      console.warn(`⚠️ ${title}: Filters may be too restrictive!`);
      console.log(
        'Active filters:',
        Object.entries(filters).filter(([_, value]) => value && value !== '')
      );
    }
  }, [filters, data, filteredData, title]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '5px 10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Debug {title} Filters
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '500px',
        overflow: 'auto',
        background: 'white',
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '15px',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <h4 style={{ margin: 0, color: '#007bff' }}>{title} Filter Debug</h4>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#666',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Data Counts:</strong>
        <div>Original: {data.length}</div>
        <div>Filtered: {filteredData.length}</div>
        <div style={{ color: filteredData.length === 0 ? 'red' : 'green' }}>
          Status:{' '}
          {filteredData.length === 0 ? 'NO DATA SHOWING' : 'DATA VISIBLE'}
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Active Filters:</strong>
        <pre
          style={{
            background: '#f5f5f5',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '11px',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Filter Analysis:</strong>
        {Object.entries(filters).map(([key, value]) => (
          <div
            key={key}
            style={{
              padding: '2px 0',
              color: value && value !== '' ? '#d63384' : '#6c757d',
            }}
          >
            {key}: {String(value ?? '') || 'empty'}
            {Boolean(value && value !== '') && <span> (ACTIVE)</span>}
          </div>
        ))}
      </div>

      {data.length > 0 && (
        <div>
          <strong>Sample Data Item:</strong>
          <pre
            style={{
              background: '#f8f9fa',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '10px',
              overflow: 'auto',
              maxHeight: '150px',
            }}
          >
            {JSON.stringify(data[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
