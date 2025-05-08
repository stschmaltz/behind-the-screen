import React from 'react';
import { EncounterCharacter } from '../../../types/encounters';
import { FormInput } from '../../../components/ui/FormInput';
import MonsterCombobox from '../../../components/MonsterCombobox';
import { MonsterData } from '../../../hooks/use-monsters.hook';
import { MonsterOption } from '../../../hooks/use-monsters.hook';

interface CharacterCardProps {
  character: EncounterCharacter;
  index: number;
  selectedMonsterName: string;
  isLoading: boolean;
  monsterOptions: MonsterOption[];
  collapseRef: (el: HTMLInputElement | null) => void;
  error: string | null;
  monsters: MonsterData[];
  onMonsterSelectChange: (index: number, value: string) => void;
  onCharacterFieldChange: (
    index: number,
    field: keyof EncounterCharacter,
    value: string | number,
  ) => void;
  onAbilityScoreChange: (
    index: number,
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
    value: number,
  ) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  index,
  selectedMonsterName,
  isLoading,
  monsterOptions,
  collapseRef,
  error,
  monsters,
  onMonsterSelectChange,
  onCharacterFieldChange,
  onAbilityScoreChange,
  onRemove,
  onDuplicate,
}) => {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate(index);
        }}
        className="btn btn-ghost btn-xs absolute top-4 right-28 z-10"
        title="Duplicate Character"
      >
        Duplicate
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="btn btn-ghost btn-xs absolute top-4 right-14 z-10 text-error"
        title="Remove Character"
      >
        Remove
      </button>
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input
          type="checkbox"
          defaultChecked
          className="peer"
          ref={collapseRef}
        />
        <div className="collapse-title text-lg font-medium flex justify-between items-center peer-checked:bg-base-200 peer-checked:text-base-content =-">
          <span>{character.name || `New Character ${index + 1}`}</span>
        </div>
        <div className="collapse-content peer-checked:bg-base-100 peer-checked:text-base-content">
          {!isLoading && !error && monsters.length > 0 && (
            <div
              className="form-control w-full mb-2"
              style={{ maxWidth: '400px' }}
            >
              <label className="label">
                <span className="label-text">Select or Search Monster</span>
              </label>
              <MonsterCombobox
                options={monsterOptions}
                value={selectedMonsterName || ''}
                onChange={(value) => onMonsterSelectChange(index, value)}
                placeholder="Type to search or select a monster"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="divider">Or Enter Manually Below</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <FormInput
              id={`character-name-${index}`}
              label="Name"
              type="text"
              placeholder="Character Name"
              value={character.name}
              onChange={(e) =>
                onCharacterFieldChange(index, 'name', e.target.value)
              }
            />
            <FormInput
              id={`character-hp-${index}`}
              label="HP"
              type="number"
              placeholder="10"
              value={character.maxHP || ''}
              onChange={(e) =>
                onCharacterFieldChange(index, 'maxHP', Number(e.target.value))
              }
            />
            <FormInput
              id={`character-ac-${index}`}
              label="AC"
              type="number"
              placeholder="15"
              value={character.armorClass || ''}
              onChange={(e) =>
                onCharacterFieldChange(
                  index,
                  'armorClass',
                  Number(e.target.value),
                )
              }
            />
          </div>

          <div className="collapse collapse-arrow bg-base-200 mt-4">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium peer-checked:bg-base-300 peer-checked:text-base-content">
              Advanced Character Fields
            </div>
            <div className="collapse-content peer-checked:bg-base-200 peer-checked:text-base-content">
              <div className="mt-2">
                <label className="label">
                  <span className="label-text font-medium">Stats</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map(
                    (stat) => (
                      <FormInput
                        key={stat}
                        id={`character-${stat}-${index}`}
                        label={stat}
                        type="number"
                        placeholder="10"
                        value={character.stats?.[stat] || ''}
                        onChange={(e) =>
                          onAbilityScoreChange(
                            index,
                            stat,
                            Number(e.target.value),
                          )
                        }
                        className="input-sm"
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
