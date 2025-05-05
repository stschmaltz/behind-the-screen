import React, { useEffect, useRef, useState } from 'react';
import { logger } from '../../lib/logger';

interface InlineEditableTextProps {
  initialValue: string;
  onSave: (newValue: string) => Promise<void> | void;
  isSaving?: boolean;
  placeholder?: string;
  inputClassName?: string;
  displayClassName?: string;
  ariaLabel?: string;
}

const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  initialValue,
  onSave,
  isSaving = false,
  placeholder = 'Click to edit',
  inputClassName = 'input input-bordered input-sm w-full',
  displayClassName = 'cursor-pointer hover:bg-base-200 p-1 rounded',
  ariaLabel = 'Editable text field',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSavingRef = useRef(isSaving);

  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (isSavingRef.current) return;
    if (currentValue.trim() !== initialValue.trim()) {
      try {
        await onSave(currentValue.trim());
      } catch (error) {
        logger.error('Error saving inline edit:', error);
        setCurrentValue(initialValue);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(initialValue);
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDisplayClick = () => {
    if (!isSaving) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClassName}
        placeholder={placeholder}
        disabled={isSaving}
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <span
      onClick={handleDisplayClick}
      className={displayClassName}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleDisplayClick();
      }}
      aria-label={`${ariaLabel}, current value: ${currentValue || placeholder}`}
    >
      {currentValue || <span className="italic opacity-70">{placeholder}</span>}
      {isSaving && (
        <span className="loading loading-spinner loading-xs ml-2"></span>
      )}
    </span>
  );
};

export default InlineEditableText;
