import { Player } from '../../../types/player';

// ----------------------------------------------------------------------------
// Fragments
// ----------------------------------------------------------------------------

export const fullPlayer = /* GraphQL */ `
  fragment FullPlayer on Player {
    _id
    name
    armorClass
    maxHP
    level
    userId
    campaignId
  }
`;

// ----------------------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------------------

export const savePlayerMutation = /* GraphQL */ `
  mutation SavePlayer($input: NewPlayerInput!) {
    savePlayer(input: $input) {
      ...FullPlayer
    }
  }
  ${fullPlayer}
`;

export const deletePlayerMutation = /* GraphQL */ `
  mutation deletePlayer($id: String!) {
    deletePlayer(id: $id)
  }
`;

export const updatePlayersMutation = /* GraphQL */ `
  mutation updatePlayers($input: UpdatePlayersInput!) {
    updatePlayers(input: $input)
  }
`;

export interface SavePlayerMutationResponse {
  savePlayer: Player;
}

export interface SavePlayerMutationVariables {
  input: {
    name: string;
    campaignId: string;
    armorClass?: number;
    maxHP?: number;
    level?: number;
  };
}

export interface UpdatePlayersMutationVariables {
  input: {
    campaignId: string;
    armorClass?: number;
    maxHP?: number;
    level?: number;
    levelUp?: boolean;
  };
}

export const allPlayersQuery = /* GraphQL */ `
  query AllPlayers {
    allPlayers {
      ...FullPlayer
    }
  }
  ${fullPlayer}
`;

export interface AllPlayersQueryResponse {
  allPlayers: Player[];
}
