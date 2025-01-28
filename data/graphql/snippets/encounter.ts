import { Encounter } from '../../../types/encounters';

export const fullEncounter = /* GraphQL */ `
  {
    _id
    name
    description
    notes
    enemies {
      _id
      name
      maxHP
      armorClass
    }
    status
    players {
      _id
    }
    npcs {
      _id
      name
      maxHP
      armorClass
    }
    initiativeOrder {
      _id
      name
      armorClass
      maxHP
      currentHP
      conditions
      initiative
      type
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
