import React from 'react';
import { FormInput } from '../../../../components/ui/FormInput';
import { EncounterCharacter } from '../../../../types/encounters';
import { getAbilityModifier, rollInitiative } from '../../../../lib/random';

interface Props {
  enemy: EncounterCharacter;
  onEnemyChange: (enemy: EncounterCharacter) => void;
  initiative: number | '';
  setInitiative: (initiative: number | '') => void;
  requireInitiative?: boolean;
}

const BasicEnemyForm: React.FC<Props> = ({
  enemy,
  onEnemyChange,
  initiative,
  setInitiative,
  requireInitiative,
}) => {
  const handleManualChange = (
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    onEnemyChange({
      ...enemy,
      [field]: field === 'name' ? value : Number(value),
    });
  };

  return (
    <>
      <FormInput
        label="Name"
        id="name"
        value={enemy.name}
        onChange={(e) => handleManualChange('name', e.target.value)}
        placeholder="Enter name manually"
      />

      <div className="flex gap-4">
        <FormInput
          label="HP"
          id="health"
          type="number"
          value={enemy.maxHP}
          onChange={(e) => handleManualChange('maxHP', Number(e.target.value))}
          min={1}
          className="w-32"
        />
        <FormInput
          label="AC"
          id="armorClass"
          type="number"
          value={enemy.armorClass}
          onChange={(e) =>
            handleManualChange('armorClass', Number(e.target.value))
          }
          min={1}
          className="w-32"
        />
      </div>

      {requireInitiative && (
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-end gap-2">
            <FormInput
              label="Initiative"
              id="initiative"
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(Number(e.target.value))}
              required
              className="w-full sm:w-32"
            />
            <button
              type="button"
              className="btn btn-sm btn-ghost flex items-center gap-1 mb-1"
              title="Roll initiative using DEX modifier"
              onClick={() => {
                const dexModifier = enemy.stats
                  ? getAbilityModifier(enemy.stats.DEX)
                  : 0;
                const initiativeRoll = rollInitiative(dexModifier);
                setInitiative(initiativeRoll);
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                <circle cx="8" cy="8" r="1"></circle>
                <circle cx="16" cy="8" r="1"></circle>
                <circle cx="8" cy="16" r="1"></circle>
                <circle cx="16" cy="16" r="1"></circle>
                <circle cx="12" cy="12" r="1"></circle>
              </svg>
              Roll
            </button>
          </div>
          <div className="text-xs text-base-content/70">
            DEX modifier:{' '}
            {enemy.stats?.DEX ? getAbilityModifier(enemy.stats.DEX) : 0}
          </div>
        </div>
      )}
    </>
  );
};

export default BasicEnemyForm;
