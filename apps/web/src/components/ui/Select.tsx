import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

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

  // Reset focused index when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      const index = options.findIndex(opt => opt.value === value);
      setFocusedIndex(index >= 0 ? index : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, value, options]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && listboxRef.current && focusedIndex >= 0) {
      const activeEl = listboxRef.current.children[focusedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange?.(options[focusedIndex].value);
        }
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Tab':
        // Let natural tab order happen but close the menu
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden native select for form submissions and required validation */}
      <select 
        name={name}
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
        className="sr-only"
        required={required}
        tabIndex={-1}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <div
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="cp-input w-full cursor-pointer flex justify-between items-center bg-surface text-ink border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 select-none"
      >
        <span className={selectedOption ? "text-ink font-medium" : "text-slate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-500' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1.5 bg-surface border-2 border-border-strong shadow-cp-md max-h-60 overflow-y-auto transform origin-top transition-all duration-200 animate-fade-up">
          <ul 
            ref={listboxRef}
            role="listbox" 
            className="py-1"
          >
            {options.map((opt, index) => {
              const isSelected = value === opt.value;
              const isFocused = index === focusedIndex;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors duration-150 ${
                    isFocused 
                      ? 'bg-brand-500 text-white font-medium' 
                      : isSelected 
                        ? 'bg-surface-2 font-bold text-ink' 
                        : 'text-ink hover:bg-surface-2'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg className={`w-4 h-4 ${isFocused ? 'text-white' : 'text-brand-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
