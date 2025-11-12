import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import {
  NpcDisplay,
  NpcGeneratorForm,
  NpcHistory,
  NpcType,
} from '../components/npc';
import {
  NpcGenerationEntry,
  useNpcHistory,
} from '../hooks/use-npc-history.hook';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import { useGenerationUsage } from '../hooks/use-generation-usage';

const GENERATE_NPC_MUTATION = `
  mutation GenerateNpc($race: String, $occupation: String, $context: String, $includeSecret: Boolean!, $includeBackground: Boolean!) {
    generateNpc(
      race: $race
      occupation: $occupation
      context: $context
      includeSecret: $includeSecret
      includeBackground: $includeBackground
    ) {
      name
      race
      gender
      age
      occupation
      personality
      appearance
      quirk
      motivation
      secret
      background
    }
  }
`;

const NpcGeneratorPage: NextPage = () => {
  const { isLoading } = useUser();
  const [race, setRace] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [includeSecret, setIncludeSecret] = useState<boolean>(false);
  const [includeBackground, setIncludeBackground] = useState<boolean>(false);
  const [npc, setNpc] = useState<NpcType | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useAiEnhanced, setUseAiEnhanced] = useState<boolean>(true);
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);
  const { history, addEntry, removeEntry, clearHistory } = useNpcHistory();
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

  function handleSelect(entry: NpcGenerationEntry) {
    setRace(entry.race);
    setOccupation(entry.occupation);
    setContext(entry.context);
    setIncludeSecret(entry.includeSecret);
    setIncludeBackground(entry.includeBackground);
    setNpc(entry.npc);
    setError(null);
    setIsFormCollapsed(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setNpc(null);

    const isUsingAiFeatures =
      useAiEnhanced &&
      (race.trim().length > 0 ||
        occupation.trim().length > 0 ||
        context.trim().length > 0 ||
        includeSecret ||
        includeBackground);

    try {
      const actualRace = useAiEnhanced ? race : '';
      const actualOccupation = useAiEnhanced ? occupation : '';
      const actualContext = useAiEnhanced ? context : '';
      const actualIncludeSecret = useAiEnhanced ? includeSecret : false;
      const actualIncludeBackground = useAiEnhanced ? includeBackground : false;

      const data = await asyncFetch<{ generateNpc: NpcType }>(
        GENERATE_NPC_MUTATION,
        {
          race: actualRace || null,
          occupation: actualOccupation || null,
          context: actualContext || null,
          includeSecret: actualIncludeSecret,
          includeBackground: actualIncludeBackground,
        },
      );

      if (isUsingAiFeatures) {
        await incrementUsage();
      }

      setNpc(data.generateNpc);
      addEntry({
        race: actualRace,
        occupation: actualOccupation,
        context: actualContext,
        includeSecret: actualIncludeSecret,
        includeBackground: actualIncludeBackground,
        npc: data.generateNpc,
      });
      setIsFormCollapsed(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to generate NPC.');
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
              🎭 <strong>Beta Feature:</strong> This NPC Generator is in beta.
              Have feedback or ideas?
              <Link href="/feedback" className="link link-primary ml-1">
                Let us know!
              </Link>
            </p>
          </div>
        </div>

        <div className="relative">
          {npc && !isGenerating && (
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
            <NpcGeneratorForm
              race={race}
              setRace={setRace}
              occupation={occupation}
              setOccupation={setOccupation}
              context={context}
              setContext={setContext}
              includeSecret={includeSecret}
              setIncludeSecret={setIncludeSecret}
              includeBackground={includeBackground}
              setIncludeBackground={setIncludeBackground}
              isLoading={isGenerating}
              handleSubmit={handleSubmit}
              error={error}
              useAiEnhanced={useAiEnhanced}
              setUseAiEnhanced={setUseAiEnhanced}
              remainingAiUses={remainingUses}
              hasAvailableAiUses={hasAvailableUses}
            />
          </div>

          {isFormCollapsed && npc && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body py-3 px-6">
                <p className="text-sm text-base-content/70">
                  {race || 'Random'} {occupation || 'Random'}
                  {context && ` • ${context}`}
                  {includeSecret && ' • Secret'}
                  {includeBackground && ' • Background'}
                </p>
              </div>
            </div>
          )}
        </div>

        {(npc || isGenerating) && (
          <div className="w-full">
            <NpcDisplay npc={npc} isGenerating={isGenerating} />
          </div>
        )}

        <div className="w-full">
          <NpcHistory
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

export default NpcGeneratorPage;
