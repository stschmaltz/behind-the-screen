import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
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
  const { isLoading } = useUser();
  const [partyLevel, setPartyLevel] = useState<number>(3);
  const [srdItemCount, setSrdItemCount] = useState<number>(4);
  const [randomItemCount, setRandomItemCount] = useState<number>(3);
  const [context, setContext] = useState<string>('');
  const [lootQuality, setLootQuality] = useState<LootQuality>('standard');
  const [loot, setLoot] = useState<LootItemType[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useAiEnhanced, setUseAiEnhanced] = useState<boolean>(true);
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);
  const { history, addEntry, removeEntry, clearHistory } = useLootHistory();
  const {
    remainingUses,
    hasAvailableUses,
    incrementUsage,
    isLoading: isLoadingUsage,
  } = useGenerationUsage();

  useEffect(() => {
    if (!hasAvailableUses) {
      setUseAiEnhanced(false);
    }
  }, [hasAvailableUses]);

  if (isLoading || isLoadingUsage) {
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
    setIsFormCollapsed(false);
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
      setIsFormCollapsed(true);
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
    <div className="min-h-screen h-full bg-base-200/30 px-4 py-8 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="alert alert-info">
          <div className="flex-1">
            <p>
              💎 <strong>Beta Feature:</strong> This Loot Generator is in beta.
              Have feedback or ideas?
              <Link href="/feedback" className="link link-primary ml-1">
                Let us know!
              </Link>
            </p>
          </div>
        </div>

        <div className="relative">
          {loot && !isGenerating && (
            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="absolute top-4 right-4 z-10 btn btn-sm btn-circle btn-ghost"
              title={isFormCollapsed ? 'Expand form' : 'Collapse form'}
            >
              {isFormCollapsed ? (
                <ChevronDownIcon className="w-5 h-5" />
              ) : (
                <ChevronUpIcon className="w-5 h-5" />
              )}
            </button>
          )}

          <div
            className={`transition-all duration-300 ${isFormCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[2000px] opacity-100'}`}
          >
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

          {isFormCollapsed && loot && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body py-3 px-6">
                <p className="text-sm text-base-content/70">
                  Level {partyLevel} • {srdItemCount} Official +{' '}
                  {randomItemCount} AI Items
                  {context && ` • ${context}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {(loot || isGenerating) && (
          <div className="w-full">
            <LootDisplay
              loot={loot}
              context={context}
              isGenerating={isGenerating}
            />
          </div>
        )}

        <div className="w-full">
          <LootHistory
            history={history}
            onSelect={handleSelect}
            onDelete={removeEntry}
            onClear={clearHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default LootGeneratorPage;
