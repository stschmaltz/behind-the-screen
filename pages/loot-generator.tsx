import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import {
  LootDisplay,
  LootGeneratorForm,
  LootItemType,
  LootQuality,
} from '../components/loot';
import {
  GenerationEntry,
  useLootHistory,
} from '../hooks/use-loot-history.hook';
import LootHistory from '../components/loot/LootHistory';
import { isFeatureEnabled } from '../lib/featureFlags';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import { useGenerationUsage } from '../hooks/use-generation-usage';

const GENERATE_LOOT_MUTATION = `
  mutation GenerateLoot($partyLevel: Int!, $srdItemCount: Int!, $randomItemCount: Int!, $context: String, $lootQuality: String) {
    generateLoot(
      partyLevel: $partyLevel
      srdItemCount: $srdItemCount
      randomItemCount: $randomItemCount
      context: $context
      lootQuality: $lootQuality
    ) {
      level
      coins
      item
      description
      note
      source
      rarity
    }
  }
`;

const LootGeneratorPage: NextPage = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [partyLevel, setPartyLevel] = useState<number>(3);
  const [srdItemCount, setSrdItemCount] = useState<number>(4);
  const [randomItemCount, setRandomItemCount] = useState<number>(3);
  const [context, setContext] = useState<string>('');
  const [lootQuality, setLootQuality] = useState<LootQuality>('standard');
  const [loot, setLoot] = useState<LootItemType[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useAiEnhanced, setUseAiEnhanced] = useState<boolean>(true);
  const { history, addEntry, removeEntry, clearHistory } = useLootHistory();
  const {
    remainingUses,
    hasAvailableUses,
    incrementUsage,
    isLoading: isLoadingUsage,
  } = useGenerationUsage();

  useEffect(() => {
    if (!isLoading && user && !isFeatureEnabled(user.email)) {
      router.replace('/404');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!hasAvailableUses) {
      setUseAiEnhanced(false);
    }
  }, [hasAvailableUses]);

  if (isLoading || isLoadingUsage || (user && !isFeatureEnabled(user.email))) {
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

    const isUsingAiFeatures =
      useAiEnhanced && (randomItemCount > 0 || context.trim().length > 0);

    try {
      const actualRandomItemCount = useAiEnhanced ? randomItemCount : 0;
      const actualContext = useAiEnhanced ? context : '';

      const data = await asyncFetch<{ generateLoot: LootItemType[] }>(
        GENERATE_LOOT_MUTATION,
        {
          partyLevel,
          srdItemCount,
          randomItemCount: actualRandomItemCount,
          context: actualContext,
          lootQuality: useAiEnhanced ? lootQuality : 'standard',
        },
      );

      if (isUsingAiFeatures) {
        await incrementUsage();
      }

      setLoot(data.generateLoot);
      addEntry({
        partyLevel,
        srdItemCount,
        randomItemCount: actualRandomItemCount,
        context: actualContext,
        loot: data.generateLoot,
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
            lootQuality={lootQuality}
            setLootQuality={setLootQuality}
            isLoading={isGenerating}
            handleSubmit={handleSubmit}
            error={error}
            useAiEnhanced={useAiEnhanced}
            setUseAiEnhanced={setUseAiEnhanced}
            remainingAiUses={remainingUses}
            hasAvailableAiUses={hasAvailableUses}
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
