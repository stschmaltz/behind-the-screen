import { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useCallback, useEffect, useMemo, useState } from 'react';
import posthog from 'posthog-js';
import EncounterContent from './encounters/[id]/EncounterContent';
import {
  EncounterProvider,
  EncounterStorage,
} from '../context/EncounterContext';
import {
  applyMonsterDataToEnemy,
  createEmptyEnemy,
  MonsterData,
} from '../hooks/use-monsters.hook';
import {
  buildDemoEncounter,
  buildDemoPlayers,
  DEMO_MONSTER_NAMES,
  DEMO_STORAGE_KEY,
  parseStoredDemoEncounter,
} from '../lib/demoEncounter';
import { Encounter, EncounterCharacter } from '../types/encounters';

const SIGN_UP_URL = '/api/auth/login?returnTo=%2Fencounters';

const readStoredEncounter = (): Encounter | null => {
  try {
    return parseStoredDemoEncounter(localStorage.getItem(DEMO_STORAGE_KEY));
  } catch {
    return null;
  }
};

const writeStoredEncounter = (encounter: Encounter | null) => {
  try {
    if (encounter) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(encounter));
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
  } catch {
    return;
  }
};

const loadFreshEncounter = async (): Promise<Encounter> => {
  const response = await fetch('/api/monsters');
  if (!response.ok) throw new Error('Failed to load monsters');
  const monsters = (await response.json()) as MonsterData[];

  const monstersByName: Record<string, EncounterCharacter | undefined> = {};
  DEMO_MONSTER_NAMES.forEach((name) => {
    const monster = monsters.find((m) => m.name === name);
    if (monster) {
      monstersByName[name] = applyMonsterDataToEnemy(
        createEmptyEnemy(),
        monster,
      );
    }
  });

  const encounter = buildDemoEncounter(monstersByName);
  if (!encounter) throw new Error('Demo monsters are missing');

  return encounter;
};

const DemoPage: NextPage = () => {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [version, setVersion] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const players = useMemo(() => buildDemoPlayers(), []);

  const startFresh = useCallback(async () => {
    setHasFailed(false);
    try {
      const fresh = await loadFreshEncounter();
      writeStoredEncounter(null);
      setEncounter(fresh);
      setIsFinished(false);
      setVersion((v) => v + 1);
    } catch {
      setHasFailed(true);
    }
  }, []);

  useEffect(() => {
    const stored = readStoredEncounter();
    if (stored && stored.status !== 'completed') {
      setEncounter(stored);

      return;
    }
    posthog.capture('demo_started');
    startFresh();
  }, [startFresh]);

  const storage = useMemo<EncounterStorage>(
    () => ({
      save: async (toSave) => {
        writeStoredEncounter(toSave as Encounter);

        return { success: true };
      },
      remove: async () => {
        writeStoredEncounter(null);

        return true;
      },
      updateDescription: async () => undefined,
    }),
    [],
  );

  const handleLeave = useCallback(() => {
    posthog.capture('demo_finished');
    writeStoredEncounter(null);
    setIsFinished(true);
  }, []);

  const handleReset = () => {
    posthog.capture('demo_reset');
    startFresh();
  };

  return (
    <>
      <NextSeo
        title="Free D&D 5e Initiative Tracker Demo, No Login"
        description="Try the encounter manager without an account. Run a sample D&D 5e combat with initiative order, HP tracking, conditions and full monster stat blocks."
        canonical="https://encountermanager.com/demo/"
        openGraph={{
          url: 'https://encountermanager.com/demo/',
          title: 'Free D&D 5e Initiative Tracker Demo, No Login',
          description:
            'Run a sample D&D 5e combat with initiative order, HP tracking, conditions and full monster stat blocks. No account needed.',
          site_name: 'Encounter Manager',
        }}
      />
      <div className="bg-base-200">
        <div className="px-4 pt-4">
          <div className="rounded-lg border border-primary/40 bg-base-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold">
                Demo encounter, no account needed
              </h1>
              <p className="text-sm text-base-content text-opacity-80">
                Run this sample combat as you would at the table. Changes stay
                in this browser. Sign up free to build and save your own
                encounters.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={handleReset}
              >
                Reset demo
              </button>
              <a
                href={SIGN_UP_URL}
                className="btn btn-sm btn-primary"
                onClick={() =>
                  posthog.capture('demo_signup_clicked', { from: 'banner' })
                }
              >
                Sign up free
              </a>
            </div>
          </div>
        </div>

        {hasFailed && (
          <div className="p-4">
            <div className="rounded-lg bg-base-100 p-6 text-center">
              <p className="mb-3">The demo encounter could not load.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleReset}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!hasFailed && !encounter && (
          <div
            className="flex items-center justify-center min-h-[40vh]"
            role="status"
            aria-label="Loading demo"
          >
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        )}

        {isFinished && (
          <div className="p-4">
            <div className="rounded-lg bg-base-100 p-8 text-center flex flex-col items-center gap-3">
              <h2 className="text-2xl font-bold">Encounter finished</h2>
              <p className="max-w-md text-base-content text-opacity-80">
                That is a full combat. With a free account you can build your
                own encounters, save your party and pick up where you left off.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleReset}
                >
                  Run it again
                </button>
                <a
                  href={SIGN_UP_URL}
                  className="btn btn-primary"
                  onClick={() =>
                    posthog.capture('demo_signup_clicked', { from: 'finish' })
                  }
                >
                  Sign up free
                </a>
              </div>
            </div>
          </div>
        )}

        {!hasFailed && encounter && !isFinished && (
          <EncounterProvider
            key={version}
            initialEncounter={encounter}
            storage={storage}
            isDemo
            onLeave={handleLeave}
          >
            <EncounterContent players={players} />
          </EncounterProvider>
        )}
      </div>
    </>
  );
};

export default DemoPage;
