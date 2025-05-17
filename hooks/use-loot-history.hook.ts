import { useLocalStorage } from './use-local-storage.hook';
import type { LootItemType } from '../components/loot';

export interface GenerationEntry {
  timestamp: number;
  partyLevel: number;
  srdItemCount: number;
  randomItemCount: number;
  context: string;
  loot: LootItemType[];
}

export function useLootHistory() {
  const [history, setHistory] = useLocalStorage<GenerationEntry[]>(
    'lootHistory',
    [],
  );

  function addEntry(
    entry: Omit<GenerationEntry, 'timestamp'>,
  ): GenerationEntry {
    const newEntry: GenerationEntry = { ...entry, timestamp: Date.now() };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    return newEntry;
  }

  function removeEntry(timestamp: number) {
    setHistory((prev) => prev.filter((e) => e.timestamp !== timestamp));
  }

  return { history, addEntry, removeEntry };
}
