import type { Player as GqlPlayer } from '../generated/graphql';

export interface PlayerWithInitiative {
  player: GqlPlayer;
  initiative: number | '';
}
