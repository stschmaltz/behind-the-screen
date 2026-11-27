import { EncounterCharacter } from '../types/encounters';

export interface MonsterReference {
  savingThrows?: string;
  skills?: string;
  damageVulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  reactions?: string;
}

interface LibraryMonster {
  name: string;
  meta?: string;
}

const REFERENCE_FIELDS: Array<[keyof MonsterReference, string]> = [
  ['savingThrows', 'Saving Throws'],
  ['skills', 'Skills'],
  ['damageVulnerabilities', 'Damage Vulnerabilities'],
  ['damageResistances', 'Damage Resistances'],
  ['damageImmunities', 'Damage Immunities'],
  ['conditionImmunities', 'Condition Immunities'],
  ['senses', 'Senses'],
  ['languages', 'Languages'],
  ['reactions', 'Reactions'],
];

const normalize = (value: string) => value.trim().toLowerCase();

const stripCopyNumber = (name: string) => name.replace(/\s*#?\d+$/, '').trim();

export const findLibraryMonster = <T extends LibraryMonster>(
  monsters: T[],
  character: Pick<EncounterCharacter, 'name' | 'meta' | 'monsterSource'>,
): T | undefined => {
  if (character.monsterSource) {
    const source = normalize(character.monsterSource);

    return monsters.find((monster) => normalize(monster.name) === source);
  }

  if (!character.meta) return undefined;

  const name = normalize(stripCopyNumber(character.name));
  const meta = normalize(character.meta);

  return monsters.find(
    (monster) =>
      normalize(monster.name) === name &&
      typeof monster.meta === 'string' &&
      normalize(monster.meta) === meta,
  );
};

export const toMonsterReference = (
  monster: LibraryMonster | undefined,
): MonsterReference | undefined => {
  if (!monster) return undefined;

  const reference: MonsterReference = {};
  REFERENCE_FIELDS.forEach(([field, sourceKey]) => {
    const value = (monster as unknown as Record<string, unknown>)[sourceKey];
    if (typeof value === 'string' && value.trim()) {
      reference[field] =
        field === 'reactions' ? value : value.replace(/\s+/g, ' ').trim();
    }
  });

  return Object.keys(reference).length > 0 ? reference : undefined;
};
