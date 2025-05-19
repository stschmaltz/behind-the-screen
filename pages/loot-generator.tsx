import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
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
    setIsGenerating(true);
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
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen h-full px-4 py-6 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/3 w-full">
          <LootGeneratorForm
            partyLevel={partyLevel}
            setPartyLevel={setPartyLevel}
            srdItemCount={srdItemCount}
            setSrdItemCount={setSrdItemCount}
            randomItemCount={randomItemCount}
            setRandomItemCount={setRandomItemCount}
            context={context}
            setContext={setContext}
            isLoading={isGenerating}
            handleSubmit={handleSubmit}
            error={error}
          />
        </div>

        <div className="flex-grow w-full md:w-2/3 h-fit min-w-0">
          <LootDisplay
            loot={loot}
            context={context}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6">
        <LootHistory
          history={history}
          onSelect={handleSelect}
          onDelete={removeEntry}
          onClear={clearHistory}
        />
      </div>
    </div>
  );
};

export default LootGeneratorPage;
