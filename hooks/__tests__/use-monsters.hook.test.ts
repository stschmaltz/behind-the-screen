import {
  parseStat,
  parseAbilityScore,
  createEmptyEnemy,
  applyMonsterDataToEnemy,
  createEmptyEnemyState,
  MonsterData,
} from '../use-monsters.hook';
import { EncounterCharacter } from '../../types/encounters';

jest.mock('../../lib/mongo', () => ({
  generateMongoId: jest.fn(() => 'mock-id-123'),
}));

describe('use-monsters.hook', () => {
  describe('parseStat', () => {
    it('should parse number from start of string', () => {
      expect(parseStat('15 (2d8 + 6)')).toBe(15);
      expect(parseStat('100 hit points')).toBe(100);
      expect(parseStat('5')).toBe(5);
    });

    it('should return 0 for strings without numbers at start', () => {
      expect(parseStat('no numbers')).toBe(0);
      expect(parseStat('some 5 text')).toBe(0);
      expect(parseStat('')).toBe(0);
    });

    it('should handle multi-digit numbers', () => {
      expect(parseStat('123 (10d10 + 20)')).toBe(123);
      expect(parseStat('999')).toBe(999);
    });
  });

  describe('parseAbilityScore', () => {
    it('should parse valid numbers', () => {
      expect(parseAbilityScore('10')).toBe(10);
      expect(parseAbilityScore('18')).toBe(18);
      expect(parseAbilityScore('3')).toBe(3);
      expect(parseAbilityScore('20')).toBe(20);
    });

    it('should return 0 for invalid inputs', () => {
      expect(parseAbilityScore('')).toBe(0);
      expect(parseAbilityScore('invalid')).toBe(0);
      expect(parseAbilityScore('10 (+0)')).toBe(10);
    });

    it('should handle string with trailing characters', () => {
      expect(parseAbilityScore('15 (+2)')).toBe(15);
      expect(parseAbilityScore('8 (-1)')).toBe(8);
    });
  });

  describe('createEmptyEnemy', () => {
    it('should create an enemy with default values', () => {
      const enemy = createEmptyEnemy();

      expect(enemy).toHaveProperty('_id', 'mock-id-123');
      expect(enemy).toHaveProperty('name', '');
      expect(enemy).toHaveProperty('maxHP', 0);
      expect(enemy).toHaveProperty('armorClass', 0);
    });

    it('should create unique IDs for multiple enemies', () => {
      const enemy1 = createEmptyEnemy();
      const enemy2 = createEmptyEnemy();

      expect(enemy1._id).toBe('mock-id-123');
      expect(enemy2._id).toBe('mock-id-123');
    });

    it('should not have optional properties defined', () => {
      const enemy = createEmptyEnemy();

      expect(enemy.meta).toBeUndefined();
      expect(enemy.speed).toBeUndefined();
      expect(enemy.stats).toBeUndefined();
      expect(enemy.challenge).toBeUndefined();
      expect(enemy.traits).toBeUndefined();
      expect(enemy.actions).toBeUndefined();
    });
  });

  describe('applyMonsterDataToEnemy', () => {
    const mockMonster: MonsterData = {
      _id: 'monster-1',
      name: 'Goblin',
      'Hit Points': '7 (2d6)',
      'Armor Class': '15 (leather armor)',
      meta: 'Small humanoid (goblinoid), neutral evil',
      Speed: '30 ft.',
      Challenge: '1/4',
      Traits: 'Nimble Escape',
      Actions: 'Scimitar attack',
      'Legendary Actions': 'None',
      img_url: 'https://example.com/goblin.png',
      STR: '8',
      DEX: '14',
      CON: '10',
      INT: '10',
      WIS: '8',
      CHA: '8',
    };

    it('should apply all monster data to enemy', () => {
      const enemy = createEmptyEnemy();
      const result = applyMonsterDataToEnemy(enemy, mockMonster);

      expect(result.name).toBe('Goblin');
      expect(result.maxHP).toBe(7);
      expect(result.armorClass).toBe(15);
      expect(result.meta).toBe('Small humanoid (goblinoid), neutral evil');
      expect(result.speed).toBe('30 ft.');
      expect(result.challenge).toBe('1/4');
      expect(result.traits).toBe('Nimble Escape');
      expect(result.actions).toBe('Scimitar attack');
      expect(result.legendaryActions).toBe('None');
      expect(result.img_url).toBe('https://example.com/goblin.png');
      expect(result.monsterSource).toBe('Goblin');
    });

    it('should parse ability scores correctly', () => {
      const enemy = createEmptyEnemy();
      const result = applyMonsterDataToEnemy(enemy, mockMonster);

      expect(result.stats).toEqual({
        STR: 8,
        DEX: 14,
        CON: 10,
        INT: 10,
        WIS: 8,
        CHA: 8,
      });
    });

    it('should preserve enemy _id', () => {
      const enemy = createEmptyEnemy();
      const originalId = enemy._id;
      const result = applyMonsterDataToEnemy(enemy, mockMonster);

      expect(result._id).toBe(originalId);
    });

    it('should handle monster with high stats', () => {
      const dragon: MonsterData = {
        ...mockMonster,
        name: 'Adult Red Dragon',
        'Hit Points': '256 (19d12 + 133)',
        'Armor Class': '19 (natural armor)',
        Challenge: '17',
        STR: '27',
        DEX: '10',
        CON: '25',
        INT: '16',
        WIS: '13',
        CHA: '21',
      };

      const enemy = createEmptyEnemy();
      const result = applyMonsterDataToEnemy(enemy, dragon);

      expect(result.maxHP).toBe(256);
      expect(result.armorClass).toBe(19);
      expect(result.stats?.STR).toBe(27);
      expect(result.stats?.CHA).toBe(21);
    });

    it('should handle monster without legendary actions', () => {
      const simpleMonster: MonsterData = {
        ...mockMonster,
        'Legendary Actions': undefined,
      };

      const enemy = createEmptyEnemy();
      const result = applyMonsterDataToEnemy(enemy, simpleMonster);

      expect(result.legendaryActions).toBeUndefined();
    });
  });

  describe('createEmptyEnemyState', () => {
    it('should reset all enemy fields except _id', () => {
      const existingEnemy: EncounterCharacter = {
        _id: 'enemy-123',
        name: 'Goblin',
        maxHP: 7,
        armorClass: 15,
        meta: 'Small humanoid',
        speed: '30 ft.',
        stats: {
          STR: 8,
          DEX: 14,
          CON: 10,
          INT: 10,
          WIS: 8,
          CHA: 8,
        },
        challenge: '1/4',
        traits: 'Nimble Escape',
        actions: 'Scimitar',
        legendaryActions: 'None',
        img_url: 'https://example.com/goblin.png',
        monsterSource: 'Goblin',
      };

      const result = createEmptyEnemyState(existingEnemy);

      expect(result._id).toBe('enemy-123');
      expect(result.name).toBe('');
      expect(result.maxHP).toBe(0);
      expect(result.armorClass).toBe(0);
      expect(result.meta).toBeUndefined();
      expect(result.speed).toBeUndefined();
      expect(result.stats).toBeUndefined();
      expect(result.challenge).toBeUndefined();
      expect(result.traits).toBeUndefined();
      expect(result.actions).toBeUndefined();
      expect(result.legendaryActions).toBeUndefined();
      expect(result.img_url).toBeUndefined();
      expect(result.monsterSource).toBeUndefined();
    });

    it('should work with minimal enemy data', () => {
      const minimalEnemy: EncounterCharacter = {
        _id: 'enemy-456',
        name: 'Test',
        maxHP: 10,
        armorClass: 10,
      };

      const result = createEmptyEnemyState(minimalEnemy);

      expect(result._id).toBe('enemy-456');
      expect(result.name).toBe('');
      expect(result.maxHP).toBe(0);
      expect(result.armorClass).toBe(0);
    });
  });
});

