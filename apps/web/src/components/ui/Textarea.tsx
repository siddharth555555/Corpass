import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, required, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 group">
        {label && (
          <label className="text-sm font-medium text-ink transition-colors group-focus-within:text-ink">
            {label} {required && <span className="text-cta-500">*</span>}
          </label>
        )}
        <div className="relative w-full">
          <textarea
            ref={ref}
            required={required}
            className={`
              cp-input w-full text-sm placeholder:text-slate
              transition-all duration-200 resize-y min-h-[100px]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-cta-500 mt-0.5 animate-in slide-in-from-top-1 fade-in duration-200">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
