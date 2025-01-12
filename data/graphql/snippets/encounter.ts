import { ObjectId } from 'bson';
import { Encounter } from '../../../types/encounters';

export const fullEncounter = `{
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
    createdAt
  }`;

export const saveEncounterMutation = `
mutation saveEncounter($input: NewEncounterInput!) {
  saveEncounter(input: $input) ${fullEncounter}
}
`;

export interface SaveEncounterMutationResponse {
  saveEncounter: Encounter;
}

export const allEncountersQuery = `
query allEncounters {
  allEncounters ${fullEncounter}
}
`;

export interface AllEncountersResponse {
  allEncounters: Encounter[];
}

export const encounterByIdQuery = `
query encounterById($id: String!) {
  encounterById(id: $id) ${fullEncounter}
}
`;

export interface EncounterByIdResponse {
  encounterById: Encounter | null;
}
