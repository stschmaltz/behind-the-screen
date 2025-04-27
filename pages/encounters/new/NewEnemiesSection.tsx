import React, { ChangeEvent, useEffect, useState } from 'react';
import { EncounterCharacter } from '../../../types/encounters';
import { FormInput } from '../../../components/FormInput';
import { Button } from '../../../components/Button';
import { generateMongoId } from '../../../lib/mongo';

// Define a type for the monster data structure from the API
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
        console.error('Error fetching monsters:', err);
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

    if (!enemy.stats) {
      updated[index] = {
        ...enemy,
        stats: {
          STR: ability === 'STR' ? value : 10,
          DEX: ability === 'DEX' ? value : 10,
          CON: ability === 'CON' ? value : 10,
          INT: ability === 'INT' ? value : 10,
          WIS: ability === 'WIS' ? value : 10,
          CHA: ability === 'CHA' ? value : 10,
        },
      };
    } else {
      updated[index] = {
        ...enemy,
        stats: {
          ...enemy.stats,
          [ability]: value,
        },
      };
    }

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

      return rest;
    });
  };

  return (
    <div className="mb-4">
      <label className="label text-lg font-semibold">Enemies</label>

      {isLoading && <p>Loading monster list...</p>}
      {error && <p className="text-error">Error loading monsters: {error}</p>}

      {enemies.map((enemy, index) => (
        <div
          key={enemy._id}
          className="p-4 mb-4 border rounded-md shadow-sm bg-base-200"
        >
          <div className="flex gap-4 items-end flex-wrap mb-2">
            {/* Monster Select Dropdown */}
            {!isLoading && !error && monsters.length > 0 && (
              <div
                className="form-control flex-grow"
                style={{ minWidth: '200px' }}
              >
                <label className="label">
                  <span className="label-text">Select Monster</span>
                </label>
                <select
                  className="select select-bordered w-full"
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

            {/* Basic Inputs */}
            <FormInput
              id={`enemy-name-${enemy._id}`}
              label="Name"
              value={enemy.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleEnemyFieldChange(index, 'name', e.target.value)
              }
              placeholder="Name"
              className="flex-grow min-w-[150px]"
            />
            <FormInput
              id={`enemy-maxHP-${enemy._id}`}
              label="HP"
              type="number"
              value={enemy.maxHP}
              min={1}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleEnemyFieldChange(index, 'maxHP', Number(e.target.value));
              }}
              className="w-20"
            />
            <FormInput
              id={`enemy-armorClass-${enemy._id}`}
              label="AC"
              type="number"
              value={enemy.armorClass}
              min={1}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleEnemyFieldChange(
                  index,
                  'armorClass',
                  Number(e.target.value),
                )
              }
              className="w-20"
            />
            <Button
              variant="error"
              label="Remove"
              onClick={() => removeEnemy(index)}
              className="btn-sm self-end"
            />
          </div>

          {/* Advanced Fields Section - Collapsible */}
          <div className="collapse collapse-arrow bg-base-300 mt-2">
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              Advanced Monster Fields
            </div>
            <div className="collapse-content">
              {/* Monster type and alignment */}
              <FormInput
                label="Type & Alignment"
                id={`meta-${enemy._id}`}
                value={enemy.meta || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleEnemyFieldChange(index, 'meta', e.target.value)
                }
                placeholder="e.g., Large undead, chaotic evil"
                className="mb-2"
              />

              {/* Speed */}
              <FormInput
                label="Speed"
                id={`speed-${enemy._id}`}
                value={enemy.speed || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleEnemyFieldChange(index, 'speed', e.target.value)
                }
                placeholder="e.g., 30 ft., fly 60 ft."
                className="mb-2"
              />

              {/* Challenge Rating */}
              <FormInput
                label="Challenge Rating"
                id={`challenge-${enemy._id}`}
                value={enemy.challenge || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleEnemyFieldChange(index, 'challenge', e.target.value)
                }
                placeholder="e.g., 5 (1,800 XP)"
                className="mb-2"
              />

              {/* Ability Scores */}
              <label className="label">Ability Scores</label>
              <div className="grid grid-cols-3 gap-2 mb-2 w-full">
                <FormInput
                  label="STR"
                  id={`str-${enemy._id}`}
                  type="number"
                  value={enemy.stats?.STR || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAbilityScoreChange(
                      index,
                      'STR',
                      Number(e.target.value),
                    )
                  }
                  className="w-full"
                />
                <FormInput
                  label="DEX"
                  id={`dex-${enemy._id}`}
                  type="number"
                  value={enemy.stats?.DEX || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAbilityScoreChange(
                      index,
                      'DEX',
                      Number(e.target.value),
                    )
                  }
                  className="w-full"
                />
                <FormInput
                  label="CON"
                  id={`con-${enemy._id}`}
                  type="number"
                  value={enemy.stats?.CON || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAbilityScoreChange(
                      index,
                      'CON',
                      Number(e.target.value),
                    )
                  }
                  className="w-full"
                />
                <FormInput
                  label="INT"
                  id={`int-${enemy._id}`}
                  type="number"
                  value={enemy.stats?.INT || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAbilityScoreChange(
                      index,
                      'INT',
                      Number(e.target.value),
                    )
                  }
                  className="w-full"
                />
                <FormInput
                  label="WIS"
                  id={`wis-${enemy._id}`}
                  type="number"
                  value={enemy.stats?.WIS || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAbilityScoreChange(
                      index,
                      'WIS',
                      Number(e.target.value),
                    )
                  }
                  className="w-full"
                />
                <FormInput
                  label="CHA"
                  id={`cha-${enemy._id}`}
                  type="number"
                  value={enemy.stats?.CHA || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAbilityScoreChange(
                      index,
                      'CHA',
                      Number(e.target.value),
                    )
                  }
                  className="w-full"
                />
              </div>

              {/* Image URL */}
              <FormInput
                label="Image URL"
                id={`img_url-${enemy._id}`}
                value={enemy.img_url || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleEnemyFieldChange(index, 'img_url', e.target.value)
                }
                placeholder="URL to monster image"
                className="mb-2"
              />

              {/* Traits */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Traits (HTML supported)</span>
                </label>
                <textarea
                  id={`traits-${enemy._id}`}
                  value={enemy.traits || ''}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    handleEnemyFieldChange(index, 'traits', e.target.value)
                  }
                  placeholder="Special abilities and traits"
                  className="textarea textarea-bordered h-24"
                />
              </div>

              {/* Actions */}
              <div className="form-control w-full mt-2">
                <label className="label">
                  <span className="label-text">Actions (HTML supported)</span>
                </label>
                <textarea
                  id={`actions-${enemy._id}`}
                  value={enemy.actions || ''}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    handleEnemyFieldChange(index, 'actions', e.target.value)
                  }
                  placeholder="Attack actions and abilities"
                  className="textarea textarea-bordered h-24"
                />
              </div>

              {/* Legendary Actions */}
              <div className="form-control w-full mt-2">
                <label className="label">
                  <span className="label-text">
                    Legendary Actions (HTML supported)
                  </span>
                </label>
                <textarea
                  id={`legendaryActions-${enemy._id}`}
                  value={enemy.legendaryActions || ''}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    handleEnemyFieldChange(
                      index,
                      'legendaryActions',
                      e.target.value,
                    )
                  }
                  placeholder="Legendary actions (if any)"
                  className="textarea textarea-bordered h-24"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="secondary"
        label="Add Another Enemy"
        onClick={addEnemy}
        className="btn-sm mt-2"
        disabled={isLoading}
      />
    </div>
  );
};

export default NewEnemiesSection;
