import React from 'react';

interface FormInputProps {
  id: string;
  label?: string;
  type?: React.HTMLInputTypeAttribute;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  width?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  labelIcon?: React.ReactNode;
  disabled?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  min,
  max,
  step,
  width,
  placeholder,
  className,
  required = false,
  labelIcon,
  disabled = false,
}) => {
  const widthClass = width ? width : 'w-full';

  return (
    <div className={`form-control ${widthClass}`}>
      {label && (
        <label htmlFor={id} className="label">
          <span className="label-text flex items-center gap-2">
            {label}
            {labelIcon && <span className="text-info">{labelIcon}</span>}
          </span>
        </label>
      )}
      <input
        id={id}
        name={label}
        type={type}
        value={value}
        onChange={onChange}
        {...(type === 'number' && { min, max, step })}
        className={`input ${className}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export { FormInput };
