import React from 'react';
import { DocumentDuplicateIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EncounterCharacter } from '../../../types/encounters';
import { FormInput } from '../../../components/FormInput';
import MonsterCombobox from '../../../components/MonsterCombobox';
import { MonsterData, MonsterOption } from '../../../hooks/use-monsters.hook';
import { Button } from '../../../components/Button';

interface EnemyCardProps {
  enemy: EncounterCharacter;
  index: number;
  selectedMonsterName: string;
  isLoading: boolean;
  monsterOptions: MonsterOption[];
  collapseRef: (el: HTMLInputElement | null) => void;
  error: string | null;
  monsters: MonsterData[];
  isExpanded?: boolean;
  onMonsterSelectChange: (index: number, value: string) => void;
  onEnemyFieldChange: (
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

const EnemyCard: React.FC<EnemyCardProps> = ({
  enemy,
  index,
  selectedMonsterName,
  isLoading,
  monsterOptions,
  collapseRef,
  error,
  monsters,
  isExpanded = true,
  onMonsterSelectChange,
  onEnemyFieldChange,
  onAbilityScoreChange,
  onRemove,
  onDuplicate,
}) => {
  return (
    <div className="relative">
      <div className="absolute top-4 right-10 z-10 flex gap-1">
        <Button
          variant="secondary"
          className="btn-square btn-xs"
          onClick={() => onDuplicate(index)}
          tooltip="Duplicate Enemy"
          icon={<DocumentDuplicateIcon className="w-4 h-4" />}
        />
        <Button
          variant="secondary"
          className="btn-square btn-xs bg-error bg-opacity-10 hover:bg-error hover:bg-opacity-20"
          onClick={() => onRemove(index)}
          tooltip="Remove Enemy"
          icon={<TrashIcon className="w-4 h-4 text-error" />}
        />
      </div>
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input
          type="checkbox"
          defaultChecked={isExpanded}
          className="peer"
          ref={collapseRef}
        />
        <div
          className="collapse-title text-lg font-medium flex justify-between items-center peer-checked:bg-base-200 peer-checked:text-base-content pr-24
        "
        >
          <span>{enemy.name || `New Enemy ${index + 1}`}</span>
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

          <div className="divider">OR</div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <FormInput
              id={`enemy-name-${index}`}
              label="Name"
              type="text"
              placeholder="Goblin"
              value={enemy.name}
              onChange={(e) =>
                onEnemyFieldChange(index, 'name', e.target.value)
              }
            />
            <FormInput
              id={`enemy-hp-${index}`}
              label="HP"
              type="number"
              placeholder="7"
              value={enemy.maxHP || ''}
              onChange={(e) =>
                onEnemyFieldChange(index, 'maxHP', Number(e.target.value))
              }
            />
            <FormInput
              id={`enemy-ac-${index}`}
              label="AC"
              type="number"
              placeholder="15"
              value={enemy.armorClass || ''}
              onChange={(e) =>
                onEnemyFieldChange(index, 'armorClass', Number(e.target.value))
              }
            />
          </div>

          <div className="collapse collapse-arrow bg-base-200 mt-4">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium peer-checked:bg-base-300 peer-checked:text-base-content">
              Advanced Monster Fields
            </div>
            <div className="collapse-content peer-checked:bg-base-200 peer-checked:text-base-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FormInput
                  id={`enemy-meta-${index}`}
                  label="Meta (Size, Type, Alignment)"
                  type="text"
                  placeholder="Small humanoid (goblinoid), neutral evil"
                  value={enemy.meta || ''}
                  onChange={(e) =>
                    onEnemyFieldChange(index, 'meta', e.target.value)
                  }
                />
                <FormInput
                  id={`enemy-speed-${index}`}
                  label="Speed"
                  type="text"
                  placeholder="30 ft."
                  value={enemy.speed || ''}
                  onChange={(e) =>
                    onEnemyFieldChange(index, 'speed', e.target.value)
                  }
                />
              </div>

              <div className="mt-2">
                <label className="label">
                  <span className="label-text font-medium">Stats</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map(
                    (stat) => (
                      <FormInput
                        key={stat}
                        id={`enemy-${stat}-${index}`}
                        label={stat}
                        type="number"
                        placeholder="10"
                        value={enemy.stats?.[stat] || ''}
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

              <div className="mt-2">
                <FormInput
                  id={`enemy-challenge-${index}`}
                  label="Challenge"
                  type="text"
                  placeholder="1/4 (50 XP)"
                  value={enemy.challenge || ''}
                  onChange={(e) =>
                    onEnemyFieldChange(index, 'challenge', e.target.value)
                  }
                />
              </div>

              <div className="mt-2">
                <label htmlFor={`enemy-traits-${index}`} className="label">
                  <span className="label-text font-medium">Traits</span>
                </label>
                <textarea
                  id={`enemy-traits-${index}`}
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Nimble Escape. The goblin can take the Disengage or Hide action as a bonus action on each of its turns."
                  value={enemy.traits || ''}
                  onChange={(e) =>
                    onEnemyFieldChange(index, 'traits', e.target.value)
                  }
                ></textarea>
              </div>

              <div className="mt-2">
                <label htmlFor={`enemy-actions-${index}`} className="label">
                  <span className="label-text font-medium">Actions</span>
                </label>
                <textarea
                  id={`enemy-actions-${index}`}
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage."
                  value={enemy.actions || ''}
                  onChange={(e) =>
                    onEnemyFieldChange(index, 'actions', e.target.value)
                  }
                ></textarea>
              </div>

              <div className="mt-2">
                <label htmlFor={`enemy-legendary-${index}`} className="label">
                  <span className="label-text font-medium">
                    Legendary Actions (Optional)
                  </span>
                </label>
                <textarea
                  id={`enemy-legendary-${index}`}
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="The dragon can take 3 legendary actions..."
                  value={enemy.legendaryActions || ''}
                  onChange={(e) =>
                    onEnemyFieldChange(
                      index,
                      'legendaryActions',
                      e.target.value,
                    )
                  }
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnemyCard;
