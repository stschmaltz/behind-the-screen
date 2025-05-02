import { useState, useRef, useEffect } from 'react';
import { EncounterCharacter } from '../types/encounters';
import {
  MonsterData,
  MonsterOption,
  fetchMonsters,
  createEmptyEnemy,
  applyMonsterDataToEnemy,
  createEmptyEnemyState,
} from '../pages/encounters/new/encounterHelpers';

export const useCharacterState = (
  initialCharacters: EncounterCharacter[],
  onCharactersChange: (updatedCharacters: EncounterCharacter[]) => void,
) => {
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [monsterOptions, setMonsterOptions] = useState<MonsterOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonsterNames, setSelectedMonsterNames] = useState<{
    [key: number]: string;
  }>({});
  const [advancedOpenState, setAdvancedOpenState] = useState<{
    [key: number]: boolean;
  }>({});

  const collapseRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    const loadMonsters = async () => {
      setIsLoading(true);
      const result = await fetchMonsters();
      setMonsters(result.monsters);
      setMonsterOptions(result.options);
      setError(result.error);
      setIsLoading(false);
    };

    loadMonsters();
  }, []);

  const handleCharacterFieldChange = (
    index: number,
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    const updated = [...initialCharacters];
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
    onCharactersChange(updated);

    if (field === 'name') {
      setSelectedMonsterNames((prev) => ({ ...prev, [index]: '' }));
    }
  };

  const handleMonsterSelectChange = (index: number, monsterName: string) => {
    setSelectedMonsterNames((prev) => ({ ...prev, [index]: monsterName }));

    const updated = [...initialCharacters];
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
    onCharactersChange(updated);
  };

  const handleAbilityScoreChange = (
    index: number,
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
    value: number,
  ) => {
    const updated = [...initialCharacters];
    const character = updated[index];

    updated[index] = {
      ...character,
      stats: {
        ...(character.stats || {
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

    onCharactersChange(updated);
  };

  const addCharacter = () => {
    const newCharacter = createEmptyEnemy();
    onCharactersChange([newCharacter, ...initialCharacters]);

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
  };

  const removeCharacter = (indexToRemove: number) => {
    onCharactersChange(initialCharacters.filter((_, i) => i !== indexToRemove));

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

  const duplicateCharacter = (indexToDuplicate: number) => {
    const originalCharacter = initialCharacters[indexToDuplicate];
    if (!originalCharacter) return;

    const newId = createEmptyEnemy()._id;
    const newCharacter = structuredClone(originalCharacter);
    newCharacter._id = newId;

    const updatedCharacters = [
      ...initialCharacters.slice(0, indexToDuplicate + 1),
      newCharacter,
      ...initialCharacters.slice(indexToDuplicate + 1),
    ];
    onCharactersChange(updatedCharacters);

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
      newState[insertionIndex] = advancedOpenState[indexToDuplicate] || false;

      return newState;
    });
  };

  return {
    monsters,
    monsterOptions,
    isLoading,
    error,
    selectedMonsterNames,
    advancedOpenState,
    collapseRefs,
    handleCharacterFieldChange,
    handleMonsterSelectChange,
    handleAbilityScoreChange,
    addCharacter,
    removeCharacter,
    duplicateCharacter,
  };
};
