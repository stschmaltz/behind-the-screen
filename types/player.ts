import type { Player as GqlPlayer } from '../src/generated/graphql';

export interface PlayerWithInitiative {
  player: GqlPlayer;
  initiative: number | '';
}
