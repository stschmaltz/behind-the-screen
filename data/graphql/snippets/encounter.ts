// snippets/encounter.ts
export interface ApiEncounter {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  notes: string[];
  enemies: Array<{
    name: string;
    maxHP: number;
    currentHP: number;
    armorClass: number;
    conditions: string[];
  }>;
}

export const saveEncounterMutation = `
    mutation saveEncounter($input: NewEncounterInput!) {
      saveEncounter(input: $input) {
        _id
        name
        description
        status
        notes
        enemies {
          name
          maxHP
          currentHP
          armorClass
          conditions
        }
      }
    }
  `;

export interface SaveEncounterMutationResponse {
  saveEncounter: ApiEncounter;
}

export const getEncounterByIdQuery = `
    query encounterById($id: String!) {
      encounterById(id: $id) {
        _id
        name
        description
        status
        notes
        enemies {
          name
          maxHP
          currentHP
          armorClass
          conditions
        }
      }
    }
  `;

export interface GetEncounterByIdResponse {
  encounterById: ApiEncounter;
}
