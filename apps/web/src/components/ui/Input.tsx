import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, prefixNode, suffixNode, required, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 group">
        {label && (
          <label className="text-sm font-medium text-slate transition-all duration-300 group-focus-within:text-ink group-focus-within:font-semibold">
            {label} {required && <span className="text-cta-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {prefixNode && (
            <div className="absolute left-3 flex items-center justify-center text-slate transition-colors duration-300 group-focus-within:text-ink">
              {prefixNode}
            </div>
          )}
          <input
            ref={ref}
            required={required}
            className={`
              cp-input w-full text-sm placeholder:text-slate
              transition-all duration-300 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}
              ${prefixNode ? 'pl-10' : ''}
              ${suffixNode ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {suffixNode && (
            <div className="absolute right-3 flex items-center justify-center text-slate transition-colors duration-300 group-focus-within:text-ink">
              {suffixNode}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger-500 mt-0.5 animate-in slide-in-from-top-1 fade-in duration-200">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
