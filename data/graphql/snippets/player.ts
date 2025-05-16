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

export const createPlayerMutation = /* GraphQL */ `
  mutation CreatePlayer($input: NewPlayerInput!) {
    createPlayer(input: $input) {
      ...FullPlayer
    }
  }
  ${fullPlayer}
`;

export const updatePlayerMutation = /* GraphQL */ `
  mutation UpdatePlayer($input: UpdatePlayerInput!) {
    updatePlayer(input: $input) {
      ...FullPlayer
    }
  }
  ${fullPlayer}
`;

export const deletePlayerMutation = /* GraphQL */ `
  mutation DeletePlayer($id: String!) {
    deletePlayer(id: $id)
  }
`;

export const updatePlayersMutation = /* GraphQL */ `
  mutation updatePlayers($input: UpdatePlayersInput!) {
    updatePlayers(input: $input)
  }
`;

export interface CreatePlayerMutationResponse {
  createPlayer: Player;
}

export interface UpdatePlayerMutationResponse {
  updatePlayer: Player;
}

export interface CreatePlayerMutationVariables {
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

export interface UpdatePlayerMutationVariables {
  input: {
    _id: string;
    name?: string;
    campaignId?: string;
    armorClass?: number;
    maxHP?: number;
    level?: number;
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
