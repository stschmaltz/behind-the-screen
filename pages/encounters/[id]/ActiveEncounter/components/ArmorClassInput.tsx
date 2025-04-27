import React from 'react';
import { FormInput } from '../../../../../components/FormInput'; // Adjusted path

// AC input component
export const ArmorClassInput: React.FC<{
  id: string;
  armorClass?: number;
  onChange: (value: number) => void;
  width?: string;
}> = ({ id, armorClass, onChange, width = 'w-14' }) => (
  <div className="flex items-center justify-end gap-1">
    <span className="text-sm font-semibold">AC:</span>
    <FormInput
      type="number"
      value={armorClass ?? ''}
      width={width}
      id={id}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder="n/a"
      className="input-sm"
    />
  </div>
);
