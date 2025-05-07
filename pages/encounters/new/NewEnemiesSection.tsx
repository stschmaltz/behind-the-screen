import React from 'react';
import EnemyCard from './EnemyCard';
import { EncounterCharacter } from '../../../types/encounters';
import { Button } from '../../../components/Button';
import EncounterDifficultyCalculator from '../../../components/EncounterDifficultyCalculator';
import { useEnemyState } from '../../../hooks/useEnemyState';

interface NewEnemiesSectionProps {
  enemies: EncounterCharacter[];
  onEnemiesChange: (updatedEnemies: EncounterCharacter[]) => void;
}

const NewEnemiesSection: React.FC<NewEnemiesSectionProps> = ({
  enemies,
  onEnemiesChange,
}) => {
  const {
    monsters,
    monsterOptions,
    isLoading,
    error,
    selectedMonsterNames,
    collapseRefs,
    handleEnemyFieldChange,
    handleMonsterSelectChange,
    handleAbilityScoreChange,
    addEnemy,
    removeEnemy,
    duplicateEnemy,
    isEnemyDuplicated,
  } = useEnemyState(enemies, onEnemiesChange);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Enemies</h2>

      <EncounterDifficultyCalculator enemies={enemies} initiativeOrder={[]} />

      <Button
        variant="secondary"
        label={enemies.length > 0 ? 'Add Another Enemy' : 'Add Enemy'}
        onClick={addEnemy}
        className="my-4 w-full"
      />

      <div className="mb-4">
        <label className="label text-lg font-semibold">Enemies</label>

        {isLoading && <p>Loading monster list...</p>}
        {error && <p className="text-error">Error loading monsters: {error}</p>}

        <div className="space-y-4">
          {enemies.map((enemy, index) => (
            <EnemyCard
              key={enemy._id}
              enemy={enemy}
              index={index}
              selectedMonsterName={selectedMonsterNames[index] || ''}
              isLoading={isLoading}
              monsterOptions={monsterOptions}
              collapseRef={(el) => {
                collapseRefs.current[index] = el;
              }}
              error={error}
              monsters={monsters}
              isExpanded={!isEnemyDuplicated(enemy._id)}
              onMonsterSelectChange={handleMonsterSelectChange}
              onEnemyFieldChange={handleEnemyFieldChange}
              onAbilityScoreChange={handleAbilityScoreChange}
              onRemove={removeEnemy}
              onDuplicate={duplicateEnemy}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewEnemiesSection;
