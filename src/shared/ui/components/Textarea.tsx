// Textarea component

import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  mono?: boolean;
}

export function Textarea({
  label,
  error,
  helpText,
  required,
  mono = false,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="input-group">
      {label && (
        <label
          htmlFor={textareaId}
          className={`label ${required ? "label--required" : ""}`}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`textarea ${mono ? "textarea--mono" : ""} ${error ? "textarea--error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
      {helpText && !error && <span className="help-text">{helpText}</span>}
    </div>
  );
}
