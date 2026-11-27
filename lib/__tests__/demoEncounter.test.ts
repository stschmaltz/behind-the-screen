import {
  buildDemoEncounter,
  DEMO_ENCOUNTER_ID,
  DEMO_MONSTER_NAMES,
  parseStoredDemoEncounter,
} from '../demoEncounter';
import { EncounterCharacter } from '../../types/encounters';

const library = (): Record<string, EncounterCharacter> =>
  Object.fromEntries(
    DEMO_MONSTER_NAMES.map((name) => [
      name,
      { _id: name, name, maxHP: 11, armorClass: 12, monsterSource: name },
    ]),
  );

describe('buildDemoEncounter', () => {
  it('builds an active encounter with every combatant ready to act', () => {
    const encounter = buildDemoEncounter(library());

    expect(encounter?.status).toBe('active');
    expect(encounter?.initiativeOrder).toHaveLength(
      (encounter?.enemies.length ?? 0) + (encounter?.players.length ?? 0),
    );
    expect(
      encounter?.initiativeOrder.every(
        (c) => typeof c.initiative === 'number' && c.currentHP === c.maxHP,
      ),
    ).toBe(true);
  });

  it('gives each enemy its own id and keeps its library source', () => {
    const encounter = buildDemoEncounter(library());
    const ids = encounter?.enemies.map((e) => e._id) ?? [];

    expect(new Set(ids).size).toBe(ids.length);
    expect(encounter?.enemies.every((e) => e.monsterSource)).toBe(true);
  });

  it('returns null when a monster is missing from the library', () => {
    const partial = library();
    delete partial[DEMO_MONSTER_NAMES[0]];

    expect(buildDemoEncounter(partial)).toBeNull();
  });
});

describe('parseStoredDemoEncounter', () => {
  it('restores a saved demo encounter', () => {
    const encounter = buildDemoEncounter(library());
    const restored = parseStoredDemoEncounter(
      JSON.stringify({ ...encounter, currentRound: 3 }),
    );

    expect(restored?._id).toBe(DEMO_ENCOUNTER_ID);
    expect(restored?.currentRound).toBe(3);
    expect(restored?.createdAt).toBeInstanceOf(Date);
  });

  it('ignores missing, broken or foreign data', () => {
    expect(parseStoredDemoEncounter(null)).toBeNull();
    expect(parseStoredDemoEncounter('{not json')).toBeNull();
    expect(parseStoredDemoEncounter('{"_id":"other"}')).toBeNull();
    expect(
      parseStoredDemoEncounter(JSON.stringify({ _id: DEMO_ENCOUNTER_ID })),
    ).toBeNull();
  });
});
