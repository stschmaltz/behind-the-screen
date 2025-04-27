import React, { useEffect, useState } from 'react';
import { EncounterCharacter } from '../../../types/encounters';
import { FormInput } from '../../../components/FormInput';
import { Button } from '../../../components/Button';
import { generateMongoId } from '../../../lib/mongo';
import { logger } from '../../../lib/logger';
import MonsterCombobox from '../../../components/MonsterCombobox';

interface MonsterOption {
  _id: string;
  name: string;
  [key: string]: unknown;
}

interface MonsterData {
  _id: string;
  name: string;
  'Hit Points': string;
  'Armor Class': string;
  meta: string;
  Speed: string;
  Challenge: string;
  Traits: string;
  Actions: string;
  'Legendary Actions'?: string;
  img_url?: string;
  STR: string;
  DEX: string;
  CON: string;
  INT: string;
  WIS: string;
  CHA: string;
}

interface NewEnemiesSectionProps {
  enemies: EncounterCharacter[];
  onEnemiesChange: (updatedEnemies: EncounterCharacter[]) => void;
}

const NewEnemiesSection: React.FC<NewEnemiesSectionProps> = ({
  enemies,
  onEnemiesChange,
}) => {
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [monsterOptions, setMonsterOptions] = useState<MonsterOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonsterNames, setSelectedMonsterNames] = useState<{
    [key: number]: string;
  }>({});
  const [advancedOpenState, setAdvancedOpenState] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const fetchMonsters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/monsters');
        if (!response.ok) {
          throw new Error('Failed to fetch monsters');
        }
        const data: MonsterData[] = await response.json();
        setMonsters(data);

        // Map monster data to the format expected by MonsterCombobox
        const options: MonsterOption[] = data.map((monster) => ({
          _id: monster._id,
          name: monster.name,
          original: monster,
        }));
        setMonsterOptions(options);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        logger.error('Error fetching monsters:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonsters();
  }, []);

  const parseStat = (statString: string): number => {
    const match = statString.match(/^\d+/);

    return match ? parseInt(match[0], 10) : 0;
  };

  const parseAbilityScore = (abilityString: string): number => {
    return parseInt(abilityString, 10) || 0;
  };

  const handleEnemyFieldChange = (
    index: number,
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    const updated = [...enemies];
    if (
      field === 'stats' &&
      value &&
      typeof value === 'object' &&
      !updated[index].stats
    ) {
      updated[index] = {
        ...updated[index],
        stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      };
    } else if (typeof value === 'object') {
      logger.warn('Attempted to assign object to non-stats field', {
        field,
        value,
      });

      return;
    }

    updated[index] = { ...updated[index], [field]: value };
    onEnemiesChange(updated);

    if (field === 'name') {
      setSelectedMonsterNames((prev) => ({ ...prev, [index]: '' }));
    }
  };

  const handleMonsterSelectChange = (index: number, monsterName: string) => {
    setSelectedMonsterNames((prev) => ({ ...prev, [index]: monsterName }));

    const updated = [...enemies];
    if (monsterName) {
      const selectedMonster = monsters.find((m) => m.name === monsterName);
      if (selectedMonster) {
        updated[index] = {
          ...updated[index],
          name: selectedMonster.name,
          maxHP: parseStat(selectedMonster['Hit Points']),
          armorClass: parseStat(selectedMonster['Armor Class']),
          meta: selectedMonster.meta,
          speed: selectedMonster.Speed,
          stats: {
            STR: parseAbilityScore(selectedMonster.STR),
            DEX: parseAbilityScore(selectedMonster.DEX),
            CON: parseAbilityScore(selectedMonster.CON),
            INT: parseAbilityScore(selectedMonster.INT),
            WIS: parseAbilityScore(selectedMonster.WIS),
            CHA: parseAbilityScore(selectedMonster.CHA),
          },
          challenge: selectedMonster.Challenge,
          traits: selectedMonster.Traits,
          actions: selectedMonster.Actions,
          legendaryActions: selectedMonster['Legendary Actions'],
          img_url: selectedMonster.img_url,
          monsterSource: selectedMonster.name,
        };
      }
    } else {
      updated[index] = {
        ...updated[index],
        name: '',
        maxHP: 0,
        armorClass: 0,
        meta: undefined,
        speed: undefined,
        stats: undefined,
        challenge: undefined,
        traits: undefined,
        actions: undefined,
        legendaryActions: undefined,
        img_url: undefined,
        monsterSource: undefined,
      };
    }
    onEnemiesChange(updated);
  };

  const handleAbilityScoreChange = (
    index: number,
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
    value: number,
  ) => {
    const updated = [...enemies];
    const enemy = updated[index];

    updated[index] = {
      ...enemy,
      stats: {
        ...(enemy.stats || {
          STR: 10,
          DEX: 10,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10,
        }),
        [ability]: value,
      },
    };

    onEnemiesChange(updated);
  };

  const toggleAdvanced = (index: number) => {
    setAdvancedOpenState((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const addEnemy = () => {
    const newId = generateMongoId();
    onEnemiesChange([
      ...enemies,
      {
        name: '',
        maxHP: 0,
        armorClass: 0,
        _id: newId,
      },
    ]);

    setAdvancedOpenState((prev) => ({ ...prev, [enemies.length]: false }));
  };

  const removeEnemy = (index: number) => {
    onEnemiesChange(enemies.filter((_, i) => i !== index));

    setSelectedMonsterNames((prev) => {
      const { [index]: _, ...rest } = prev;
      const adjusted: { [key: number]: string } = {};
      Object.keys(rest).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        adjusted[key > index ? key - 1 : key] = rest[key];
      });

      return adjusted;
    });

    setAdvancedOpenState((prev) => {
      const { [index]: _, ...rest } = prev;
      const adjusted: { [key: number]: boolean } = {};
      Object.keys(rest).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        adjusted[key > index ? key - 1 : key] = rest[key];
      });

      return adjusted;
    });
  };

  return (
    <div className="mb-4">
      <label className="label text-lg font-semibold">Enemies</label>

      {isLoading && <p>Loading monster list...</p>}
      {error && <p className="text-error">Error loading monsters: {error}</p>}

      <div className="space-y-4">
        {enemies.map((enemy, index) => (
          <div key={enemy._id} className="relative">
            <Button
              variant="error"
              label="Remove"
              onClick={(e) => {
                e?.stopPropagation();
                removeEnemy(index);
              }}
              className="absolute top-4 right-14 z-10 btn-circle btn-ghost btn-sm text-error"
              tooltip="Remove Enemy"
            />
            <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
              <input type="checkbox" defaultChecked className="peer" />
              <div className="collapse-title text-lg font-medium flex justify-between items-center peer-checked:bg-base-200 peer-checked:text-base-content">
                <span>{enemy.name || `New Enemy ${index + 1}`}</span>
              </div>
              <div className="collapse-content peer-checked:bg-base-100 peer-checked:text-base-content">
                {!isLoading && !error && monsters.length > 0 && (
                  <div
                    className="form-control w-full mb-2"
                    style={{ maxWidth: '400px' }}
                  >
                    <label className="label">
                      <span className="label-text">
                        Select or Search Monster
                      </span>
                    </label>
                    <MonsterCombobox
                      options={monsterOptions}
                      value={selectedMonsterNames[index] || ''}
                      onChange={(value) =>
                        handleMonsterSelectChange(index, value)
                      }
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
                      handleEnemyFieldChange(index, 'name', e.target.value)
                    }
                  />
                  <FormInput
                    id={`enemy-hp-${index}`}
                    label="HP"
                    type="number"
                    placeholder="7"
                    value={enemy.maxHP || ''}
                    onChange={(e) =>
                      handleEnemyFieldChange(
                        index,
                        'maxHP',
                        Number(e.target.value),
                      )
                    }
                  />
                  <FormInput
                    id={`enemy-ac-${index}`}
                    label="AC"
                    type="number"
                    placeholder="15"
                    value={enemy.armorClass || ''}
                    onChange={(e) =>
                      handleEnemyFieldChange(
                        index,
                        'armorClass',
                        Number(e.target.value),
                      )
                    }
                  />
                </div>

                <div className="collapse collapse-arrow bg-base-200 mt-4">
                  <input
                    type="checkbox"
                    checked={!!advancedOpenState[index]}
                    onChange={() => toggleAdvanced(index)}
                    className="peer"
                  />
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
                          handleEnemyFieldChange(index, 'meta', e.target.value)
                        }
                      />
                      <FormInput
                        id={`enemy-speed-${index}`}
                        label="Speed"
                        type="text"
                        placeholder="30 ft."
                        value={enemy.speed || ''}
                        onChange={(e) =>
                          handleEnemyFieldChange(index, 'speed', e.target.value)
                        }
                      />
                    </div>

                    <div className="mt-2">
                      <label className="label">
                        <span className="label-text font-medium">Stats</span>
                      </label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {(
                          ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const
                        ).map((stat) => (
                          <FormInput
                            key={stat}
                            id={`enemy-${stat}-${index}`}
                            label={stat}
                            type="number"
                            placeholder="10"
                            value={enemy.stats?.[stat] || ''}
                            onChange={(e) =>
                              handleAbilityScoreChange(
                                index,
                                stat,
                                Number(e.target.value),
                              )
                            }
                            className="input-sm"
                          />
                        ))}
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
                          handleEnemyFieldChange(
                            index,
                            'challenge',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="mt-2">
                      <label
                        htmlFor={`enemy-traits-${index}`}
                        className="label"
                      >
                        <span className="label-text font-medium">Traits</span>
                      </label>
                      <textarea
                        id={`enemy-traits-${index}`}
                        className="textarea textarea-bordered w-full h-24"
                        placeholder="Nimble Escape. The goblin can take the Disengage or Hide action as a bonus action on each of its turns."
                        value={enemy.traits || ''}
                        onChange={(e) =>
                          handleEnemyFieldChange(
                            index,
                            'traits',
                            e.target.value,
                          )
                        }
                      ></textarea>
                    </div>

                    <div className="mt-2">
                      <label
                        htmlFor={`enemy-actions-${index}`}
                        className="label"
                      >
                        <span className="label-text font-medium">Actions</span>
                      </label>
                      <textarea
                        id={`enemy-actions-${index}`}
                        className="textarea textarea-bordered w-full h-24"
                        placeholder="Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage."
                        value={enemy.actions || ''}
                        onChange={(e) =>
                          handleEnemyFieldChange(
                            index,
                            'actions',
                            e.target.value,
                          )
                        }
                      ></textarea>
                    </div>

                    <div className="mt-2">
                      <label
                        htmlFor={`enemy-legendary-${index}`}
                        className="label"
                      >
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
                          handleEnemyFieldChange(
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
        ))}
      </div>

      <Button
        variant="secondary"
        label={enemies.length > 0 ? 'Add Another Enemy' : 'Add Enemy'}
        onClick={addEnemy}
        className="mt-4 w-full"
      />
    </div>
  );
};

export default NewEnemiesSection;
