// Select component

import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  helpText,
  required,
  options,
  placeholder,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="input-group">
      {label && (
        <label
          htmlFor={selectId}
          className={`label ${required ? "label--required" : ""}`}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`select ${error ? "select--error" : ""} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
      {helpText && !error && <span className="help-text">{helpText}</span>}
    </div>
  );
}
