import { ObjectId } from 'bson';
import { OmitId } from './mongo-helpers';

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
  _id: ObjectId;
  name: string;
  description?: string;
  notes: string[];
  enemies: EncounterCharacter[];
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
}

export interface Encounter extends EncounterTemplate {
  _id: ObjectId;
  name: string;
  description?: string;
  notes: string[];
  enemies: EncounterCharacter[];
  status: 'active' | 'inactive' | 'completed';
  players: {
    _id: ObjectId;
  }[];
  npcs: EncounterCharacter[];
  initiativeOrder: {
    characterId: number;
    initiative: number;
  }[];
  currentRound: number;
  currentTurn: number;
}

export type NewEncounterTemplate = OmitId<EncounterTemplate>;
export type NewEncounter = OmitId<Encounter>;
