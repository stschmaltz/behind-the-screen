import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
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
import { isFeatureEnabled } from '../lib/featureFlags';

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
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [race, setRace] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [includeSecret, setIncludeSecret] = useState<boolean>(false);
  const [includeBackground, setIncludeBackground] = useState<boolean>(false);
  const [npc, setNpc] = useState<NpcType | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useAiEnhanced, setUseAiEnhanced] = useState<boolean>(true);
  const { history, addEntry, removeEntry, clearHistory } = useNpcHistory();
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

  function handleSelect(entry: NpcGenerationEntry) {
    setRace(entry.race);
    setOccupation(entry.occupation);
    setContext(entry.context);
    setIncludeSecret(entry.includeSecret);
    setIncludeBackground(entry.includeBackground);
    setNpc(entry.npc);
    setError(null);
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
    <div className="min-h-screen h-full px-4 py-6 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/3 w-full">
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

        <div className="flex-grow w-full md:w-2/3 h-fit min-w-0">
          <NpcDisplay npc={npc} isGenerating={isGenerating} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6">
        <NpcHistory
          history={history}
          onSelect={handleSelect}
          onDelete={removeEntry}
          onClear={clearHistory}
        />
      </div>
    </div>
  );
};

export default NpcGeneratorPage;
