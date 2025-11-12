export interface NpcType {
  name: string;
  race: string;
  gender: string;
  age: string;
  occupation: string;
  personality: string;
  appearance: string;
  quirk: string;
  motivation: string;
  secret?: string;
  background?: string;
}

export interface NpcGeneration {
  _id: string;
  userId: string;
  timestamp: number;
  race?: string;
  occupation?: string;
  context?: string;
  includeSecret: boolean;
  includeBackground: boolean;
  npc: NpcType;
}

export type NewNpcGeneration = Omit<NpcGeneration, '_id'>;
