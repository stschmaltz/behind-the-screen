import 'reflect-metadata';

import { Container } from 'inversify';
import { TYPES } from './types';
import { UserRepositoryInterface } from '../repositories/user/user.repository.interface';
import { UserRepository } from '../repositories/user/user.repository';
import { EncounterRepositoryInterface } from '../repositories/encounter/encounter.repository.interface';
import { EncounterRepository } from '../repositories/encounter/encounter.repository';
import { PlayerRepositoryInterface } from '../repositories/player/player.repository.interface';
import { PlayerRepository } from '../repositories/player/player.repository';
import { CampaignRepositoryInterface } from '../repositories/campaign/campaign.repository.interface';
import { CampaignRepository } from '../repositories/campaign/campaign.repository';
import { AdventureRepositoryInterface } from '../repositories/adventure/adventure.repository.interface';
import { AdventureRepository } from '../repositories/adventure/adventure.repository';
import { UserPreferencesRepositoryInterface } from '../repositories/user-preferences/user-preferences.repository.interface';
import { UserPreferencesRepository } from '../repositories/user-preferences/user-preferences.repository';
import { LootGenerationRepository } from '../repositories/generation/loot-generation.repository';
import { LootGenerationRepositoryInterface } from '../repositories/generation/loot-generation.repository.interface';
import { NpcGenerationRepository } from '../repositories/generation/npc-generation.repository';
import { NpcGenerationRepositoryInterface } from '../repositories/generation/npc-generation.repository.interface';

const appContainer = new Container();

appContainer
  .bind<UserRepositoryInterface>(TYPES.UserRepository)
  .toConstantValue(new UserRepository());

appContainer
  .bind<EncounterRepositoryInterface>(TYPES.EncounterRepository)
  .toConstantValue(new EncounterRepository());

appContainer
  .bind<PlayerRepositoryInterface>(TYPES.PlayerRepository)
  .toConstantValue(new PlayerRepository());

appContainer
  .bind<CampaignRepositoryInterface>(TYPES.CampaignRepository)
  .toConstantValue(new CampaignRepository());

appContainer
  .bind<AdventureRepositoryInterface>(TYPES.AdventureRepository)
  .toConstantValue(new AdventureRepository());

appContainer
  .bind<UserPreferencesRepositoryInterface>(TYPES.UserPreferencesRepository)
  .toConstantValue(new UserPreferencesRepository());

appContainer
  .bind<LootGenerationRepositoryInterface>(TYPES.LootGenerationRepository)
  .to(LootGenerationRepository);

appContainer
  .bind<NpcGenerationRepositoryInterface>(TYPES.NpcGenerationRepository)
  .to(NpcGenerationRepository);

export { appContainer };
