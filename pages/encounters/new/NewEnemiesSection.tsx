import React, { useEffect, useState } from 'react';
import { EncounterCharacter } from '../../../types/encounters';
import { FormInput } from '../../../components/FormInput';
import { Button } from '../../../components/Button';
import { generateMongoId } from '../../../lib/mongo';
import { logger } from '../../../lib/logger';

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
  // Ability scores
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Keep track of which monster is selected for each enemy row
  const [selectedMonsterNames, setSelectedMonsterNames] = useState<{
    [key: number]: string;
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

  // Parse ability score from string (e.g., "18" from "18 (+4)")
  const parseAbilityScore = (abilityString: string): number => {
    return parseInt(abilityString, 10) || 0;
  };

  const handleEnemyFieldChange = (
    index: number,
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    const updated = [...enemies];
    // Ensure stats object exists if we are modifying it
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
      // Prevent direct object assignment if not stats
      logger.warn('Attempted to assign object to non-stats field', {
        field,
        value,
      });

      return;
    }

    updated[index] = { ...updated[index], [field]: value };
    onEnemiesChange(updated);

    // If name is manually changed, clear the dropdown selection for that row
    if (field === 'name') {
      setSelectedMonsterNames((prev) => ({ ...prev, [index]: '' }));
    }
  };

  const handleMonsterSelectChange = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const monsterName = event.target.value;
    setSelectedMonsterNames((prev) => ({ ...prev, [index]: monsterName }));

    const updated = [...enemies];
    if (monsterName) {
      const selectedMonster = monsters.find((m) => m.name === monsterName);
      if (selectedMonster) {
        updated[index] = {
          ...updated[index], // Keep existing _id
          name: selectedMonster.name,
          maxHP: parseStat(selectedMonster['Hit Points']),
          armorClass: parseStat(selectedMonster['Armor Class']),
          // Add new fields
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
          monsterSource: selectedMonster.name, // Track the source monster
        };
      }
    } else {
      // Reset if "Select a monster" is chosen, keep the ID
      updated[index] = {
        ...updated[index],
        name: '',
        maxHP: 0,
        armorClass: 0,
        // Clear the additional fields
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

  // Helper for updating ability scores
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
        }), // Ensure stats object exists
        [ability]: value,
      },
    };

    onEnemiesChange(updated);
  };

  const addEnemy = () => {
    onEnemiesChange([
      ...enemies,
      {
        name: '',
        maxHP: 0,
        armorClass: 0,
        _id: generateMongoId(),
      },
    ]);
  };

  const removeEnemy = (index: number) => {
    onEnemiesChange(enemies.filter((_, i) => i !== index));
    // Also remove the selected monster name for the removed row
    setSelectedMonsterNames((prev) => {
      const { [index]: _, ...rest } = prev;
      // Adjust keys for subsequent enemies
      const adjusted: { [key: number]: string } = {};
      Object.keys(rest).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        if (key > index) {
          adjusted[key - 1] = rest[key];
        } else {
          adjusted[key] = rest[key];
        }
      });

      return adjusted;
    });
  };

  return (
    <div className="mb-4">
      <label className="label text-lg font-semibold">Enemies</label>

      {isLoading && <p>Loading monster list...</p>}
      {error && <p className="text-error">Error loading monsters: {error}</p>}

      <div className="space-y-2">
        {enemies.map((enemy, index) => (
          <div
            key={enemy._id}
            className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
          >
            <input type="checkbox" defaultChecked />{' '}
            {/* Make open by default */}
            <div className="collapse-title text-lg font-medium flex justify-between items-center pr-14">
              {/* Title: Enemy Name */}
              <span className="truncate">
                {enemy.name || `Enemy ${index + 1} (Unnamed)`}
              </span>

              {/* Remove Button */}
              <Button
                variant="error"
                className="btn-sm btn-circle absolute top-2 right-2 z-10 opacity-50 hover:opacity-100"
                onClick={() => {
                  removeEnemy(index);
                }}
                aria-label="Remove Enemy"
                label="✕"
              />
            </div>
            <div className="collapse-content bg-base-200 p-3">
              {/* Monster Select Dropdown */}
              {!isLoading && !error && monsters.length > 0 && (
                <div
                  className="form-control w-full mb-2"
                  style={{ maxWidth: '400px' }}
                >
                  <label className="label">
                    <span className="label-text">Select Monster</span>
                  </label>
                  <select
                    className="select select-bordered w-full select-sm"
                    value={selectedMonsterNames[index] || ''}
                    onChange={(e) => handleMonsterSelectChange(index, e)}
                    disabled={isLoading}
                  >
                    <option value="">Or enter manually below</option>
                    {monsters.map((monster) => (
                      <option key={monster._id} value={monster.name}>
                        {monster.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="divider">OR</div>

              {/* --- Manual Entry Fields --- */}
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

              {/* --- Advanced Fields Collapse --- */}
              <div className="collapse collapse-plus border border-base-300 bg-base-100 rounded-box">
                <input type="checkbox" defaultChecked />{' '}
                {/* Make open by default */}
                <div className="collapse-title text-md font-medium">
                  Advanced Monster Fields
                </div>
                <div className="collapse-content p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Meta */}
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
                    {/* Speed */}
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

                  {/* Stats */}
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

                  {/* Challenge */}
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

                  {/* Traits Text Area */}
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
                        handleEnemyFieldChange(index, 'traits', e.target.value)
                      }
                    ></textarea>
                  </div>

                  {/* Actions Text Area */}
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
                        handleEnemyFieldChange(index, 'actions', e.target.value)
                      }
                    ></textarea>
                  </div>

                  {/* Legendary Actions Text Area */}
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
                {/* End Advanced Fields Collapse Content */}
              </div>
              {/* End Advanced Fields Collapse */}
            </div>
            {/* End Main Collapse Content */}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Button variant="secondary" label="Add Enemy" onClick={addEnemy} />
      </div>
    </div>
  );
};

export default NewEnemiesSection;
