import { ObjectId } from 'bson';
import { Encounter } from '../../../types/encounters';

export const fullEncounter = /* GraphQL */ `
  {
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
  }
`;

export const saveEncounterMutation = /* GraphQL */ `
  mutation saveEncounter($input: NewEncounterInput!) {
    saveEncounter(input: $input) ${fullEncounter}
  }
`;

export interface SaveEncounterMutationResponse {
  saveEncounter: Encounter;
}

export const allEncountersQuery = /* GraphQL */ `
  query allEncounters {
    allEncounters ${fullEncounter}
  }
`;

export interface AllEncountersResponse {
  allEncounters: Encounter[];
}

export const encounterByIdQuery = /* GraphQL */ `
  query encounterById($id: String!) {
    encounterById(id: $id) ${fullEncounter}
  }
`;

export interface EncounterByIdResponse {
  encounterById: Encounter | null;
}
