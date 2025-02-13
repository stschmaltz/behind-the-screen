import { Encounter } from '../../types/encounters';

export interface EncounterRepositoryInterface {
  saveEncounter(
    input: Partial<Encounter> & { userId: string },
  ): Promise<Encounter>;
  getEncounterById(input: {
    id: string;
    userId: string;
  }): Promise<Encounter | null>;
  getAllEncounters(input: { userId: string }): Promise<Encounter[]>;
}
