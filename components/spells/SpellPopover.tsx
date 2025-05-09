import React, { useEffect } from 'react';
import { Spell } from '../../types/spells';
import CloseButton from '../ui/CloseButton';

interface SpellPopoverProps {
  spell: Spell | null;
  onClose: () => void;
}

export default function SpellPopover({ spell, onClose }: SpellPopoverProps) {
  useEffect(() => {
    if (!spell) return;
    const handleClick = () => {
      onClose();
    };
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [spell, onClose]);
  if (!spell) return null;

  return (
    <div className="absolute z-50 p-4 bg-base-300 border- border-accent ring-1 ring-accent rounded-xl shadow-xl max-w-md">
      <CloseButton onClick={onClose} className="mb-2" />
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-2xl text-accent">{spell.name}</h3>
      </div>
      <div className="bg-base-200 p-2 rounded-lg">
        <div></div>
        <div className="grid grid-cols-2 gap-2 mt-2 text-neutral-content text-sm mb-2 ">
          <div>
            <span className="font-semibold">Level:</span> {spell.level}
          </div>
          <div>
            <span className="font-semibold">School:</span> {spell.school}
          </div>
          <div>
            <span className="font-semibold">Casting Time:</span>{' '}
            {spell.casting_time}
          </div>
          <div>
            <span className="font-semibold">Range:</span> {spell.range}
          </div>
          <div>
            <span className="font-semibold">Duration:</span> {spell.duration}
          </div>
          <div>
            <span className="font-semibold">Components:</span>{' '}
            {spell.components.join(', ')}
          </div>
        </div>
        <div className="text-md text-base-content">
          {spell.description && (
            <div className="mb-2 text-base-content">{spell.description}</div>
          )}
          {spell.higher_levels && (
            <div className="mb-2 text-sm">
              <span className="font-semibold">At Higher Levels:</span>{' '}
              {spell.higher_levels}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
