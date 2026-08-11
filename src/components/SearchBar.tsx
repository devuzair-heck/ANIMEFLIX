import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search anime by title, genre, or description...',
  className = '',
  size = 'md',
  autoFocus = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value if prop changes externally
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce notification back to parent
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [internalValue, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  const sizeClasses = {
    sm: 'py-2 px-3 pl-9 text-xs',
    md: 'py-3 px-4 pl-11 text-sm',
    lg: 'py-4 px-5 pl-12 text-base',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-5 h-5 left-3.5',
    lg: 'w-6 h-6 left-4',
  }[size];

  return (
    <div className={`relative w-full ${className}`}>
      <Search
        className={`absolute top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none transition-colors ${iconSizes}`}
      />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full bg-[#111111] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C] transition-all shadow-inner ${sizeClasses}`}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
