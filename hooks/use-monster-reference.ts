import { useEffect, useState } from 'react';
import { EncounterCharacter } from '../types/encounters';
import {
  findLibraryMonster,
  MonsterReference,
  toMonsterReference,
} from '../lib/monsterReference';

interface LibraryMonster {
  name: string;
  meta?: string;
}

let libraryPromise: Promise<LibraryMonster[]> | null = null;

const loadMonsterLibrary = (): Promise<LibraryMonster[]> => {
  if (!libraryPromise) {
    const pending = fetch('/api/monsters').then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch monsters');
      }

      return response.json() as Promise<LibraryMonster[]>;
    });
    pending.catch(() => {
      if (libraryPromise === pending) libraryPromise = null;
    });
    libraryPromise = pending;
  }

  return libraryPromise;
};

export const useMonsterReference = (
  character: Pick<EncounterCharacter, 'name' | 'meta' | 'monsterSource'>,
): MonsterReference | undefined => {
  const { name, meta, monsterSource } = character;
  const [reference, setReference] = useState<MonsterReference | undefined>();

  useEffect(() => {
    let isCurrent = true;
    setReference(undefined);

    if (!monsterSource && !meta) return;

    loadMonsterLibrary()
      .then((monsters) => {
        if (!isCurrent) return;
        setReference(
          toMonsterReference(
            findLibraryMonster(monsters, { name, meta, monsterSource }),
          ),
        );
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [name, meta, monsterSource]);

  return reference;
};
