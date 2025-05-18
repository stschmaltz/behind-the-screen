import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from './icons';

interface MonsterOption {
  _id: string;
  name: string;
  [key: string]: unknown;
}

interface MonsterComboboxProps {
  options: MonsterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MonsterCombobox: React.FC<MonsterComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select or type to search...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] =
    useState<MonsterOption[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userClickedRef = useRef(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = options.filter((option) =>
        option.name.toLowerCase().includes(term),
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    if (value) {
      const selectedOption = options.find((option) => option.name === value);
      if (selectedOption) {
        setSearchTerm(selectedOption.name);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const findParentDialog = () => {
      let parent = dropdownRef.current?.parentElement;
      while (parent) {
        if (parent.tagName === 'DIALOG') {
          return parent as HTMLDialogElement;
        }
        parent = parent.parentElement;
      }

      return null;
    };

    const dialog = findParentDialog();

    if (dialog) {
      const handleDialogClose = () => {
        userClickedRef.current = false;
        setIsOpen(false);
      };

      dialog.addEventListener('close', handleDialogClose);

      return () => {
        dialog.removeEventListener('close', handleDialogClose);
      };
    }

    return () => {
      userClickedRef.current = false;
      setIsOpen(false);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    userClickedRef.current = false;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (userClickedRef.current) {
      setIsOpen(true);
    }
  };

  const handleOptionSelect = (optionName: string) => {
    setSearchTerm(optionName);
    onChange(optionName);
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
      if (!value && searchTerm) {
        setSearchTerm('');
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleOptionSelect(filteredOptions[0].name);
    } else if (e.key === 'ArrowDown' && isOpen) {
      const firstOption = document.querySelector(
        '.monster-option',
      ) as HTMLElement;
      if (firstOption) {
        firstOption.focus();
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
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
        />
        <div className="h-full flex items-center pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No monsters found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option._id}
                className="monster-option cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-base-200 focus:bg-base-200 focus:outline-none"
                onClick={() => handleOptionSelect(option.name)}
                tabIndex={0}
                role="option"
                aria-selected={value === option.name}
              >
                <span className="block truncate">{option.name}</span>
                {value === option.name && (
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
  );
};

export default MonsterCombobox;
