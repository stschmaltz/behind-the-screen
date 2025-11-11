import { useState, useRef } from 'react';
import { EncounterCharacter } from '../types/encounters';
import {
  createEmptyEnemy,
  applyMonsterDataToEnemy,
  createEmptyEnemyState,
  useMonsters,
} from '../hooks/use-monsters.hook';
import {
  shiftIndicesForward,
  shiftIndicesForRemoval,
  shiftIndicesForInsertion,
} from '../lib/stateUtils';

export interface UseEntityStateOptions {
  /** Track which entities were created through duplication */
  trackDuplication?: boolean;
}

/**
 * Generic hook for managing entity state (enemies or characters)
 * Consolidates logic from useEnemyState and useCharacterState
 */
export const useEntityState = (
  initialEntities: EncounterCharacter[],
  onEntitiesChange: (updatedEntities: EncounterCharacter[]) => void,
  options: UseEntityStateOptions = {},
) => {
  const { trackDuplication = false } = options;
  const { monsters, options: monsterOptions, isLoading, error } = useMonsters();
  const [selectedMonsterNames, setSelectedMonsterNames] = useState<{
    [key: number]: string;
  }>({});
  const [advancedOpenState, setAdvancedOpenState] = useState<{
    [key: number]: boolean;
  }>({});
  const [duplicatedEntityIds, setDuplicatedEntityIds] = useState<Set<string>>(
    new Set(),
  );

  const collapseRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleFieldChange = (
    index: number,
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    const updated = [...initialEntities];
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
      return;
    }

    updated[index] = { ...updated[index], [field]: value };
    onEntitiesChange(updated);

    if (field === 'name') {
      setSelectedMonsterNames((prev) => ({ ...prev, [index]: '' }));
    }
  };

  const handleMonsterSelectChange = (index: number, monsterName: string) => {
    setSelectedMonsterNames((prev) => ({ ...prev, [index]: monsterName }));

    const updated = [...initialEntities];
    if (monsterName) {
      const selectedMonster = monsters.find((m) => m.name === monsterName);
      if (selectedMonster) {
        updated[index] = applyMonsterDataToEnemy(
          updated[index],
          selectedMonster,
        );

        setTimeout(() => {
          if (collapseRefs.current[index]) {
            collapseRefs.current[index]!.checked = false;
          }
        }, 300);
      }
    } else {
      updated[index] = createEmptyEnemyState(updated[index]);
    }
    onEntitiesChange(updated);
  };

  const handleAbilityScoreChange = (
    index: number,
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
    value: number,
  ) => {
    const updated = [...initialEntities];
    const entity = updated[index];

    updated[index] = {
      ...entity,
      stats: {
        ...(entity.stats || {
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

    onEntitiesChange(updated);
  };

  const addEntity = () => {
    const newEntity = createEmptyEnemy();
    onEntitiesChange([newEntity, ...initialEntities]);

    setSelectedMonsterNames((prev) => shiftIndicesForward(prev, ''));
    setAdvancedOpenState((prev) => shiftIndicesForward(prev, false));

    // Scroll to the newly added entity
    setTimeout(() => {
      const firstEntityCard = document.querySelector(
        '.space-y-4 > *:first-child',
      );
      if (firstEntityCard) {
        firstEntityCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };

  const removeEntity = (indexToRemove: number) => {
    const entityId = initialEntities[indexToRemove]?._id;

    onEntitiesChange(initialEntities.filter((_, i) => i !== indexToRemove));

    if (trackDuplication && entityId) {
      setDuplicatedEntityIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(entityId);
        return newSet;
      });
    }

    setSelectedMonsterNames((prev) =>
      shiftIndicesForRemoval(prev, indexToRemove),
    );
    setAdvancedOpenState((prev) => shiftIndicesForRemoval(prev, indexToRemove));
  };

  const duplicateEntity = (indexToDuplicate: number) => {
    const originalEntity = initialEntities[indexToDuplicate];
    if (!originalEntity) return;

    const newId = createEmptyEnemy()._id;
    const newEntity = structuredClone(originalEntity);
    newEntity._id = newId;

    if (trackDuplication) {
      setDuplicatedEntityIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(newId);
        return newSet;
      });
    }

    const updatedEntities = [
      ...initialEntities.slice(0, indexToDuplicate + 1),
      newEntity,
      ...initialEntities.slice(indexToDuplicate + 1),
    ];
    onEntitiesChange(updatedEntities);

    const insertionIndex = indexToDuplicate + 1;
    setSelectedMonsterNames((prev) =>
      shiftIndicesForInsertion(prev, insertionIndex, ''),
    );
    setAdvancedOpenState((prev) =>
      shiftIndicesForInsertion(prev, insertionIndex, false),
    );

    // Scroll to the newly duplicated entity
    setTimeout(() => {
      const entityCards = document.querySelectorAll('.space-y-4 > *');
      if (entityCards.length > insertionIndex) {
        entityCards[insertionIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  const isEntityDuplicated = (entityId: string): boolean => {
    return duplicatedEntityIds.has(entityId);
  };

  return {
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
  };
};
