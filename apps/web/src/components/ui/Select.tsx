import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden native select for form submissions and required validation */}
      <select 
        name={name}
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
        className="sr-only"
        required={required}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cp-input w-full cursor-pointer flex justify-between items-center bg-paper text-ink"
      >
        <span className={selectedOption ? "text-ink font-medium" : "text-slate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-paper border border-border-strong shadow-cp-sm animate-fade-up max-h-60 overflow-y-auto">
          <ul className="py-1">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange?.(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 hover:bg-brand-50 hover:text-brand-700 ${
                  value === opt.value ? 'bg-surface-2 font-bold text-ink' : 'text-ink'
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
