import { ObjectId } from 'bson';

export const saveEncounterMutation = `
mutation saveEncounter($input: NewEncounterInput!) {
  saveEncounter(input: $input) {
    _id
    name
    description
    notes
    enemies {
      name
      maxHP
      currentHP
      conditions
      armorClass
    }
    status
    players {
      _id
    }
    npcs {
      name
      maxHP
      currentHP
      conditions
      armorClass
    }
    initiativeOrder {
      characterId
      initiative
    }
    currentRound
    currentTurn
  }
}
`;

interface EncounterCharacter {
  name: string;
  maxHP: number;
  currentHP: number;
  conditions: string[];
  armorClass: number;
}

export interface SaveEncounterMutationResponse {
  saveEncounter: {
    _id: ObjectId;
    name: string;
    description?: string;
    notes: string[];
    enemies: Array<EncounterCharacter>;
    status: string;
    players: Array<{
      _id: ObjectId;
    }>;
    npcs: Array<EncounterCharacter>;
    initiativeOrder: Array<{
      characterId: number;
      initiative: number;
    }>;
    currentRound: number;
    currentTurn: number;
  };
}

export const allEncountersQuery = `
query allEncounters {
  allEncounters {
    _id
    name
    description
    notes
    enemies {
      name
      maxHP
      currentHP
      conditions
      armorClass
    }
    status
    players {
      _id
    }
    npcs {
      name
      maxHP
      currentHP
      conditions
      armorClass
    }
    initiativeOrder {
      characterId
      initiative
    }
    currentRound
    currentTurn
  }
}
`;

type Condition =
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

export interface AllEncountersResponse {
  allEncounters: Array<{
    _id: ObjectId;
    name: string;
    description?: string;
    notes: string[];
    enemies: Array<{
      name: string;
      maxHP: number;
      currentHP: number;
      conditions: Condition[];
      armorClass: number;
    }>;
    status: 'active' | 'inactive' | 'completed';
    players: Array<{
      _id: ObjectId;
    }>;
    npcs: Array<{
      name: string;
      maxHP: number;
      currentHP: number;
      conditions: Condition[];
      armorClass: number;
    }>;
    initiativeOrder: Array<{
      characterId: number;
      initiative: number;
    }>;
    currentRound: number;
    currentTurn: number;
    createdAt: Date;
  }>;
}
