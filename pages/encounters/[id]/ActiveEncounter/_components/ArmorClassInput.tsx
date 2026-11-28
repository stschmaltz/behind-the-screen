import React from 'react';
import { FormInput } from '../../../../../components/ui/FormInput';

export const ArmorClassInput: React.FC<{
  id: string;
  armorClass?: number;
  onChange: (value: number | undefined) => void;
  width?: string;
}> = ({ id, armorClass, onChange, width = 'w-14' }) => (
  <div className="flex items-center justify-end gap-1">
    <span className="text-sm font-semibold">AC:</span>
    <FormInput
      type="number"
      value={armorClass ?? ''}
      width={width}
      id={id}
      ariaLabel="Armor Class"
      onChange={(e) =>
        onChange(e.target.value === '' ? undefined : Number(e.target.value))
      }
      placeholder="n/a"
      className="input-sm"
    />
  </div>
);

export default ArmorClassInput;
