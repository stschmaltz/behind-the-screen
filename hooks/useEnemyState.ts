import { useState, useRef } from 'react';
import { EncounterCharacter } from '../types/encounters';
import {
  type MonsterData,
  type MonsterOption,
  createEmptyEnemy,
  applyMonsterDataToEnemy,
  createEmptyEnemyState,
  useMonsters,
} from '../hooks/use-monsters.hook';

export const useEnemyState = (
  initialEnemies: EncounterCharacter[],
  onEnemiesChange: (updatedEnemies: EncounterCharacter[]) => void,
) => {
  const { monsters, options: monsterOptions, isLoading, error } = useMonsters();
  const [selectedMonsterNames, setSelectedMonsterNames] = useState<{
    [key: number]: string;
  }>({});
  const [advancedOpenState, setAdvancedOpenState] = useState<{
    [key: number]: boolean;
  }>({});
  const [duplicatedEnemyIds, setDuplicatedEnemyIds] = useState<Set<string>>(
    new Set(),
  );

  const collapseRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleEnemyFieldChange = (
    index: number,
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    const updated = [...initialEnemies];
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
    onEnemiesChange(updated);

    if (field === 'name') {
      setSelectedMonsterNames((prev) => ({ ...prev, [index]: '' }));
    }
  };

  const handleMonsterSelectChange = (index: number, monsterName: string) => {
    setSelectedMonsterNames((prev) => ({ ...prev, [index]: monsterName }));

    const updated = [...initialEnemies];
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
    onEnemiesChange(updated);
  };

  const handleAbilityScoreChange = (
    index: number,
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
    value: number,
  ) => {
    const updated = [...initialEnemies];
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

  const addEnemy = () => {
    const newEnemy = createEmptyEnemy();
    onEnemiesChange([newEnemy, ...initialEnemies]);

    setSelectedMonsterNames((prev) => {
      const newState: { [key: number]: string } = {};
      Object.keys(prev).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        newState[key + 1] = prev[key];
      });
      newState[0] = '';

      return newState;
    });
    setAdvancedOpenState((prev) => {
      const newState: { [key: number]: boolean } = {};
      Object.keys(prev).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        newState[key + 1] = prev[key];
      });
      newState[0] = false;

      return newState;
    });

    // Scroll to the newly added enemy
    setTimeout(() => {
      const firstEnemyCard = document.querySelector(
        '.space-y-4 > *:first-child',
      );
      if (firstEnemyCard) {
        firstEnemyCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };

  const removeEnemy = (indexToRemove: number) => {
    // Get the ID of the enemy being removed to update duplicated enemies set if needed
    const enemyId = initialEnemies[indexToRemove]?._id;

    onEnemiesChange(initialEnemies.filter((_, i) => i !== indexToRemove));

    if (enemyId) {
      setDuplicatedEnemyIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(enemyId);
        return newSet;
      });
    }

    setSelectedMonsterNames((prev) => {
      const newState: { [key: number]: string } = {};
      Object.keys(prev).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        if (key !== indexToRemove) {
          newState[key > indexToRemove ? key - 1 : key] = prev[key];
        }
      });

      return newState;
    });
    setAdvancedOpenState((prev) => {
      const newState: { [key: number]: boolean } = {};
      Object.keys(prev).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        if (key !== indexToRemove) {
          newState[key > indexToRemove ? key - 1 : key] = prev[key];
        }
      });

      return newState;
    });
  };

  const duplicateEnemy = (indexToDuplicate: number) => {
    const originalEnemy = initialEnemies[indexToDuplicate];
    if (!originalEnemy) return;

    const newId = createEmptyEnemy()._id;
    const newEnemy = structuredClone(originalEnemy);
    newEnemy._id = newId;

    // Track this enemy as duplicated so it starts collapsed
    setDuplicatedEnemyIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(newId);
      return newSet;
    });

    const updatedEnemies = [
      ...initialEnemies.slice(0, indexToDuplicate + 1),
      newEnemy,
      ...initialEnemies.slice(indexToDuplicate + 1),
    ];
    onEnemiesChange(updatedEnemies);

    const insertionIndex = indexToDuplicate + 1;
    setSelectedMonsterNames((prev) => {
      const newState: { [key: number]: string } = {};
      Object.keys(prev).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        newState[key >= insertionIndex ? key + 1 : key] = prev[key];
      });
      newState[insertionIndex] = '';

      return newState;
    });
    setAdvancedOpenState((prev) => {
      const newState: { [key: number]: boolean } = {};
      Object.keys(prev).forEach((keyStr) => {
        const key = parseInt(keyStr, 10);
        newState[key >= insertionIndex ? key + 1 : key] = prev[key];
      });
      newState[insertionIndex] = false;

      return newState;
    });

    // Scroll to the newly duplicated enemy
    setTimeout(() => {
      const enemyCards = document.querySelectorAll('.space-y-4 > *');
      if (enemyCards.length > insertionIndex) {
        enemyCards[insertionIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  // Helper function to check if an enemy was created through duplication
  const isEnemyDuplicated = (enemyId: string): boolean => {
    return duplicatedEnemyIds.has(enemyId);
  };

  return {
    monsters,
    monsterOptions,
    isLoading,
    error,
    selectedMonsterNames,
    advancedOpenState,
    collapseRefs,
    handleEnemyFieldChange,
    handleMonsterSelectChange,
    handleAbilityScoreChange,
    addEnemy,
    removeEnemy,
    duplicateEnemy,
    isEnemyDuplicated,
    setAdvancedOpenState,
  };
};
