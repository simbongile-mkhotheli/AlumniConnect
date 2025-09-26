import React from 'react';

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  help?: string;
  rows?: number;
  className?: string;
}

export function FormTextarea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  help,
  rows = 4,
  className = '',
}: FormTextareaProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <textarea
        className={`form-textarea ${error ? 'error' : ''} ${className}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
      />
      {error && <div className="form-error">{error}</div>}
      {help && <div className="form-help">{help}</div>}
    </div>
  );
}
