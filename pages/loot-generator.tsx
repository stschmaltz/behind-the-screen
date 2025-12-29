import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import posthog from 'posthog-js';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import {
  LootDisplay,
  LootGeneratorForm,
  LootItemType,
} from '../components/loot';
import type {
  AiModeConfig,
  LootFormValues,
} from '../components/loot/LootGeneratorForm';
import {
  GenerationEntry,
  useLootHistory,
} from '../hooks/use-loot-history.hook';
import LootHistory from '../components/loot/LootHistory';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import { useGenerationUsage } from '../hooks/use-generation-usage';
import { generateFreeLoot } from '../lib/generate-free-loot';

// ============================================================================
// GraphQL
// ============================================================================

const GENERATE_LOOT_MUTATION = `
  mutation GenerateLoot($partyLevel: Int!, $srdItemCount: Int!, $randomItemCount: Int!, $context: String, $lootQuality: String, $includeEffects: Boolean) {
    generateLoot(
      partyLevel: $partyLevel
      srdItemCount: $srdItemCount
      randomItemCount: $randomItemCount
      context: $context
      lootQuality: $lootQuality
      includeEffects: $includeEffects
    ) {
      level
      coins
      item
      description
      note
      source
      rarity
      effects
    }
  }
`;

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FORM_VALUES: LootFormValues = {
  partyLevel: 3,
  srdItemCount: 4,
  randomItemCount: 3,
  context: '',
  lootQuality: 'standard',
  includeEffects: true,
};

// ============================================================================
// Page Component
// ============================================================================

const LootGeneratorPage: NextPage = () => {
  const { isLoading } = useUser();

  // Form state
  const [formValues, setFormValues] =
    useState<LootFormValues>(DEFAULT_FORM_VALUES);
  const [useAiEnhanced, setUseAiEnhanced] = useState(true);

  // UI state
  const [loot, setLoot] = useState<LootItemType[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  // Hooks
  const { history, addEntry, removeEntry, clearHistory } = useLootHistory();
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
    remainingUses,
    hasAvailableUses,
    hasRequestedMoreUses,
  };

  // Handlers
  const handleFormChange = useCallback((updates: Partial<LootFormValues>) => {
    setFormValues((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleHistorySelect = useCallback((entry: GenerationEntry) => {
    setFormValues({
      partyLevel: entry.partyLevel,
      srdItemCount: entry.srdItemCount,
      randomItemCount: entry.randomItemCount,
      context: entry.context,
      lootQuality: 'standard', // History doesn't store this, use default
      includeEffects: true, // History doesn't store this, use default
    });
    setLoot(entry.loot);
    setError(null);
    setIsFormCollapsed(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setLoot(null);

    const {
      partyLevel,
      srdItemCount,
      randomItemCount,
      context,
      lootQuality,
      includeEffects,
    } = formValues;

    const isUsingAiFeatures =
      useAiEnhanced && (randomItemCount > 0 || context.trim().length > 0);

    try {
      let generatedLoot: LootItemType[];

      if (useAiEnhanced) {
        const data = await asyncFetch<{ generateLoot: LootItemType[] }>(
          GENERATE_LOOT_MUTATION,
          {
            partyLevel,
            srdItemCount,
            randomItemCount,
            context,
            lootQuality,
            includeEffects,
          },
        );
        generatedLoot = data.generateLoot;

        if (isUsingAiFeatures) {
          refetchUsage();
        }
      } else {
        generatedLoot = generateFreeLoot(partyLevel, srdItemCount);
      }

      setLoot(generatedLoot);

      // Analytics
      posthog.capture('loot_generated', {
        use_ai_enhanced: useAiEnhanced,
        party_level: partyLevel,
        srd_item_count: srdItemCount,
        random_item_count: randomItemCount,
        has_context: !!context,
        loot_quality: lootQuality,
        is_using_ai_features: isUsingAiFeatures,
        total_items: generatedLoot.length,
      });

      addEntry({
        partyLevel,
        srdItemCount,
        randomItemCount: useAiEnhanced ? randomItemCount : 0,
        context: useAiEnhanced ? context : '',
        loot: generatedLoot,
      });
      setIsFormCollapsed(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message || 'Failed to generate loot.');
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
            Loading loot generator...
          </p>
        </div>
      </div>
    );
  }

  // Collapsed form summary
  const formSummary = `Level ${formValues.partyLevel} • ${formValues.srdItemCount} Official + ${formValues.randomItemCount} AI Items${formValues.context ? ` • ${formValues.context}` : ''}`;

  return (
    <div className="min-h-screen h-full bg-base-200/30 px-4 py-8 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Beta Banner */}
        <div className="alert alert-info">
          <div className="flex-1">
            <p>
              💎 <strong>Beta Feature:</strong> This Loot Generator is in beta.
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
            className={`transition-all duration-300 ${
              isFormCollapsed
                ? 'max-h-0 overflow-hidden opacity-0'
                : 'max-h-[2000px] opacity-100'
            }`}
          >
            <LootGeneratorForm
              values={formValues}
              onChange={handleFormChange}
              aiMode={aiMode}
              onAiModeChange={setUseAiEnhanced}
              onRequestMoreUses={requestMoreUses}
              isLoading={isGenerating}
              error={error}
              onSubmit={handleSubmit}
            />
          </div>

          {isFormCollapsed && loot && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body py-3 px-6">
                <p className="text-sm text-base-content/70">{formSummary}</p>
              </div>
            </div>
          )}
        </div>

        {/* Loot Display */}
        {(loot || isGenerating) && (
          <div className="w-full">
            <LootDisplay
              loot={loot}
              context={formValues.context}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* History */}
        <div className="w-full">
          <LootHistory
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

export default LootGeneratorPage;
