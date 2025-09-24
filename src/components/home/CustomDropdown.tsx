'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function CustomDropdown({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  searchable = false,
  searchPlaceholder = "Type to search..."
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens (for searchable dropdowns)
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <div className="relative w-full cursor-pointer" ref={dropdownRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ad46ff] cursor-pointer"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`w-5 h-5 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden"
          role="listbox"
        >
          {/* Search Input - only show if searchable */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ad46ff] text-sm"
              />
            </div>
          )}

          {/* Options List */}
          <ul className="py-1 overflow-auto text-base max-h-48 focus:outline-none">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={`px-4 py-2 cursor-pointer hover:bg-indigo-100 ${
                    selectedValue === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={selectedValue === option.value}
                >
                  {option.label}
                </li>
              ))
            ) : (
              searchable && (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  No options found
                </div>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}