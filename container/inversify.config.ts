import 'reflect-metadata';

import { Container } from 'inversify';
import { TYPES } from './types';
import { ExampleProvider } from '../providers/example.provider/example.provider';
import { ExampleProviderInterface } from '../providers/example.provider/example.provider.interface';
import { UserRepositoryInterface } from '../repositories/user/user.repository.interface';
import { UserRepository } from '../repositories/user/user.repository';
import { EncounterRepositoryInterface } from '../repositories/encounter/encounter.repository.interface';
import { EncounterRepository } from '../repositories/encounter/encounter.repository';

const appContainer = new Container();

appContainer
  .bind<ExampleProviderInterface>(TYPES.ExampleProvider)
  .toConstantValue(new ExampleProvider());

appContainer
  .bind<UserRepositoryInterface>(TYPES.UserRepository)
  .toConstantValue(new UserRepository());

appContainer
  .bind<EncounterRepositoryInterface>(TYPES.EncounterRepository)
  .toConstantValue(new EncounterRepository());

export { appContainer };
