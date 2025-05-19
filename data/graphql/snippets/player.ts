import type {
  AllPlayersQuery,
  CreatePlayerMutation,
  UpdatePlayerMutation,
  DeletePlayerMutation,
  UpdatePlayersMutation,
  Player,
} from '../../../generated/graphql';

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
    createdAt
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

export const allPlayersQuery = /* GraphQL */ `
  query AllPlayers {
    allPlayers {
      ...FullPlayer
    }
  }
  ${fullPlayer}
`;

export type AllPlayersResponse = AllPlayersQuery;
export type CreatePlayerMutationResponse = CreatePlayerMutation;
export type UpdatePlayerMutationResponse = UpdatePlayerMutation;
export type DeletePlayerMutationResponse = DeletePlayerMutation;
export type UpdatePlayersMutationResponse = UpdatePlayersMutation;
