import 'reflect-metadata';

import { Container } from 'inversify';
import { TYPES } from './types';
import { ExampleProvider } from '../providers/example.provider/example.provider';
import { ExampleProviderInterface } from '../providers/example.provider/example.provider.interface';
import { UserRepositoryInterface } from '../repositories/user.repository/user.repository.interface';
import { UserRepository } from '../repositories/user.repository/user.repository';

const appContainer = new Container();

appContainer
  .bind<ExampleProviderInterface>(TYPES.ExampleProvider)
  .toConstantValue(new ExampleProvider());

appContainer
  .bind<UserRepositoryInterface>(TYPES.UserRepository)
  .toConstantValue(new UserRepository());

export { appContainer };
