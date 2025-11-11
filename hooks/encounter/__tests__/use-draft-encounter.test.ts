import { renderHook, act } from '@testing-library/react';
import { useEncounterDraft } from '../use-draft-encounter';
import { Encounter, EncounterCharacter } from '../../../types/encounters';
import { Player } from '../../../generated/graphql';
import { ObjectId } from 'mongodb';

describe('useEncounterDraft', () => {
  const mockPlayers: Player[] = [
    {
      _id: 'player-1',
      name: 'Fighter',
      level: 5,
      maxHP: 45,
      armorClass: 18,
      userId: 'user-1',
      campaignId: 'campaign-1',
    } as Player,
    {
      _id: 'player-2',
      name: 'Wizard',
      level: 5,
      maxHP: 30,
      armorClass: 12,
      userId: 'user-1',
      campaignId: 'campaign-1',
    } as Player,
  ];

  const createMockEncounter = (overrides?: Partial<Encounter>): Encounter => ({
    _id: 'encounter-1',
    name: 'Test Encounter',
    description: 'A test encounter',
    notes: [],
    enemies: [],
    npcs: [],
    players: [],
    status: 'inactive',
    initiativeOrder: [],
    currentRound: 0,
    currentTurn: 0,
    campaignId: new ObjectId('507f1f77bcf86cd799439011'),
    ...overrides,
  });

  const createMockEnemy = (
    id: string,
    name: string,
  ): EncounterCharacter => ({
    _id: id,
    name,
    maxHP: 20,
    armorClass: 15,
  });

  describe('initialization', () => {
    it('should initialize with encounter data when initiativeOrder is not empty', () => {
      const encounter = createMockEncounter({
        initiativeOrder: [
          {
            _id: 'char-1',
            name: 'Test',
            type: 'enemy',
            conditions: [],
            maxHP: 20,
            currentHP: 20,
            tempHP: 0,
          },
        ],
      });

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      expect(result.current.draftEncounter.initiativeOrder).toHaveLength(1);
    });

    it('should build initiativeOrder from enemies and players when empty', () => {
      const enemy = createMockEnemy('enemy-1', 'Goblin');
      const encounter = createMockEncounter({
        enemies: [enemy],
        players: [{ _id: 'player-1' }],
        initiativeOrder: [],
      });

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      expect(result.current.draftEncounter.initiativeOrder).toHaveLength(2);
      expect(
        result.current.draftEncounter.initiativeOrder.find(
          (c) => c.type === 'enemy',
        ),
      ).toBeDefined();
      expect(
        result.current.draftEncounter.initiativeOrder.find(
          (c) => c.type === 'player',
        ),
      ).toBeDefined();
    });

    it('should filter out players not in provided players list', () => {
      const encounter = createMockEncounter({
        players: [{ _id: 'player-1' }, { _id: 'non-existent-player' }],
        initiativeOrder: [],
      });

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      const playerCharacters = result.current.draftEncounter.initiativeOrder.filter(
        (c) => c.type === 'player',
      );
      expect(playerCharacters).toHaveLength(1);
      expect(playerCharacters[0]._id).toBe('player-1');
    });
  });

  describe('handleAddCharacter', () => {
    it('should add character to enemies and initiativeOrder', () => {
      const encounter = createMockEncounter();
      const hasUnsavedChanges = jest.fn();

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers, hasUnsavedChanges),
      );

      const newEnemy = createMockEnemy('enemy-1', 'Orc');

      act(() => {
        result.current.handleAddCharacter(newEnemy, 'enemy');
      });

      expect(result.current.draftEncounter.enemies).toHaveLength(1);
      expect(result.current.draftEncounter.enemies[0]).toEqual(newEnemy);
      expect(result.current.draftEncounter.initiativeOrder).toHaveLength(1);
      expect(result.current.draftEncounter.initiativeOrder[0].type).toBe(
        'enemy',
      );
      expect(hasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should add NPC character correctly', () => {
      const encounter = createMockEncounter();
      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      const newNpc = createMockEnemy('npc-1', 'Guard');

      act(() => {
        result.current.handleAddCharacter(newNpc, 'npc');
      });

      expect(result.current.draftEncounter.initiativeOrder[0].type).toBe('npc');
    });

    it('should initialize character with correct HP values', () => {
      const encounter = createMockEncounter();
      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      const newEnemy = createMockEnemy('enemy-1', 'Troll');
      newEnemy.maxHP = 84;

      act(() => {
        result.current.handleAddCharacter(newEnemy, 'enemy');
      });

      const initiativeChar = result.current.draftEncounter.initiativeOrder[0];
      expect(initiativeChar.maxHP).toBe(84);
      expect(initiativeChar.currentHP).toBe(84);
      expect(initiativeChar.tempHP).toBe(0);
    });
  });

  describe('handleAddPlayers', () => {
    it('should add new players to encounter', () => {
      const encounter = createMockEncounter();
      const hasUnsavedChanges = jest.fn();

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers, hasUnsavedChanges),
      );

      const selectedPlayers = [
        { player: mockPlayers[0], initiative: '15' },
        { player: mockPlayers[1], initiative: '12' },
      ];

      act(() => {
        result.current.handleAddPlayers(selectedPlayers);
      });

      expect(result.current.draftEncounter.players).toHaveLength(2);
      expect(result.current.draftEncounter.initiativeOrder).toHaveLength(2);
      expect(hasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should not add duplicate players', () => {
      const encounter = createMockEncounter({
        players: [{ _id: 'player-1' }],
      });

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      const selectedPlayers = [{ player: mockPlayers[0], initiative: '15' }];

      act(() => {
        result.current.handleAddPlayers(selectedPlayers);
      });

      const playerEntries = result.current.draftEncounter.players.filter(
        (p) => p._id === 'player-1',
      );
      expect(playerEntries).toHaveLength(1);
    });

    it('should parse initiative values correctly', () => {
      const encounter = createMockEncounter();
      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      const selectedPlayers = [{ player: mockPlayers[0], initiative: '18' }];

      act(() => {
        result.current.handleAddPlayers(selectedPlayers);
      });

      const playerChar = result.current.draftEncounter.initiativeOrder[0];
      expect(playerChar.initiative).toBe(18);
    });

    it('should handle empty initiative values', () => {
      const encounter = createMockEncounter();
      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      const selectedPlayers = [{ player: mockPlayers[0], initiative: '' }];

      act(() => {
        result.current.handleAddPlayers(selectedPlayers);
      });

      const playerChar = result.current.draftEncounter.initiativeOrder[0];
      expect(playerChar.initiative).toBeUndefined();
    });
  });

  describe('handleUpdateCharacter', () => {
    it('should update character in initiativeOrder', () => {
      const enemy = createMockEnemy('enemy-1', 'Goblin');
      const encounter = createMockEncounter({
        enemies: [enemy],
        initiativeOrder: [
          {
            _id: 'enemy-1',
            name: 'Goblin',
            type: 'enemy',
            conditions: [],
            maxHP: 20,
            currentHP: 20,
            tempHP: 0,
          },
        ],
      });

      const hasUnsavedChanges = jest.fn();
      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers, hasUnsavedChanges),
      );

      act(() => {
        result.current.handleUpdateCharacter({
          _id: 'enemy-1',
          name: 'Goblin',
          type: 'enemy',
          conditions: ['poisoned'],
          maxHP: 20,
          currentHP: 10,
          tempHP: 5,
        });
      });

      const updatedChar = result.current.draftEncounter.initiativeOrder[0];
      expect(updatedChar.currentHP).toBe(10);
      expect(updatedChar.tempHP).toBe(5);
      expect(updatedChar.conditions).toContain('poisoned');
      expect(hasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should not update if character ID does not match', () => {
      const encounter = createMockEncounter({
        initiativeOrder: [
          {
            _id: 'enemy-1',
            name: 'Goblin',
            type: 'enemy',
            conditions: [],
            maxHP: 20,
            currentHP: 20,
            tempHP: 0,
          },
        ],
      });

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      act(() => {
        result.current.handleUpdateCharacter({
          _id: 'non-existent',
          name: 'Ghost',
          type: 'enemy',
          conditions: [],
          maxHP: 30,
          currentHP: 30,
          tempHP: 0,
        });
      });

      expect(result.current.draftEncounter.initiativeOrder[0]._id).toBe(
        'enemy-1',
      );
      expect(result.current.draftEncounter.initiativeOrder[0].name).toBe(
        'Goblin',
      );
    });
  });

  describe('handleDeleteCharacter', () => {
    it('should delete enemy from both enemies and initiativeOrder', () => {
      const enemy = createMockEnemy('enemy-1', 'Goblin');
      const encounter = createMockEncounter({
        enemies: [enemy],
        initiativeOrder: [
          {
            _id: 'enemy-1',
            name: 'Goblin',
            type: 'enemy',
            conditions: [],
            maxHP: 20,
            currentHP: 20,
            tempHP: 0,
          },
        ],
      });

      const hasUnsavedChanges = jest.fn();
      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers, hasUnsavedChanges),
      );

      act(() => {
        result.current.handleDeleteCharacter('enemy-1');
      });

      expect(result.current.draftEncounter.enemies).toHaveLength(0);
      expect(result.current.draftEncounter.initiativeOrder).toHaveLength(0);
      expect(hasUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should delete player from both players and initiativeOrder', () => {
      const encounter = createMockEncounter({
        players: [{ _id: 'player-1' }],
        initiativeOrder: [
          {
            _id: 'player-1',
            name: 'Fighter',
            type: 'player',
            conditions: [],
            maxHP: 45,
            currentHP: 45,
            tempHP: 0,
          },
        ],
      });

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      act(() => {
        result.current.handleDeleteCharacter('player-1');
      });

      expect(result.current.draftEncounter.players).toHaveLength(0);
      expect(result.current.draftEncounter.initiativeOrder).toHaveLength(0);
    });

    it('should not modify state if character not found', () => {
      const enemy = createMockEnemy('enemy-1', 'Goblin');
      const encounter = createMockEncounter({
        enemies: [enemy],
        initiativeOrder: [
          {
            _id: 'enemy-1',
            name: 'Goblin',
            type: 'enemy',
            conditions: [],
            maxHP: 20,
            currentHP: 20,
            tempHP: 0,
          },
        ],
      });

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      act(() => {
        result.current.handleDeleteCharacter('non-existent');
      });

      expect(result.current.draftEncounter.enemies).toHaveLength(1);
      expect(result.current.draftEncounter.initiativeOrder).toHaveLength(1);
    });

    it('should handle deleting from encounter with multiple characters', () => {
      const enemy1 = createMockEnemy('enemy-1', 'Goblin 1');
      const enemy2 = createMockEnemy('enemy-2', 'Goblin 2');
      const encounter = createMockEncounter({
        enemies: [enemy1, enemy2],
        players: [{ _id: 'player-1' }],
        initiativeOrder: [
          {
            _id: 'enemy-1',
            name: 'Goblin 1',
            type: 'enemy',
            conditions: [],
            maxHP: 20,
            currentHP: 20,
            tempHP: 0,
          },
          {
            _id: 'player-1',
            name: 'Fighter',
            type: 'player',
            conditions: [],
            maxHP: 45,
            currentHP: 45,
            tempHP: 0,
          },
          {
            _id: 'enemy-2',
            name: 'Goblin 2',
            type: 'enemy',
            conditions: [],
            maxHP: 20,
            currentHP: 20,
            tempHP: 0,
          },
        ],
      });

      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      act(() => {
        result.current.handleDeleteCharacter('enemy-1');
      });

      expect(result.current.draftEncounter.enemies).toHaveLength(1);
      expect(result.current.draftEncounter.enemies[0]._id).toBe('enemy-2');
      expect(result.current.draftEncounter.initiativeOrder).toHaveLength(2);
      expect(
        result.current.draftEncounter.initiativeOrder.find(
          (c) => c._id === 'enemy-1',
        ),
      ).toBeUndefined();
    });
  });

  describe('hasUnsavedChanges callback', () => {
    it('should not call hasUnsavedChanges when undefined', () => {
      const encounter = createMockEncounter();
      const { result } = renderHook(() =>
        useEncounterDraft(encounter, mockPlayers),
      );

      act(() => {
        result.current.handleAddCharacter(
          createMockEnemy('enemy-1', 'Orc'),
          'enemy',
        );
      });

      expect(result.current.draftEncounter.enemies).toHaveLength(1);
    });
  });
});

