import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from '../icons';
import { findParentDialog, useClickOutside } from '../../hooks/useClickOutside';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select or type to search...',
  className = '',
  disabled = false,
  label,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] =
    useState<ComboboxOption[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userClickedRef = useRef(false);

  const parentDialog = useMemo(() => findParentDialog(dropdownRef.current), []);

  useClickOutside(dropdownRef, () => setIsOpen(false), {
    enabled: true,
    parentDialog,
    onDialogClose: () => {
      userClickedRef.current = false;
    },
  });

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = options.filter(
        (option) =>
          option.label.toLowerCase().includes(term) ||
          option.value.toLowerCase().includes(term),
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    if (value) {
      setSearchTerm(value);
    } else {
      setSearchTerm('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onChange(term);
    setIsOpen(true);
  };

  const handleOptionSelect = (optionValue: string) => {
    setSearchTerm(optionValue);
    onChange(optionValue);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (userClickedRef.current) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    userClickedRef.current = true;
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!value && searchTerm && filteredOptions.length === 0) {
        onChange(searchTerm);
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleOptionSelect(filteredOptions[0].value);
    } else if (e.key === 'ArrowDown' && isOpen) {
      const firstOption = document.querySelector(
        '.combobox-option',
      ) as HTMLElement;
      if (firstOption) {
        firstOption.focus();
      }
    }
  };

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <div
          className="input input-bordered w-full flex items-center cursor-text"
          onClick={() => {
            if (!disabled) {
              inputRef.current?.focus();
            }
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className={`w-full bg-transparent border-none focus:outline-none ${disabled ? 'cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            required={required}
          />
          <div className="h-full flex items-center pointer-events-none">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-base-300">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No matches found. Press Enter to use &quot;{searchTerm}&quot;
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="combobox-option cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-base-200 focus:bg-base-200 focus:outline-none"
                  onClick={() => handleOptionSelect(option.value)}
                  tabIndex={0}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <span className="block truncate">{option.label}</span>
                  {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <CheckIcon className="h-5 w-5" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { Combobox };
export type { ComboboxOption };
