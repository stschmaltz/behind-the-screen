import React, { useEffect, useState } from 'react';
import { EncounterCharacter } from '../../../../types/encounters';
import MonsterCombobox from '../../../../components/MonsterCombobox';
import { generateMongoId } from '../../../../lib/mongo';
import { logger } from '../../../../lib/logger';

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

interface Props {
  onMonsterSelect: (enemy: EncounterCharacter, monsterName: string) => void;
  selectedMonsterName: string;
}

const MonsterSelector: React.FC<Props> = ({
  onMonsterSelect,
  selectedMonsterName,
}) => {
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [monsterOptions, setMonsterOptions] = useState<MonsterOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleMonsterSelectChange = (monsterName: string) => {
    if (monsterName) {
      const selectedMonster = monsters.find((m) => m.name === monsterName);
      if (selectedMonster) {
        const enemyCharacter: EncounterCharacter = {
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
        };
        onMonsterSelect(enemyCharacter, monsterName);
      }
    } else {
      onMonsterSelect(
        {
          _id: generateMongoId(),
          name: '',
          maxHP: 0,
          armorClass: 0,
          stats: {
            STR: 10,
            DEX: 10,
            CON: 10,
            INT: 10,
            WIS: 10,
            CHA: 10,
          },
        },
        '',
      );
    }
  };

  return (
    <>
      {isLoading && <p>Loading monsters...</p>}
      {error && <p className="text-error">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Select or Search Monster</span>
          </label>
          <MonsterCombobox
            options={monsterOptions}
            value={selectedMonsterName}
            onChange={handleMonsterSelectChange}
            placeholder="Type to search or select a monster"
            disabled={isLoading}
          />
        </div>
      )}
    </>
  );
};

export default MonsterSelector;
