import { findLibraryMonster, toMonsterReference } from '../monsterReference';

const library = [
  {
    name: 'Goblin',
    meta: 'Small humanoid, neutral evil',
    Skills: 'Stealth +6',
    Senses: 'Darkvision 60 ft.,  Passive Perception 9',
    Languages: 'Common, Goblin',
  },
  {
    name: 'Adult Black Dragon',
    meta: 'Huge dragon, chaotic evil',
    'Saving Throws': 'DEX +7, CON +10, WIS +6, CHA +8',
    'Damage Immunities': 'Acid',
    Reactions: '<p><em><strong>Parry.</strong></em> Text</p>',
  },
];

describe('findLibraryMonster', () => {
  it('matches on monsterSource even when the enemy was renamed', () => {
    const match = findLibraryMonster(library, {
      name: 'Snik the Sneaky',
      monsterSource: 'Goblin',
    });

    expect(match?.name).toBe('Goblin');
  });

  it('matches a numbered copy by name when the type line also matches', () => {
    const match = findLibraryMonster(library, {
      name: 'Goblin 2',
      meta: 'Small humanoid, neutral evil',
    });

    expect(match?.name).toBe('Goblin');
  });

  it('does not match a custom enemy that only shares a name', () => {
    expect(findLibraryMonster(library, { name: 'Goblin' })).toBeUndefined();
    expect(
      findLibraryMonster(library, { name: 'Goblin', meta: 'Homebrew boss' }),
    ).toBeUndefined();
  });

  it('returns nothing when monsterSource is not in the library', () => {
    expect(
      findLibraryMonster(library, { name: 'Goblin', monsterSource: 'Gobbo' }),
    ).toBeUndefined();
  });
});

describe('toMonsterReference', () => {
  it('maps library fields and tidies spacing', () => {
    expect(toMonsterReference(library[0])).toEqual({
      skills: 'Stealth +6',
      senses: 'Darkvision 60 ft., Passive Perception 9',
      languages: 'Common, Goblin',
    });
  });

  it('keeps reaction markup as written', () => {
    expect(toMonsterReference(library[1])).toEqual({
      savingThrows: 'DEX +7, CON +10, WIS +6, CHA +8',
      damageImmunities: 'Acid',
      reactions: '<p><em><strong>Parry.</strong></em> Text</p>',
    });
  });

  it('returns undefined when there is nothing to show', () => {
    expect(toMonsterReference(undefined)).toBeUndefined();
    expect(toMonsterReference({ name: 'Blob' })).toBeUndefined();
  });
});
