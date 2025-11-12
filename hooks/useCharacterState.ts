import { EncounterCharacter } from '../types/encounters';
import { useEntityState } from './useEntityState';

/**
 * Hook for managing character state (NPCs) in encounters
 * Now uses the generic useEntityState hook with character-specific naming
 */
export const useCharacterState = (
  initialCharacters: EncounterCharacter[],
  onCharactersChange: (updatedCharacters: EncounterCharacter[]) => void,
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
    setAdvancedOpenState,
  } = useEntityState(initialCharacters, onCharactersChange, {
    trackDuplication: false,
  });

  return {
    monsters,
    monsterOptions,
    isLoading,
    error,
    selectedMonsterNames,
    advancedOpenState,
    collapseRefs,
    handleCharacterFieldChange: handleFieldChange,
    handleMonsterSelectChange,
    handleAbilityScoreChange,
    addCharacter: addEntity,
    removeCharacter: removeEntity,
    duplicateCharacter: duplicateEntity,
    setAdvancedOpenState,
  };
};
