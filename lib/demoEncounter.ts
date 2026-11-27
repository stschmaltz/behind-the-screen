import { Encounter, EncounterCharacter } from '../types/encounters';
import type { Player } from '../generated/graphql';

export const DEMO_ENCOUNTER_ID = 'demo-encounter';
export const DEMO_CAMPAIGN_ID = 'demo-campaign';
export const DEMO_STORAGE_KEY = 'dme-demo-encounter-v1';

const DEMO_CREATED_AT = new Date('2025-01-01T00:00:00.000Z');

const DEMO_PARTY: Array<{
  name: string;
  armorClass: number;
  maxHP: number;
  initiative: number;
}> = [
  { name: 'Mira (Rogue)', armorClass: 15, maxHP: 24, initiative: 16 },
  {
    name: 'Brother Aldric (Cleric)',
    armorClass: 18,
    maxHP: 27,
    initiative: 12,
  },
  { name: 'Thessaly (Wizard)', armorClass: 12, maxHP: 17, initiative: 9 },
  { name: 'Korg (Fighter)', armorClass: 17, maxHP: 31, initiative: 15 },
];

const DEMO_ENEMIES: Array<{
  monster: string;
  name: string;
  initiative: number;
}> = [
  { monster: 'Bandit Captain', name: 'Bandit Captain', initiative: 19 },
  { monster: 'Bandit', name: 'Bandit 1', initiative: 13 },
  { monster: 'Bandit', name: 'Bandit 2', initiative: 13 },
  { monster: 'Bandit', name: 'Bandit 3', initiative: 8 },
  { monster: 'Wolf', name: 'Trained Wolf', initiative: 17 },
];

export const DEMO_MONSTER_NAMES = Array.from(
  new Set(DEMO_ENEMIES.map((enemy) => enemy.monster)),
);

export const buildDemoPlayers = (): Player[] =>
  DEMO_PARTY.map((member, index) => ({
    _id: `demo-player-${index + 1}`,
    name: member.name,
    armorClass: member.armorClass,
    maxHP: member.maxHP,
    level: 3,
    campaignId: DEMO_CAMPAIGN_ID,
    userId: 'demo',
    createdAt: DEMO_CREATED_AT,
  }));

export const buildDemoEncounter = (
  monstersByName: Record<string, EncounterCharacter | undefined>,
): Encounter | null => {
  const enemies: EncounterCharacter[] = [];
  const enemyInitiatives: number[] = [];

  for (const [index, entry] of DEMO_ENEMIES.entries()) {
    const monster = monstersByName[entry.monster];
    if (!monster) return null;
    enemies.push({
      ...monster,
      _id: `demo-enemy-${index + 1}`,
      name: entry.name,
    });
    enemyInitiatives.push(entry.initiative);
  }

  const players = buildDemoPlayers();

  return {
    _id: DEMO_ENCOUNTER_ID,
    userId: 'demo',
    name: 'Ambush on the Trade Road',
    description:
      'Bandits and their trained wolf spring from the treeline as the party rounds a bend.',
    notes: [],
    enemies,
    npcs: [],
    status: 'active',
    campaignId: DEMO_CAMPAIGN_ID as unknown as Encounter['campaignId'],
    createdAt: DEMO_CREATED_AT,
    players: players.map((player) => ({ _id: player._id })),
    currentRound: 1,
    currentTurn: 1,
    initiativeOrder: [
      ...enemies.map((enemy, index) => ({
        _id: enemy._id,
        name: enemy.name,
        armorClass: enemy.armorClass,
        maxHP: enemy.maxHP,
        currentHP: enemy.maxHP,
        tempHP: 0,
        initiative: enemyInitiatives[index],
        conditions: [],
        type: 'enemy' as const,
      })),
      ...players.map((player, index) => ({
        _id: player._id,
        name: player.name,
        armorClass: player.armorClass ?? undefined,
        maxHP: player.maxHP ?? undefined,
        currentHP: player.maxHP ?? undefined,
        tempHP: 0,
        initiative: DEMO_PARTY[index].initiative,
        conditions: [],
        type: 'player' as const,
      })),
    ],
  };
};

export const parseStoredDemoEncounter = (
  raw: string | null,
): Encounter | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Encounter> | null;
    if (
      !parsed ||
      parsed._id !== DEMO_ENCOUNTER_ID ||
      !Array.isArray(parsed.enemies) ||
      !Array.isArray(parsed.initiativeOrder) ||
      !Array.isArray(parsed.players) ||
      typeof parsed.name !== 'string' ||
      !['active', 'inactive', 'completed'].includes(String(parsed.status))
    ) {
      return null;
    }

    return {
      ...(parsed as Encounter),
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      npcs: Array.isArray(parsed.npcs) ? parsed.npcs : [],
      createdAt: DEMO_CREATED_AT,
    };
  } catch {
    return null;
  }
};
