import { Encounter, NewEncounter } from '../../types/encounters';

export interface EncounterRepositoryInterface {
  saveEncounter(input: NewEncounter): Promise<Encounter>;
  getEncounterById(id: string): Promise<Encounter | null>;
  getAllEncounters(): Promise<Encounter[]>;
}
