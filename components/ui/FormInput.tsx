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
  placeholder?: string;
  className?: string;
  required?: boolean;
  labelIcon?: React.ReactNode;
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
  placeholder,
  className,
  required = false,
  labelIcon,
}) => {
  return (
    <div className="form-control w-full">
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
        className={`input input-bordered input-lg w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary ${className || ''}`}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
    </div>
  );
};

export { FormInput };
