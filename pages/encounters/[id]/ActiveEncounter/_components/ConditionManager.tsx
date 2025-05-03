import React from 'react';
import { Condition } from '../../../../../types/encounters';

export const ConditionManager: React.FC<{
  characterId: string;
  conditions: Condition[];
  onAddCondition: (condition: Condition) => void;
  onRemoveCondition: (condition: Condition) => void;
}> = ({ characterId, conditions, onRemoveCondition, onAddCondition }) => {
  const availableConditions: Condition[] = [
    'blinded',
    'charmed',
    'deafened',
    'frightened',
    'grappled',
    'incapacitated',
    'invisible',
    'paralyzed',
    'petrified',
    'poisoned',
    'prone',
    'restrained',
    'stunned',
    'unconscious',
  ];

  const conditionColors: Record<Condition, string> = {
    blinded: 'bg-red-700',
    charmed: 'bg-pink-600',
    deafened: 'bg-amber-600',
    frightened: 'bg-purple-700',
    grappled: 'bg-blue-600',
    incapacitated: 'bg-slate-600',
    invisible: 'bg-slate-400',
    paralyzed: 'bg-indigo-700',
    petrified: 'bg-stone-600',
    poisoned: 'bg-green-700',
    prone: 'bg-orange-600',
    restrained: 'bg-yellow-600',
    stunned: 'bg-violet-600',
    unconscious: 'bg-gray-700',
  };

  const handleToggleCondition = (condition: Condition) => {
    const isActive = conditions.includes(condition);
    if (isActive) {
      onRemoveCondition(condition);
    } else {
      onAddCondition(condition);
    }
  };

  return (
    <div>
      {conditions.length > 0 ? (
        <div className="flex flex-wrap gap-1 mb-1 max-w-[300px]">
          {conditions.map((condition) => (
            <div
              key={condition}
              className={`badge badge-sm ${conditionColors[condition]} text-white cursor-pointer whitespace-nowrap`}
              onClick={() => onRemoveCondition(condition)}
              title={`Remove ${condition}`}
            >
              {condition}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-info-content-500 mb-1 text-right"></div>
      )}

      <div className="flex justify-end">
        <label
          htmlFor={`condition-modal-${characterId}`}
          className="btn btn-xs btn-outline"
        >
          Manage Conditions
        </label>
      </div>

      <input
        type="checkbox"
        id={`condition-modal-${characterId}`}
        className="modal-toggle"
      />
      <div className="modal modal-bottom sm:modal-middle z-50">
        <div className="modal-box relative">
          <h3 className="font-bold text-lg">Manage Conditions</h3>

          <div className="grid grid-cols-2 gap-2 my-4">
            {availableConditions.map((condition) => {
              const isActive = conditions.includes(condition);

              return (
                <div
                  key={condition}
                  className={`btn btn-sm justify-start hover:opacity-90 ${
                    isActive
                      ? conditionColors[condition] + ' text-white'
                      : 'btn-outline'
                  }`}
                  onClick={() => handleToggleCondition(condition)}
                >
                  {isActive ? '✓ ' : ''}
                  {condition}
                </div>
              );
            })}
          </div>

          <div className="modal-action">
            <label htmlFor={`condition-modal-${characterId}`} className="btn">
              Close
            </label>
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor={`condition-modal-${characterId}`}
        ></label>
      </div>
    </div>
  );
};

export default ConditionManager;
