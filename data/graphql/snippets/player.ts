import { Player } from '../../../types/player';

const fullPlayer = /* GraphQL */ `
  {
    _id
    name
    armorClass
    maxHP
    userId
  }
`;

export const savePlayerMutation = /* GraphQL */ `
    mutation savePlayer($input: NewPlayerInput!) {
        savePlayer(input: $input) ${fullPlayer}
    }
`;

export const deletePlayerMutation = /* GraphQL */ `
  mutation deletePlayer($id: String!) {
    deletePlayer(id: $id)
  }
`;

export interface SavePlayerMutationResponse {
  savePlayer: Player;
}

export interface SavePlayerMutationVariables {
  input: {
    name: string;
  };
}

export const allPlayersQuery = /* GraphQL */ `
    {
        allPlayers ${fullPlayer}
    }
`;

export interface AllPlayersQueryResponse {
  allPlayers: Player[];
}
