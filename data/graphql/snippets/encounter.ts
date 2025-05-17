import type { Encounter } from '../../../src/generated/graphql';

export const fullEncounterFragment = /* GraphQL */ `
  fragment FullEncounter on Encounter {
    _id
    name
    description
    notes
    enemies {
      _id
      name
      maxHP
      armorClass
      meta
      speed
      stats {
        STR
        DEX
        CON
        INT
        WIS
        CHA
      }
      challenge
      traits
      actions
      legendaryActions
      img_url
      monsterSource
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
      meta
      speed
      stats {
        STR
        DEX
        CON
        INT
        WIS
        CHA
      }
      challenge
      traits
      actions
      legendaryActions
      img_url
      monsterSource
    }
    initiativeOrder {
      _id
      name
      armorClass
      maxHP
      currentHP
      tempHP
      conditions
      initiative
      type
    }
    currentRound
    currentTurn
    createdAt
    userId
    campaignId
    adventureId
  }
`;

export const saveEncounterMutation = /* GraphQL */ `
  ${fullEncounterFragment}
  mutation saveEncounter($input: NewEncounterInput!) {
    saveEncounter(input: $input) {
      ...FullEncounter
    }
  }
`;

export const allEncountersQuery = /* GraphQL */ `
  ${fullEncounterFragment}
  query allEncounters {
    allEncounters {
      ...FullEncounter
    }
  }
`;

export interface AllEncountersResponse {
  allEncounters: Encounter[];
}

export const encounterByIdQuery = /* GraphQL */ `
  ${fullEncounterFragment}
  query encounterById($id: String!) {
    encounterById(id: $id) {
      ...FullEncounter
    }
  }
`;

export interface EncounterByIdResponse {
  encounterById: Encounter | null;
}

export const deleteEncounterMutation = /* GraphQL */ `
  mutation deleteEncounter($input: DeleteEncounterInput!) {
    deleteEncounter(input: $input)
  }
`;

export interface DeleteEncounterMutationResponse {
  deleteEncounter: boolean;
}

export const updateEncounterDescriptionMutation = /* GraphQL */ `
  mutation updateEncounterDescription(
    $input: UpdateEncounterDescriptionInput!
  ) {
    updateEncounterDescription(input: $input) {
      _id
      description
    }
  }
`;

export interface UpdateEncounterDescriptionResponse {
  updateEncounterDescription: {
    _id: string;
    description: string;
  };
}
