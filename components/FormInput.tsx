import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
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
}) => {
  return (
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor={label}
      >
        {label}
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id={id}
        name={label}
        type={type}
        value={value}
        onChange={onChange}
        {...(type === 'number' && { min, max, step })}
      />
    </div>
  );
};

export default FormInput;
