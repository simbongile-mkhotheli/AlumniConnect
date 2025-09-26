import React from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  help?: string;
  className?: string;
}

export function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  help,
  className = '',
}: FormInputProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        className={`form-input ${error ? 'error' : ''} ${className}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
      />
      {error && <div className="form-error">{error}</div>}
      {help && <div className="form-help">{help}</div>}
    </div>
  );
}
