import { NpcGeneration } from '../../types/npc-generation';

export interface NpcGenerationRepositoryInterface {
  saveGeneration(
    input: Partial<NpcGeneration> & { userId: string },
  ): Promise<NpcGeneration>;
  getGenerationsByUser(input: { userId: string }): Promise<NpcGeneration[]>;
  countAiGenerations(input: { userId: string; since: Date }): Promise<number>;
}
