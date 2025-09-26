import React from 'react';

export interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  helpText?: string;
  error?: string | null;
  success?: string | null; // optional success feedback
  required?: boolean;
  className?: string;
  inline?: boolean;
}

// Lightweight reusable form field wrapper providing consistent label + help + error structure
export const FormField: React.FC<FormFieldProps> = ({ id, label, children, helpText, error, success, required, className = '', inline }) => {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const successId = success ? `${id}-success` : undefined;
  const describedBy = [helpId, errorId, successId].filter(Boolean).join(' ') || undefined;

  const stateClass = error ? 'error' : success ? 'success' : '';

  return (
    <div className={`ac-form-field ${stateClass} ${inline ? 'inline' : ''} ${className}`.trim()}>
      <label htmlFor={id} className="ac-form-label">
        <span>{label}{required && <span aria-hidden="true" style={{ color: 'var(--primary-color)' }}> *</span>}</span>
      </label>
      {React.isValidElement(children) ? React.cloneElement(children as any, { id, 'aria-describedby': describedBy }) : children}
      {helpText && <div id={helpId} className="ac-form-help" role="note">{helpText}</div>}
      {error && <div id={errorId} className="ac-form-error" role="alert">{error}</div>}
      {success && !error && <div id={successId} className="ac-form-success" role="status">{success}</div>}
    </div>
  );
};

export default FormField;
