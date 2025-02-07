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
  _id: string;
  name: string;
  maxHP: number;
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
export interface InitiativeOrderCharacter {
  _id: string;
  name: string;
  armorClass?: number;
  maxHP?: number;
  currentHP?: number;
  initiative?: number;
  conditions: Condition[];
  type: 'player' | 'npc' | 'enemy';
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
  initiativeOrder: InitiativeOrderCharacter[];
  currentRound: number;
  currentTurn: number;
}

export type NewEncounterTemplate = OmitMongoFields<EncounterTemplate>;
export type NewEncounter = OmitMongoFields<Encounter>;

export interface ActiveInitiativeOrderCharacter
  extends InitiativeOrderCharacter {
  initiative: number;
}

interface ActiveEncounter extends Encounter {
  status: 'active';
  initiativeOrder: ActiveInitiativeOrderCharacter[];
}

const isActiveEncounter = (
  encounter: Encounter,
): encounter is ActiveEncounter =>
  encounter.status === 'active' &&
  encounter.initiativeOrder.every(
    (character) => character.initiative !== undefined,
  );

export { isActiveEncounter };
