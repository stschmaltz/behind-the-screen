import { LootGeneration } from '../../types/loot-generation';

export interface LootGenerationRepositoryInterface {
  saveGeneration(
    input: Partial<LootGeneration> & { userId: string },
  ): Promise<LootGeneration>;
  getGenerationsByUser(input: { userId: string }): Promise<LootGeneration[]>;
  countAiGenerations(input: {
    userId: string;
    since: Date;
  }): Promise<number>;
}
