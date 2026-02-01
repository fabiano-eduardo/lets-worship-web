// Input component

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

export function Input({
  label,
  error,
  helpText,
  required,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="input-group">
      {label && (
        <label
          htmlFor={inputId}
          className={`label ${required ? "label--required" : ""}`}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? "input--error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
      {helpText && !error && <span className="help-text">{helpText}</span>}
    </div>
  );
}
