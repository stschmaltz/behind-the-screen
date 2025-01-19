import { OmitMongoFields } from './mongo-helpers';

export type Condition =
  | 'blinded'
  | 'charmed'
  | 'deafened'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious';

export interface EncounterCharacter {
  name: string;
  maxHP: number;
  currentHP: number;
  conditions: Condition[];
  armorClass: number;
}

export interface EncounterTemplate {
  _id: string;
  name: string;
  description?: string;
  notes: string[];
  enemies: EncounterCharacter[];
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
}

export interface Encounter extends EncounterTemplate {
  _id: string;
  name: string;
  description?: string;
  notes: string[];
  enemies: EncounterCharacter[];
  status: 'active' | 'inactive' | 'completed';
  players: {
    _id: string;
  }[];
  npcs: EncounterCharacter[];
  initiativeOrder: {
    characterId: number;
    initiative: number;
  }[];
  currentRound: number;
  currentTurn: number;
}

export type NewEncounterTemplate = OmitMongoFields<EncounterTemplate>;
export type NewEncounter = OmitMongoFields<Encounter>;
