import React from 'react';
import { DiceIcon } from '../icons';

interface RandomizeButtonProps {
  onClick: () => void;
  disabled: boolean;
  title: string;
}

export const RandomizeButton: React.FC<RandomizeButtonProps> = ({
  onClick,
  disabled,
  title,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="btn btn-sm btn-square btn-outline"
    title={title}
  >
    <DiceIcon className="w-4 h-4" />
  </button>
);
