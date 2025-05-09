import React from 'react';
import { Spell } from '../../types/spells';

interface SpellPopoverProps {
  spell: Spell | null;
  onClose: () => void;
}

export default function SpellPopover({ spell, onClose }: SpellPopoverProps) {
  if (!spell) return null;

  return (
    <div className="absolute z-50 p-4 bg-base-100 rounded-lg shadow-lg border border-base-300 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-primary">{spell.name}</h3>
        <button
          className="btn btn-xs btn-circle btn-ghost"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="text-sm text-base-content">
        {spell.description && <div className="mb-2">{spell.description}</div>}
        {spell.higher_levels && (
          <div className="mb-2">
            <span className="font-semibold">At Higher Levels:</span>{' '}
            {spell.higher_levels}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-2">
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
      </div>
    </div>
  );
}
