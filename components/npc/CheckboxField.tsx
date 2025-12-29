import React from 'react';

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  label: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  checked,
  onChange,
  disabled,
  label,
}) => (
  <div className="form-control">
    <label className="label cursor-pointer justify-start gap-3 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox checkbox-sm checkbox-primary"
        disabled={disabled}
      />
      <span className="label-text text-sm">{label}</span>
    </label>
  </div>
);
