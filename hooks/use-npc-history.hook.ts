import { useLocalStorage } from './use-local-storage.hook';
import type { NpcType } from '../types/npc';

export interface NpcGenerationEntry {
  timestamp: number;
  race: string;
  occupation: string;
  context: string;
  includeSecret: boolean;
  includeBackground: boolean;
  npc: NpcType;
}

export function useNpcHistory() {
  const [history, setHistory] = useLocalStorage<NpcGenerationEntry[]>(
    'npcHistory',
    [],
  );

  function addEntry(
    entry: Omit<NpcGenerationEntry, 'timestamp'>,
  ): NpcGenerationEntry {
    const newEntry: NpcGenerationEntry = { ...entry, timestamp: Date.now() };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    return newEntry;
  }

  function removeEntry(timestamp: number) {
    setHistory((prev) => prev.filter((e) => e.timestamp !== timestamp));
  }

  function clearHistory() {
    setHistory([]);
  }

  return { history, addEntry, removeEntry, clearHistory };
}
