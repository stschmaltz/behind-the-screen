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
}) => {
  const widthClass = width ? width : type === 'number' ? 'w-2/12' : 'w-full';

  return (
    <div className={`form-control ${widthClass}`}>
      {label && (
        <label htmlFor={id} className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        id={id}
        name={label}
        type={type}
        value={value}
        onChange={onChange}
        {...(type === 'number' && { min, max, step })}
        className={`input input-bordered ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export { FormInput };
