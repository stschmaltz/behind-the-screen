import { useState } from 'react';
import { FormInput } from '../../../../components/FormInput';
import {
  Condition,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import MonsterDetailModal from '../MonsterDetailModal';

const HealthModifier: React.FC<{
  onApply: (value: number) => void;
}> = ({ onApply }) => {
  const [value, setValue] = useState<string>('');
  const [modifier, setModifier] = useState<'damage' | 'heal' | 'temp'>(
    'damage',
  );

  const handleApply = () => {
    const numValue = Number(value);
    if (numValue <= 0) return;

    if (modifier === 'damage') {
      onApply(-numValue);
    } else {
      onApply(numValue);
    }
    setValue('');
  };

  return (
    <div className="flex items-center">
      <div className="join">
        <select
          className="select select-bordered select-sm join-item"
          value={modifier}
          onChange={(e) =>
            setModifier(e.target.value as 'damage' | 'heal' | 'temp')
          }
        >
          <option value="damage">Damage</option>
          <option value="heal">Heal</option>
          <option value="temp">Temp</option>
        </select>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input input-bordered input-sm join-item w-16"
          placeholder="HP"
        />
        <button
          className="btn btn-sm join-item"
          onClick={handleApply}
          disabled={!value}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

const ConditionManager: React.FC<{
  conditions: Condition[];
  onAddCondition: (condition: Condition) => void;
  onRemoveCondition: (condition: Condition) => void;
}> = ({ conditions, onRemoveCondition, onAddCondition }) => {
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

  // Condition colors for visual distinction
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

  // Single function to handle toggling conditions
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
              className={`badge badge-sm ${conditionColors[condition]} text-white cursor-pointer`}
              onClick={() => onRemoveCondition(condition)}
              title={`Remove ${condition}`}
            >
              {condition}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 mb-1">No conditions</div>
      )}

      <div className="flex justify-end">
        <label
          htmlFor={`condition-modal-${conditions.join('-')}`}
          className="btn btn-xs btn-outline"
        >
          Manage Conditions
        </label>
      </div>

      <input
        type="checkbox"
        id={`condition-modal-${conditions.join('-')}`}
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Manage Conditions</h3>

          <div className="grid grid-cols-2 gap-2 my-4">
            {availableConditions.map((condition) => {
              const isActive = conditions.includes(condition);

              return (
                <div
                  key={condition}
                  className={`btn btn-sm justify-start ${isActive ? conditionColors[condition] + ' text-white' : 'btn-outline'}`}
                  onClick={() => handleToggleCondition(condition)}
                >
                  {isActive ? '✓ ' : ''}
                  {condition}
                </div>
              );
            })}
          </div>

          <div className="modal-action">
            <label
              htmlFor={`condition-modal-${conditions.join('-')}`}
              className="btn"
            >
              Close
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveEncounterCharacterRow: React.FC<{
  character: InitiativeOrderCharacter;
  isCurrentTurn: boolean;
  onUpdateCharacter: (character: InitiativeOrderCharacter) => void;
  monsterData?: EncounterCharacter;
}> = ({ character, isCurrentTurn, onUpdateCharacter, monsterData }) => {
  const handleHealthChange = (modifier: number) => {
    const newHP = Math.min(
      Math.max(0, (character.currentHP ?? 0) + modifier),
      character.maxHP ?? 0,
    );
    onUpdateCharacter({ ...character, currentHP: newHP });
  };

  const handleAddCondition = (condition: Condition) => {
    onUpdateCharacter({
      ...character,
      conditions: [...(character.conditions ?? []), condition],
    });
  };

  const handleRemoveCondition = (condition: Condition) => {
    onUpdateCharacter({
      ...character,
      conditions: (character.conditions ?? []).filter((c) => c !== condition),
    });
  };

  // Check if this is an enemy with monster data
  const isMonster = character.type === 'enemy' && monsterData;

  return (
    <div
      className={`card ${isCurrentTurn ? 'bg-primary bg-opacity-10' : 'bg-base-100'} shadow-sm mb-4`}
    >
      <div className="card-body p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {character.name}
              {isCurrentTurn && (
                <span className="badge badge-primary">Current Turn</span>
              )}
            </h3>

            <div className="flex flex-col mt-2">
              {isMonster && (
                <div className="mb-1 flex">
                  <MonsterDetailModal monster={monsterData} />
                </div>
              )}

              <span className="text-xs text-gray-500">
                Initiative: {character.initiative}
              </span>
            </div>
          </div>

          <div className="flex flex-col w-full sm:w-auto gap-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">AC:</span>
                <FormInput
                  type="number"
                  value={character.armorClass ?? ''}
                  width="w-16"
                  id="armorClass"
                  onChange={(e) =>
                    onUpdateCharacter({
                      ...character,
                      armorClass: Number(e.target.value),
                    })
                  }
                  placeholder="n/a"
                  className="input-sm"
                />
              </div>

              <div>
                {character.maxHP && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge badge-lg ${(character.currentHP ?? 0) <= 0 ? 'badge-error' : 'badge-ghost'}`}
                    >
                      HP: {character.currentHP ?? 0}/{character.maxHP}
                    </span>
                    <HealthModifier onApply={handleHealthChange} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2">
              <ConditionManager
                conditions={character.conditions ?? []}
                onAddCondition={handleAddCondition}
                onRemoveCondition={handleRemoveCondition}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveEncounterCharacterRow;
