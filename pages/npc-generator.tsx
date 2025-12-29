import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import posthog from 'posthog-js';
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
import { generateFreeNpc } from '../lib/generate-free-npc';

const GENERATE_NPC_MUTATION = `
  mutation GenerateNpc($race: String, $occupation: String, $context: String, $includeSecret: Boolean!, $includeBackground: Boolean!, $useFastMode: Boolean!) {
    generateNpc(
      race: $race
      occupation: $occupation
      context: $context
      includeSecret: $includeSecret
      includeBackground: $includeBackground
      useFastMode: $useFastMode
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
  const [useFastMode, setUseFastMode] = useState<boolean>(true);
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);
  const { history, addEntry, removeEntry, clearHistory } = useNpcHistory();
  const {
    remainingUses,
    hasAvailableUses,
    hasRequestedMoreUses,
    requestMoreUses,
    refetch: refetchUsage,
    isLoading: isLoadingUsage,
  } = useGenerationUsage();

  useEffect(() => {
    if (!hasAvailableUses) {
      setUseAiEnhanced(false);
    }
  }, [hasAvailableUses]);

  if (isLoading || isLoadingUsage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="flex flex-col items-center gap-4 fade-in">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content opacity-60 animate-pulse">
            Loading NPC generator...
          </p>
        </div>
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
      let generatedNpc: NpcType;

      if (useAiEnhanced) {
        const actualRace = race;
        const actualOccupation = occupation;
        const actualContext = context;
        const actualIncludeSecret = includeSecret;
        const actualIncludeBackground = includeBackground;

        const data = await asyncFetch<{ generateNpc: NpcType }>(
          GENERATE_NPC_MUTATION,
          {
            race: actualRace || null,
            occupation: actualOccupation || null,
            context: actualContext || null,
            includeSecret: actualIncludeSecret,
            includeBackground: actualIncludeBackground,
            useFastMode,
          },
        );

        generatedNpc = data.generateNpc;

        if (isUsingAiFeatures) {
          refetchUsage();
        }
      } else {
        generatedNpc = generateFreeNpc(
          race,
          occupation,
          includeSecret,
          includeBackground,
        );
      }

      setNpc(generatedNpc);

      // Track NPC generated event
      posthog.capture('npc_generated', {
        use_ai_enhanced: useAiEnhanced,
        has_race: !!race,
        has_occupation: !!occupation,
        has_context: !!context,
        include_secret: includeSecret,
        include_background: includeBackground,
        is_using_ai_features: isUsingAiFeatures,
      });

      addEntry({
        race: useAiEnhanced ? race : '',
        occupation: useAiEnhanced ? occupation : '',
        context: useAiEnhanced ? context : '',
        includeSecret: useAiEnhanced ? includeSecret : false,
        includeBackground: useAiEnhanced ? includeBackground : false,
        npc: generatedNpc,
      });
      setIsFormCollapsed(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to generate NPC.');
        posthog.captureException(err);
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
              <Link
                href="/feedback"
                className="text-white underline hover:text-base-100 font-semibold ml-1"
              >
                Let me know!
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
              useFastMode={useFastMode}
              setUseFastMode={setUseFastMode}
              remainingAiUses={remainingUses}
              hasAvailableAiUses={hasAvailableUses}
              hasRequestedMoreUses={hasRequestedMoreUses}
              onRequestMoreUses={requestMoreUses}
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
