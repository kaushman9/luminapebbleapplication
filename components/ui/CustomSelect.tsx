import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';

interface CustomSelectProps {
  options: { value: string; label: string }[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, selectedValue, onSelect, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);
  
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 text-sm font-medium text-left bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-200"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="h-4 w-4 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-md border border-slate-200 dark:border-slate-700 py-1 max-h-60 overflow-y-auto">
          {options.map(option => (
            <button 
              type="button"
              key={option.value}
              onClick={() => { onSelect(option.value); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-500/10 flex items-center justify-between"
            >
              <span className="truncate">{option.label}</span>
              {option.value === selectedValue && <Icon name="check" className="h-4 w-4 text-primary-500" />}
            </button>
          ))}
          {options.length === 0 && <span className="px-3 py-2 text-sm text-slate-500">No options available</span>}
        </div>
      )}
    </div>
  );
};
