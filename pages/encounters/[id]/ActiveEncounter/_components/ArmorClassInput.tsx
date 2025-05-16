import React from 'react';
import { FormInput } from '../../../../../components/ui/FormInput';

export const ArmorClassInput: React.FC<{
  id: string;
  armorClass?: number;
  onChange: (value: number) => void;
  className?: string;
}> = ({ id, armorClass, onChange, className = 'w-14' }) => (
  <div className="flex items-center justify-end gap-1">
    <span className="text-sm font-semibold">AC:</span>
    <FormInput
      type="number"
      value={armorClass ?? ''}
      id={id}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder="n/a"
      className={className}
    />
  </div>
);

export default ArmorClassInput;
