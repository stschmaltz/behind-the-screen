import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
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
import type {
  AiModeConfig,
  NpcFormValues,
} from '../components/npc/NpcGeneratorForm';
import {
  NpcGenerationEntry,
  useNpcHistory,
} from '../hooks/use-npc-history.hook';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import { useGenerationUsage } from '../hooks/use-generation-usage';
import { generateFreeNpc } from '../lib/generate-free-npc';

// ============================================================================
// GraphQL
// ============================================================================

const GENERATE_NPC_MUTATION = `
  mutation GenerateNpc($gender: String, $race: String, $occupation: String, $context: String, $includeSecret: Boolean!, $includeBackground: Boolean!, $useFastMode: Boolean!) {
    generateNpc(
      gender: $gender
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

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FORM_VALUES: NpcFormValues = {
  gender: '',
  race: '',
  occupation: '',
  context: '',
  includeSecret: false,
  includeBackground: false,
};

// ============================================================================
// Page Component
// ============================================================================

const NpcGeneratorPage: NextPage = () => {
  const { isLoading } = useUser();

  // Form state
  const [formValues, setFormValues] =
    useState<NpcFormValues>(DEFAULT_FORM_VALUES);
  const [useAiEnhanced, setUseAiEnhanced] = useState(true);
  const [useFastMode, setUseFastMode] = useState(true);

  // UI state
  const [npc, setNpc] = useState<NpcType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  // Hooks
  const { history, addEntry, removeEntry, clearHistory } = useNpcHistory();
  const {
    remainingUses,
    hasAvailableUses,
    hasRequestedMoreUses,
    requestMoreUses,
    refetch: refetchUsage,
    isLoading: isLoadingUsage,
  } = useGenerationUsage();

  // Disable AI mode if no uses available
  useEffect(() => {
    if (!hasAvailableUses) {
      setUseAiEnhanced(false);
    }
  }, [hasAvailableUses]);

  // Derived state
  const aiMode: AiModeConfig = {
    enabled: useAiEnhanced,
    fastMode: useFastMode,
    remainingUses,
    hasAvailableUses,
    hasRequestedMoreUses,
  };

  // Handlers
  const handleFormChange = useCallback((updates: Partial<NpcFormValues>) => {
    setFormValues((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleHistorySelect = useCallback((entry: NpcGenerationEntry) => {
    setFormValues({
      gender: entry.gender || '',
      race: entry.race,
      occupation: entry.occupation,
      context: entry.context,
      includeSecret: entry.includeSecret,
      includeBackground: entry.includeBackground,
    });
    setNpc(entry.npc);
    setError(null);
    setIsFormCollapsed(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setNpc(null);

    const {
      gender,
      race,
      occupation,
      context,
      includeSecret,
      includeBackground,
    } = formValues;

    const isUsingAiFeatures =
      useAiEnhanced &&
      (gender.trim().length > 0 ||
        race.trim().length > 0 ||
        occupation.trim().length > 0 ||
        context.trim().length > 0 ||
        includeSecret ||
        includeBackground);

    try {
      let generatedNpc: NpcType;

      if (useAiEnhanced) {
        const data = await asyncFetch<{ generateNpc: NpcType }>(
          GENERATE_NPC_MUTATION,
          {
            gender: gender || null,
            race: race || null,
            occupation: occupation || null,
            context: context || null,
            includeSecret,
            includeBackground,
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

      // Analytics
      posthog.capture('npc_generated', {
        use_ai_enhanced: useAiEnhanced,
        use_fast_mode: useFastMode,
        has_gender: !!gender,
        has_race: !!race,
        has_occupation: !!occupation,
        has_context: !!context,
        include_secret: includeSecret,
        include_background: includeBackground,
        is_using_ai_features: isUsingAiFeatures,
      });

      addEntry({
        gender: useAiEnhanced ? gender : '',
        race: useAiEnhanced ? race : '',
        occupation: useAiEnhanced ? occupation : '',
        context: useAiEnhanced ? context : '',
        includeSecret: useAiEnhanced ? includeSecret : false,
        includeBackground: useAiEnhanced ? includeBackground : false,
        npc: generatedNpc,
      });
      setIsFormCollapsed(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message || 'Failed to generate NPC.');
      if (err instanceof Error) posthog.captureException(err);
    }
    setIsGenerating(false);
  };

  // Loading state
  if (isLoading || isLoadingUsage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="flex flex-col items-center gap-4 fade-in">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base-content opacity-60 animate-pulse">
            Loading NPC generator...
          </p>
        </div>
      </div>
    );
  }

  // Collapsed form summary
  const formSummary = `${formValues.race || 'Random'} ${formValues.occupation || 'Random'}${formValues.context ? ` • ${formValues.context}` : ''}${formValues.includeSecret ? ' • Secret' : ''}${formValues.includeBackground ? ' • Background' : ''}`;

  return (
    <div className="min-h-screen h-full bg-base-200/30 px-4 py-8 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Beta Banner */}
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

        {/* Form Section */}
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
            className={`transition-all duration-300 ${
              isFormCollapsed
                ? 'max-h-0 overflow-hidden opacity-0'
                : 'max-h-[2000px] opacity-100'
            }`}
          >
            <NpcGeneratorForm
              values={formValues}
              onChange={handleFormChange}
              aiMode={aiMode}
              onAiModeChange={setUseAiEnhanced}
              onFastModeChange={setUseFastMode}
              onRequestMoreUses={requestMoreUses}
              isLoading={isGenerating}
              error={error}
              onSubmit={handleSubmit}
            />
          </div>

          {isFormCollapsed && npc && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body py-3 px-6">
                <p className="text-sm text-base-content/70">{formSummary}</p>
              </div>
            </div>
          )}
        </div>

        {/* NPC Display */}
        {(npc || isGenerating) && (
          <div className="w-full">
            <NpcDisplay npc={npc} isGenerating={isGenerating} />
          </div>
        )}

        {/* History */}
        <div className="w-full">
          <NpcHistory
            history={history}
            onSelect={handleHistorySelect}
            onDelete={removeEntry}
            onClear={clearHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default NpcGeneratorPage;
