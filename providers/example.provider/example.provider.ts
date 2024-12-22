import { injectable } from 'inversify';
import { ExampleProviderInterface } from './example.provider.interface';

@injectable()
class ExampleProvider implements ExampleProviderInterface {
  get(): void {
    console.log('get examples');
  }
}
export { ExampleProvider };
