import { useState } from 'react';
import { FormInput } from '../../../../components/FormInput';
import {
  Condition,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import MonsterDetailModal from '../MonsterDetailModal';

const ConditionManager: React.FC<{
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
        <div className="text-xs text-info-content-500 mb-1 text-right">
          {/* No conditions */}
        </div>
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
            <label htmlFor={`condition-modal-${characterId}`} className="btn">
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [modifierValue, setModifierValue] = useState<string>('');
  const [modifierType, setModifierType] = useState<'damage' | 'heal' | 'temp'>(
    'damage',
  );

  const handleHealthApply = () => {
    const numValue = Number(modifierValue);
    if (isNaN(numValue) || numValue <= 0) return;

    let newHP = character.currentHP ?? 0;

    if (modifierType === 'damage') {
      newHP = Math.max(0, newHP - numValue);
    } else if (modifierType === 'heal') {
      // Only cap healing by maxHP if character has a maxHP defined
      if (character.maxHP !== undefined) {
        newHP = Math.min(character.maxHP, newHP + numValue);
      } else {
        newHP = newHP + numValue;
      }
    } else if (modifierType === 'temp') {
      // Temp HP just overrides if higher
      newHP = Math.max(newHP, numValue);
    }

    onUpdateCharacter({ ...character, currentHP: newHP });
    setModifierValue('');
    setPopoverOpen(false);
  };

  const isMonster = character.type === 'enemy' && monsterData;

  const currentHP = character.currentHP ?? 0;
  const maxHP = character.maxHP ?? 1; // Avoid division by zero
  const healthPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;

  const getProgressColor = () => {
    if (healthPercentage > 50) return 'progress-success';
    if (healthPercentage > 25) return 'progress-warning';

    return 'progress-error';
  };

  const openPopover = () => {
    setPopoverOpen(true);
  };

  return (
    <div
      className={`card ${isCurrentTurn ? 'bg-primary bg-opacity-10' : 'bg-base-100'} shadow-sm mb-4`}
    >
      <div className="card-body p-4">
        {/* --- Mobile Layout (hidden on sm+) --- */}
        <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-1 sm:hidden">
          {/* Name Header: Full width */}
          <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap w-full">
            <span>{character.name}</span>
            {isCurrentTurn && (
              <span className="badge badge-primary whitespace-nowrap">
                Current Turn
              </span>
            )}
          </h3>

          {/* Row 2 container: Initiative vs Stats */}
          <div className="flex justify-between items-start w-full">
            {/* Initiative (Left) */}
            <div className="mt-1">
              <span className="text-sm text-base-content text-opacity-70">
                Initiative: {character.initiative}
              </span>
              {isMonster && (
                <div className="mt-1 flex">
                  <MonsterDetailModal monster={monsterData} />
                </div>
              )}
            </div>

            {/* Stats & Actions Block (Right, stacked internally) */}
            <div className="flex flex-col items-end gap-2">
              {/* AC */}
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm font-semibold">AC:</span>
                <FormInput
                  type="number"
                  value={character.armorClass ?? ''}
                  width="w-14"
                  id={`mobile-armorClass-${character._id}`} // Unique ID for mobile
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
              {/* Health (Conditional) */}
              {character.maxHP && character.maxHP > 0 && (
                <div className="relative flex items-center justify-end gap-1">
                  {/* Mobile Popover Instance 1 */}
                  {popoverOpen && (
                    <div className="absolute bottom-full right-0 mb-2 z-20 p-3 card bg-base-200 shadow-xl w-56">
                      <h4 className="text-sm font-semibold mb-2 capitalize">
                        {modifierType} HP
                      </h4>
                      <div className="btn-group btn-group-xs grid grid-cols-3 mb-2">
                        <button
                          className={`btn btn-outline ${modifierType === 'damage' ? 'btn-active btn-error' : ''}`}
                          onClick={() => setModifierType('damage')}
                        >
                          Dmg
                        </button>
                        <button
                          className={`btn btn-outline ${modifierType === 'heal' ? 'btn-active btn-success' : ''}`}
                          onClick={() => setModifierType('heal')}
                        >
                          Heal
                        </button>
                        <button
                          className={`btn btn-outline ${modifierType === 'temp' ? 'btn-active btn-info' : ''}`}
                          onClick={() => setModifierType('temp')}
                        >
                          Temp
                        </button>
                      </div>
                      <input
                        type="number"
                        value={modifierValue}
                        onChange={(e) => setModifierValue(e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="Amount"
                        min="1"
                        autoFocus
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleHealthApply()
                        }
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => setPopoverOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={handleHealthApply}
                          disabled={
                            !modifierValue || Number(modifierValue) <= 0
                          }
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm font-medium whitespace-nowrap mb-0.5 ${
                        currentHP <= 0
                          ? 'text-neutral-content text-opacity-70'
                          : ''
                      }`}
                    >
                      HP: {currentHP}/{maxHP}
                    </span>
                    {currentHP > 0 && (
                      <progress
                        className={`progress ${getProgressColor()} w-20 h-2`}
                        value={currentHP}
                        max={maxHP}
                        aria-label={`Health: ${currentHP} of ${maxHP}`}
                      ></progress>
                    )}
                  </div>
                  <button
                    className="btn btn-xs"
                    onClick={openPopover}
                    aria-label="Adjust HP"
                  >
                    <span className="text-xs">+/-</span>
                  </button>
                </div>
              )}
              {(character.maxHP === undefined || character.maxHP === 0) && (
                <div className="relative flex items-center justify-end gap-1">
                  {/* Mobile Popover Instance 2 */}
                  {popoverOpen && (
                    <div className="absolute bottom-full right-0 mb-2 z-20 p-3 card bg-base-200 shadow-xl w-56">
                      <h4 className="text-sm font-semibold mb-2 capitalize">
                        {modifierType} HP
                      </h4>
                      <div className="btn-group btn-group-xs grid grid-cols-3 mb-2">
                        <button
                          className={`btn btn-outline ${modifierType === 'damage' ? 'btn-active btn-error' : ''}`}
                          onClick={() => setModifierType('damage')}
                        >
                          Dmg
                        </button>
                        <button
                          className={`btn btn-outline ${modifierType === 'heal' ? 'btn-active btn-success' : ''}`}
                          onClick={() => setModifierType('heal')}
                        >
                          Heal
                        </button>
                        <button
                          className={`btn btn-outline ${modifierType === 'temp' ? 'btn-active btn-info' : ''}`}
                          onClick={() => setModifierType('temp')}
                        >
                          Temp
                        </button>
                      </div>
                      <input
                        type="number"
                        value={modifierValue}
                        onChange={(e) => setModifierValue(e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="Amount"
                        min="1"
                        autoFocus
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleHealthApply()
                        }
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => setPopoverOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={handleHealthApply}
                          disabled={
                            !modifierValue || Number(modifierValue) <= 0
                          }
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                  <div
                    className={`px-2 py-1 rounded-full text-white text-sm font-medium whitespace-nowrap ${
                      currentHP <= 0
                        ? 'bg-neutral text-neutral-content text-opacity-70'
                        : 'bg-info'
                    }`}
                  >
                    HP: {currentHP}
                  </div>
                  <button
                    className="btn btn-xs"
                    onClick={openPopover}
                    aria-label="Adjust HP"
                  >
                    <span className="text-xs">+/-</span>
                  </button>
                </div>
              )}
              {/* Condition Manager */}
              <div>
                <ConditionManager
                  characterId={`mobile-${character._id}`} // Unique ID for mobile
                  conditions={character.conditions ?? []}
                  onAddCondition={(condition) =>
                    onUpdateCharacter({
                      ...character,
                      conditions: [...(character.conditions ?? []), condition],
                    })
                  }
                  onRemoveCondition={(condition) =>
                    onUpdateCharacter({
                      ...character,
                      conditions: (character.conditions ?? []).filter(
                        (c) => c !== condition,
                      ),
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Desktop Layout (hidden below sm) --- */}
        <div className="hidden sm:flex sm:flex-row sm:justify-between sm:items-start sm:gap-4">
          {/* Left Block: Name + Initiative/Stats */}
          <div className="flex flex-col min-w-0 sm:flex-1">
            {/* Name Header */}
            <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap">
              <span>{character.name}</span>
              {isCurrentTurn && (
                <span className="badge badge-primary whitespace-nowrap">
                  Current Turn
                </span>
              )}
            </h3>
            {/* Initiative / View Stats */}
            <div className="mt-1">
              <span className="text-sm text-base-content text-opacity-70">
                Initiative: {character.initiative}
              </span>
              {isMonster && (
                <div className="mt-1 flex">
                  <MonsterDetailModal monster={monsterData} />
                </div>
              )}
            </div>
          </div>

          {/* Right Block: Stats & Actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0 sm:w-auto">
            {/* AC */}
            <div className="flex items-center justify-end gap-1">
              <span className="text-sm font-semibold">AC:</span>
              <FormInput
                type="number"
                value={character.armorClass ?? ''}
                width="w-14"
                id={`desktop-armorClass-${character._id}`} // Unique ID for desktop
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
            {/* Health (Conditional) */}
            {character.maxHP && character.maxHP > 0 && (
              <div className="relative flex items-center justify-end gap-1">
                {/* Desktop Popover Instance 1 */}
                {popoverOpen && (
                  <div className="absolute bottom-full right-0 mb-2 z-20 p-3 card bg-base-200 shadow-xl w-56">
                    <h4 className="text-sm font-semibold mb-2 capitalize">
                      {modifierType} HP
                    </h4>
                    <div className="btn-group btn-group-xs grid grid-cols-3 mb-2">
                      <button
                        className={`btn btn-outline ${modifierType === 'damage' ? 'btn-active btn-error' : ''}`}
                        onClick={() => setModifierType('damage')}
                      >
                        Dmg
                      </button>
                      <button
                        className={`btn btn-outline ${modifierType === 'heal' ? 'btn-active btn-success' : ''}`}
                        onClick={() => setModifierType('heal')}
                      >
                        Heal
                      </button>
                      <button
                        className={`btn btn-outline ${modifierType === 'temp' ? 'btn-active btn-info' : ''}`}
                        onClick={() => setModifierType('temp')}
                      >
                        Temp
                      </button>
                    </div>
                    <input
                      type="number"
                      value={modifierValue}
                      onChange={(e) => setModifierValue(e.target.value)}
                      className="input input-bordered input-sm w-full"
                      placeholder="Amount"
                      min="1"
                      autoFocus
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleHealthApply()
                      }
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => setPopoverOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={handleHealthApply}
                        disabled={!modifierValue || Number(modifierValue) <= 0}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-end">
                  <span
                    className={`text-sm font-medium whitespace-nowrap mb-0.5 ${
                      currentHP <= 0
                        ? 'text-neutral-content text-opacity-70'
                        : ''
                    }`}
                  >
                    HP: {currentHP}/{maxHP}
                  </span>
                  {currentHP > 0 && (
                    <progress
                      className={`progress ${getProgressColor()} w-20 h-2`}
                      value={currentHP}
                      max={maxHP}
                      aria-label={`Health: ${currentHP} of ${maxHP}`}
                    ></progress>
                  )}
                </div>
                <button
                  className="btn btn-xs"
                  onClick={openPopover}
                  aria-label="Adjust HP"
                >
                  <span className="text-xs">+/-</span>
                </button>
              </div>
            )}
            {(character.maxHP === undefined || character.maxHP === 0) && (
              <div className="relative flex items-center justify-end gap-1">
                {/* Desktop Popover Instance 2 */}
                {popoverOpen && (
                  <div className="absolute bottom-full right-0 mb-2 z-20 p-3 card bg-base-200 shadow-xl w-56">
                    <h4 className="text-sm font-semibold mb-2 capitalize">
                      {modifierType} HP
                    </h4>
                    <div className="btn-group btn-group-xs grid grid-cols-3 mb-2">
                      <button
                        className={`btn btn-outline ${modifierType === 'damage' ? 'btn-active btn-error' : ''}`}
                        onClick={() => setModifierType('damage')}
                      >
                        Dmg
                      </button>
                      <button
                        className={`btn btn-outline ${modifierType === 'heal' ? 'btn-active btn-success' : ''}`}
                        onClick={() => setModifierType('heal')}
                      >
                        Heal
                      </button>
                      <button
                        className={`btn btn-outline ${modifierType === 'temp' ? 'btn-active btn-info' : ''}`}
                        onClick={() => setModifierType('temp')}
                      >
                        Temp
                      </button>
                    </div>
                    <input
                      type="number"
                      value={modifierValue}
                      onChange={(e) => setModifierValue(e.target.value)}
                      className="input input-bordered input-sm w-full"
                      placeholder="Amount"
                      min="1"
                      autoFocus
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleHealthApply()
                      }
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => setPopoverOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={handleHealthApply}
                        disabled={!modifierValue || Number(modifierValue) <= 0}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
                <div
                  className={`px-2 py-1 rounded-full text-white text-sm font-medium whitespace-nowrap ${
                    currentHP <= 0
                      ? 'bg-neutral text-neutral-content text-opacity-70'
                      : 'bg-info'
                  }`}
                >
                  HP: {currentHP}
                </div>
                <button
                  className="btn btn-xs"
                  onClick={openPopover}
                  aria-label="Adjust HP"
                >
                  <span className="text-xs">+/-</span>
                </button>
              </div>
            )}
            {/* Condition Manager */}
            <div>
              <ConditionManager
                characterId={`desktop-${character._id}`} // Unique ID for desktop
                conditions={character.conditions ?? []}
                onAddCondition={(condition) =>
                  onUpdateCharacter({
                    ...character,
                    conditions: [...(character.conditions ?? []), condition],
                  })
                }
                onRemoveCondition={(condition) =>
                  onUpdateCharacter({
                    ...character,
                    conditions: (character.conditions ?? []).filter(
                      (c) => c !== condition,
                    ),
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveEncounterCharacterRow;
