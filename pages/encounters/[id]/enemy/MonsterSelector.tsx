import React from 'react';
import { EncounterCharacter } from '../../../../types/encounters';
import MonsterCombobox from '../../../../components/MonsterCombobox';
import {
  applyMonsterDataToEnemy,
  createEmptyEnemy,
  useMonsters,
} from '../../../../hooks/use-monsters.hook';

interface Props {
  onMonsterSelect: (enemy: EncounterCharacter, monsterName: string) => void;
  selectedMonsterName: string;
}

const MonsterSelector: React.FC<Props> = ({
  onMonsterSelect,
  selectedMonsterName,
}) => {
  const { monsters, options: monsterOptions, isLoading, error } = useMonsters();

  const handleMonsterSelectChange = (monsterName: string) => {
    if (monsterName) {
      const selectedMonster = monsters.find((m) => m.name === monsterName);
      if (selectedMonster) {
        const enemy = createEmptyEnemy();
        const enemyCharacter = applyMonsterDataToEnemy(enemy, selectedMonster);
        onMonsterSelect(enemyCharacter, monsterName);
      }
    } else {
      onMonsterSelect(createEmptyEnemy(), '');
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
