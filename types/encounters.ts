import { ObjectId } from 'mongodb';
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
  meta?: string;
  speed?: string;
  stats?: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  challenge?: string;
  traits?: string;
  actions?: string;
  legendaryActions?: string;
  img_url?: string;
  monsterSource?: string;
}

export interface EncounterTemplate {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  notes: string[];
  enemies: EncounterCharacter[];
  status: 'active' | 'inactive' | 'completed';
  campaignId: string;
  adventureId?: string;
  createdAt: Date;
}

export interface InitiativeOrderCharacter {
  _id: string;
  name: string;
  armorClass?: number;
  maxHP?: number;
  currentHP?: number;
  tempHP?: number;
  initiative?: number;
  level?: number;
  conditions: Condition[];
  type: 'player' | 'npc' | 'enemy';
}

export interface Encounter
  extends Omit<EncounterTemplate, 'campaignId' | 'adventureId'> {
  _id: string;
  name: string;
  description?: string;
  notes: string[];
  enemies: EncounterCharacter[];
  status: 'active' | 'inactive' | 'completed';
  campaignId: ObjectId;
  adventureId?: ObjectId;
  players: {
    _id: string;
  }[];
  npcs: EncounterCharacter[];
  initiativeOrder: InitiativeOrderCharacter[];
  currentRound: number;
  currentTurn: number;
}

export type NewEncounterTemplate = Omit<
  OmitMongoFields<EncounterTemplate>,
  'userId'
>;
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
