import { Encounter } from '../../types/encounters';

export interface EncounterRepositoryInterface {
  saveEncounter(input: Partial<Encounter>): Promise<Encounter>;
  getEncounterById(id: string): Promise<Encounter | null>;
  getAllEncounters(): Promise<Encounter[]>;
}
