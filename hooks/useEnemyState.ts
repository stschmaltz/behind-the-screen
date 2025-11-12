import { EncounterCharacter } from '../types/encounters';
import { useEntityState } from './useEntityState';

/**
 * Hook for managing enemy state in encounters
 * Now uses the generic useEntityState hook with enemy-specific naming
 */
export const useEnemyState = (
  initialEnemies: EncounterCharacter[],
  onEnemiesChange: (updatedEnemies: EncounterCharacter[]) => void,
) => {
  const {
    monsters,
    monsterOptions,
    isLoading,
    error,
    selectedMonsterNames,
    advancedOpenState,
    collapseRefs,
    handleFieldChange,
    handleMonsterSelectChange,
    handleAbilityScoreChange,
    addEntity,
    removeEntity,
    duplicateEntity,
    isEntityDuplicated,
    setAdvancedOpenState,
  } = useEntityState(initialEnemies, onEnemiesChange, {
    trackDuplication: true,
  });

  return {
    monsters,
    monsterOptions,
    isLoading,
    error,
    selectedMonsterNames,
    advancedOpenState,
    collapseRefs,
    handleEnemyFieldChange: handleFieldChange,
    handleMonsterSelectChange,
    handleAbilityScoreChange,
    addEnemy: addEntity,
    removeEnemy: removeEntity,
    duplicateEnemy: duplicateEntity,
    isEnemyDuplicated: isEntityDuplicated,
    setAdvancedOpenState,
  };
};
