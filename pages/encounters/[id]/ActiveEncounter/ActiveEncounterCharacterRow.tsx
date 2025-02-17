import { useState } from 'react';
import { Button } from '../../../../components/Button';
import { FormInput } from '../../../../components/FormInput';
import {
  Condition,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';

const HealthModifier: React.FC<{
  onApply: (value: number) => void;
}> = ({ onApply }) => {
  const [value, setValue] = useState<string>('');

  return (
    <div className="flex gap-2 items-center">
      <FormInput
        id={`health-modifier`}
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 m-0 input-sm"
        placeholder="HP"
      />
      <Button
        variant="secondary"
        label="Damage"
        className="btn-sm"
        onClick={() => {
          onApply(-Number(value));
          setValue('');
        }}
      />
      <Button
        className="btn-sm"
        variant="primary"
        label="Heal"
        onClick={() => {
          onApply(Number(value));
          setValue('');
        }}
      />
      <Button
        variant="info"
        className="btn-sm"
        label="Temp HP"
        onClick={() => {
          onApply(Number(value));
          setValue('');
        }}
      />
    </div>
  );
};

const ConditionManager: React.FC<{
  conditions: Condition[];
  onAddCondition: (condition: Condition) => void;
  onRemoveCondition: (condition: Condition) => void;
}> = ({ conditions, onAddCondition, onRemoveCondition }) => {
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

  return (
    <div className="flex flex-wrap gap-2">
      {conditions.map((condition) => (
        <span
          key={condition}
          className="badge badge-secondary cursor-pointer"
          onClick={() => onRemoveCondition(condition)}
        >
          {condition} ×
        </span>
      ))}
      <select
        className="select select-bordered select-sm"
        onChange={(e) => {
          const condition = e.target.value as Condition;
          if (condition) onAddCondition(condition);
          e.target.value = '';
        }}
      >
        <option value="">Add condition...</option>
        {availableConditions
          .filter((c) => !conditions.includes(c))
          .map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
      </select>
    </div>
  );
};

const ActiveEncounterCharacterRow: React.FC<{
  character: InitiativeOrderCharacter;
  isCurrentTurn: boolean;
  onUpdateCharacter: (character: InitiativeOrderCharacter) => void;
}> = ({ character, isCurrentTurn, onUpdateCharacter }) => {
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

  return (
    <div
      className={`card ${isCurrentTurn ? 'bg-primary bg-opacity-10' : 'bg-base-100'} shadow-sm mb-4`}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {character.name}
              {isCurrentTurn && (
                <span className="badge badge-primary">Current Turn</span>
              )}
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="badge badge-neutral">
                Initiative: {character.initiative}
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
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
              label="AC"
              placeholder="n/a"
              className="input-sm"
            />
            <div className="flex flex-col gap-2">
              <div className="flex">
                {character.maxHP && (
                  <span
                    className={`badge badge-lg ${(character.currentHP ?? 0) <= 0 ? 'badge-error' : 'badge-ghost'}`}
                  >
                    HP: {character.currentHP ?? 0}/{character.maxHP}
                  </span>
                )}
                <HealthModifier onApply={handleHealthChange} />
              </div>
              <div className="justify-self-end">
                <ConditionManager
                  conditions={character.conditions ?? []}
                  onAddCondition={handleAddCondition}
                  onRemoveCondition={handleRemoveCondition}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2"></div>
      </div>
    </div>
  );
};

export default ActiveEncounterCharacterRow;
