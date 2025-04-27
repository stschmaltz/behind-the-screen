import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { FormInput } from '../../../components/FormInput';
import { EncounterCharacter } from '../../../types/encounters';
import { useModal } from '../../../hooks/use-modal';
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

  STR: string;
  DEX: string;
  CON: string;
  INT: string;
  WIS: string;
  CHA: string;
}

interface Props {
  onAddEnemy: (enemy: EncounterCharacter) => void;
}

const INITIAL_ENEMY_STATE: EncounterCharacter = {
  name: '',
  maxHP: 0,
  armorClass: 0,
  _id: '',
  stats: {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  },
};

const NewEnemyModal: React.FC<Props> = ({ onAddEnemy }) => {
  const [newEnemy, setNewEnemy] =
    useState<EncounterCharacter>(INITIAL_ENEMY_STATE);
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [selectedMonsterName, setSelectedMonsterName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showModal, closeModal } = useModal('new-enemy-modal');

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

  const parseAbilityScore = (abilityString: string): number => {
    return parseInt(abilityString, 10) || 0;
  };

  const handleMonsterSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const monsterName = event.target.value;
    setSelectedMonsterName(monsterName);

    if (monsterName) {
      const selectedMonster = monsters.find((m) => m.name === monsterName);
      if (selectedMonster) {
        setNewEnemy({
          _id: generateMongoId(),
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
        });
      }
    } else {
      setNewEnemy({ ...INITIAL_ENEMY_STATE, _id: generateMongoId() });
    }
  };

  const handleManualChange = (
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    setNewEnemy((prev) => ({
      ...prev,
      [field]: field === 'name' ? value : Number(value),
    }));

    if (field === 'name') {
      setSelectedMonsterName('');
    }
  };

  const handleAbilityScoreChange = (
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
    value: number,
  ) => {
    if (!newEnemy.stats) {
      setNewEnemy((prev) => ({
        ...prev,
        stats: {
          STR: ability === 'STR' ? value : 10,
          DEX: ability === 'DEX' ? value : 10,
          CON: ability === 'CON' ? value : 10,
          INT: ability === 'INT' ? value : 10,
          WIS: ability === 'WIS' ? value : 10,
          CHA: ability === 'CHA' ? value : 10,
        },
      }));
    } else {
      setNewEnemy((prev) => ({
        ...prev,
        stats: {
          ...prev.stats!,
          [ability]: value,
        },
      }));
    }
  };

  const handleSubmit = () => {
    if (!newEnemy.name || newEnemy.maxHP <= 0 || newEnemy.armorClass <= 0) {
      alert('Please select a monster or fill in all fields with valid values.');

      return;
    }
    onAddEnemy(newEnemy);

    setSelectedMonsterName('');
    setNewEnemy(INITIAL_ENEMY_STATE);
    closeModal();
  };

  return (
    <>
      <Button variant="primary" label="Add Enemy" onClick={showModal} />
      <dialog className="modal" id="new-enemy-modal">
        <div className="modal-box">
          <h2 className="text-2xl font-bold mb-4">Add New Enemy</h2>

          {isLoading && <p>Loading monsters...</p>}
          {error && <p className="text-error">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Select Monster</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedMonsterName}
                onChange={handleMonsterSelectChange}
                disabled={isLoading}
              >
                <option value="">Select a monster</option>
                {monsters.map((monster) => (
                  <option key={monster._id} value={monster.name}>
                    {monster.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <FormInput
            label="Name"
            id="name"
            value={newEnemy.name}
            onChange={(e) => handleManualChange('name', e.target.value)}
            placeholder="Or enter manually"
          />

          <div className="flex gap-4">
            <FormInput
              label="HP"
              id="health"
              type="number"
              value={newEnemy.maxHP}
              onChange={(e) =>
                handleManualChange('maxHP', Number(e.target.value))
              }
              min={1}
              width="w-32"
            />
            <FormInput
              label="AC"
              id="armorClass"
              type="number"
              value={newEnemy.armorClass}
              onChange={(e) =>
                handleManualChange('armorClass', Number(e.target.value))
              }
              min={1}
              width="w-32"
            />
          </div>

          <div className="collapse collapse-arrow bg-base-200 mt-4">
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              Advanced Monster Fields
            </div>
            <div className="collapse-content">
              <FormInput
                label="Type & Alignment"
                id="meta"
                value={newEnemy.meta || ''}
                onChange={(e) => handleManualChange('meta', e.target.value)}
                placeholder="e.g., Large undead, chaotic evil"
                className="mb-2"
              />

              <FormInput
                label="Speed"
                id="speed"
                value={newEnemy.speed || ''}
                onChange={(e) => handleManualChange('speed', e.target.value)}
                placeholder="e.g., 30 ft., fly 60 ft."
                className="mb-2"
              />

              <FormInput
                label="Challenge Rating"
                id="challenge"
                value={newEnemy.challenge || ''}
                onChange={(e) =>
                  handleManualChange('challenge', e.target.value)
                }
                placeholder="e.g., 5 (1,800 XP)"
                className="mb-2"
              />

              <label className="label">Ability Scores</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <FormInput
                  label="STR"
                  id="str"
                  type="number"
                  value={newEnemy.stats?.STR || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleAbilityScoreChange('STR', value);
                  }}
                  className="w-full"
                />
                <FormInput
                  label="DEX"
                  id="dex"
                  type="number"
                  value={newEnemy.stats?.DEX || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleAbilityScoreChange('DEX', value);
                  }}
                  className="w-full"
                />
                <FormInput
                  label="CON"
                  id="con"
                  type="number"
                  value={newEnemy.stats?.CON || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleAbilityScoreChange('CON', value);
                  }}
                  className="w-full"
                />
                <FormInput
                  label="INT"
                  id="int"
                  type="number"
                  value={newEnemy.stats?.INT || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleAbilityScoreChange('INT', value);
                  }}
                  className="w-full"
                />
                <FormInput
                  label="WIS"
                  id="wis"
                  type="number"
                  value={newEnemy.stats?.WIS || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleAbilityScoreChange('WIS', value);
                  }}
                  className="w-full"
                />
                <FormInput
                  label="CHA"
                  id="cha"
                  type="number"
                  value={newEnemy.stats?.CHA || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleAbilityScoreChange('CHA', value);
                  }}
                  className="w-full"
                />
              </div>

              <FormInput
                label="Image URL"
                id="img_url"
                value={newEnemy.img_url || ''}
                onChange={(e) => handleManualChange('img_url', e.target.value)}
                placeholder="URL to monster image"
                className="mb-2"
              />

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Traits (HTML supported)</span>
                </label>
                <textarea
                  id="traits"
                  value={newEnemy.traits || ''}
                  onChange={(e) => handleManualChange('traits', e.target.value)}
                  placeholder="Special abilities and traits"
                  className="textarea textarea-bordered h-24"
                />
              </div>

              <div className="form-control w-full mt-2">
                <label className="label">
                  <span className="label-text">Actions (HTML supported)</span>
                </label>
                <textarea
                  id="actions"
                  value={newEnemy.actions || ''}
                  onChange={(e) =>
                    handleManualChange('actions', e.target.value)
                  }
                  placeholder="Attack actions and abilities"
                  className="textarea textarea-bordered h-24"
                />
              </div>

              <div className="form-control w-full mt-2">
                <label className="label">
                  <span className="label-text">
                    Legendary Actions (HTML supported)
                  </span>
                </label>
                <textarea
                  id="legendaryActions"
                  value={newEnemy.legendaryActions || ''}
                  onChange={(e) =>
                    handleManualChange('legendaryActions', e.target.value)
                  }
                  placeholder="Legendary actions (if any)"
                  className="textarea textarea-bordered h-24"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-4">
            <Button
              variant="primary"
              label="Add Enemy"
              onClick={handleSubmit}
              disabled={
                !newEnemy.name ||
                newEnemy.maxHP <= 0 ||
                newEnemy.armorClass <= 0
              }
            />
            <Button variant="error" label="Cancel" onClick={closeModal} />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              setSelectedMonsterName('');
              setNewEnemy(INITIAL_ENEMY_STATE);
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
};

export default NewEnemyModal;
