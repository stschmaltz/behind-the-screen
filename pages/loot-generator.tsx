import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  LootDisplay,
  LootGeneratorForm,
  LootItemType,
} from '../components/loot';
import {
  GenerationEntry,
  useLootHistory,
} from '../hooks/use-loot-history.hook';
import LootHistory from '../components/loot/LootHistory';
import { isFeatureEnabled } from '../lib/featureFlags';

const LootGeneratorPage: NextPage = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [partyLevel, setPartyLevel] = useState<number>(3);
  const [srdItemCount, setSrdItemCount] = useState<number>(4);
  const [randomItemCount, setRandomItemCount] = useState<number>(4);
  const [context, setContext] = useState<string>('');
  const [loot, setLoot] = useState<LootItemType[] | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { history, addEntry, removeEntry, clearHistory } = useLootHistory();

  useEffect(() => {
    if (!isLoading && user && !isFeatureEnabled(user.email)) {
      router.replace('/404');
    }
  }, [isLoading, user, router]);

  if (isLoading || (user && !isFeatureEnabled(user.email))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  function handleSelect(entry: GenerationEntry) {
    setPartyLevel(entry.partyLevel);
    setSrdItemCount(entry.srdItemCount);
    setRandomItemCount(entry.randomItemCount);
    setContext(entry.context);
    setLoot(entry.loot);
    setError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setLoot(null);

    try {
      const response = await fetch('/api/generate-loot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partyLevel,
          srdItemCount,
          randomItemCount,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      setLoot(data);
      addEntry({
        partyLevel,
        srdItemCount,
        randomItemCount,
        context,
        loot: data,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to generate loot.');
      } else {
        setError('An unknown error occurred.');
      }
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-300">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:flex-shrink-0">
            <LootGeneratorForm
              partyLevel={partyLevel}
              setPartyLevel={setPartyLevel}
              srdItemCount={srdItemCount}
              setSrdItemCount={setSrdItemCount}
              randomItemCount={randomItemCount}
              setRandomItemCount={setRandomItemCount}
              context={context}
              setContext={setContext}
              isLoading={formLoading}
              handleSubmit={handleSubmit}
              error={error}
            />
            <LootHistory
              history={history}
              onSelect={handleSelect}
              onDelete={removeEntry}
              onClear={clearHistory}
            />
          </div>

          <div className="flex-grow h-fit min-w-0">
            <LootDisplay loot={loot} context={context} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LootGeneratorPage;
