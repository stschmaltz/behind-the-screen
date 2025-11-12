export interface LootItemType {
  level?: string;
  coins?: string;
  item?: string;
  description?: string;
  note?: string;
  source?: 'official' | 'random';
  rarity?: string;
  effects?: string;
}

export interface LootGeneration {
  _id: string;
  userId: string;
  timestamp: number;
  partyLevel: number;
  srdItemCount: number;
  randomItemCount: number;
  context: string;
  loot: LootItemType[];
}

export type NewLootGeneration = Omit<LootGeneration, '_id'>;
