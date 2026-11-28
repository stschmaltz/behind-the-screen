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
import { useCurrentUserContext } from '../context/UserContext';
import { SignInForAi } from '../components/generators/SignInForAi';
import { ToolSeoContent } from '../components/seo/ToolSeoContent';
import { JsonLd } from '../components/seo/JsonLd';
import { buildWebAppJsonLd, FaqItem } from '../lib/seo';
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

const STEPS = [
  {
    title: 'Pick what matters',
    body: 'Choose a race, gender, occupation or setting, or leave everything blank for a fully random character.',
  },
  {
    title: 'Generate',
    body: 'Get a complete NPC with a name, age, personality, appearance, quirk and motivation in seconds.',
  },
  {
    title: 'Reuse it later',
    body: 'Every NPC is saved to your history on this device so you can bring them back mid-session.',
  },
];

const FAQS: FaqItem[] = [
  {
    question: 'Is the NPC generator free?',
    answer:
      'Yes. The random NPC generator is free and works without an account. Signing in (also free) unlocks AI-enhanced NPCs that follow your prompts, with a weekly usage allowance.',
  },
  {
    question: 'What does each generated NPC include?',
    answer:
      'Each NPC comes with a name, race, gender, age, occupation, personality, appearance, a quirk and a motivation. You can optionally add a secret and a short background story.',
  },
  {
    question: 'Can I use it for games other than D&D 5e?',
    answer:
      'Yes. The NPCs are system-neutral descriptions with no stat blocks, so they work for Pathfinder, older D&D editions and most fantasy tabletop RPGs.',
  },
  {
    question: 'Are my generated NPCs saved?',
    answer:
      'Your recent NPCs are stored in your browser history panel on this device, so you can reopen or delete them at any time.',
  },
];

const RELATED_TOOLS = [
  {
    href: '/loot-generator',
    label: 'Loot Generator',
    description: 'Roll level-appropriate treasure and magic items.',
  },
  {
    href: '/encounters',
    label: 'Encounter Manager',
    description: 'Track initiative, HP and conditions during combat.',
  },
];

// ============================================================================
// Page Component
// ============================================================================

const NpcGeneratorPage: NextPage = () => {
  const { user, isLoading: isLoadingAuth } = useUser();
  const { currentUser } = useCurrentUserContext();
  const isSignedIn = Boolean(currentUser);
  const isCheckingSession = isLoadingAuth || (Boolean(user) && !isSignedIn);

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
  } = useGenerationUsage({ enabled: isSignedIn });
  const aiEnabled = useAiEnhanced && isSignedIn && hasAvailableUses;

  // Disable AI mode if no uses available
  useEffect(() => {
    if (isSignedIn && !isLoadingUsage && !hasAvailableUses) {
      setUseAiEnhanced(false);
    }
  }, [hasAvailableUses, isSignedIn, isLoadingUsage]);

  // Derived state
  const aiMode: AiModeConfig = {
    enabled: aiEnabled,
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
      aiEnabled &&
      (gender.trim().length > 0 ||
        race.trim().length > 0 ||
        occupation.trim().length > 0 ||
        context.trim().length > 0 ||
        includeSecret ||
        includeBackground);

    try {
      let generatedNpc: NpcType;

      if (aiEnabled) {
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
        use_ai_enhanced: aiEnabled,
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
        gender: aiEnabled ? gender : '',
        race: aiEnabled ? race : '',
        occupation: aiEnabled ? occupation : '',
        context: aiEnabled ? context : '',
        includeSecret: aiEnabled ? includeSecret : false,
        includeBackground: aiEnabled ? includeBackground : false,
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

  // Collapsed form summary
  const formSummary = `${formValues.race || 'Random'} ${formValues.occupation || 'Random'}${formValues.context ? ` • ${formValues.context}` : ''}${formValues.includeSecret ? ' • Secret' : ''}${formValues.includeBackground ? ' • Background' : ''}`;

  return (
    <div className="pb-8">
      <JsonLd
        id="npc-generator-app"
        data={buildWebAppJsonLd({
          name: 'D&D 5e NPC Generator',
          description:
            'Free random NPC generator for D&D 5e and other tabletop RPGs.',
          path: '/npc-generator',
        })}
      />
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-balance">
            Free D&amp;D 5e NPC Generator
          </h1>
          <p className="max-w-2xl mx-auto text-base-content/70 text-balance">
            Create a memorable non-player character in one click: name, race,
            occupation, personality, appearance, quirks and motivations, ready
            to drop into your session.
          </p>
          <p className="text-xs text-base-content/60">
            <span className="badge badge-accent badge-sm mr-2">Beta</span>
            Have feedback or ideas?{' '}
            <Link href="/feedback" className="link link-primary">
              Let me know!
            </Link>
          </p>
        </header>

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
              aiSlot={
                isSignedIn ? undefined : (
                  <SignInForAi
                    returnTo="/npc-generator"
                    isCheckingSession={isCheckingSession}
                  />
                )
              }
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

        <ToolSeoContent
          id="npc-generator"
          howItWorksTitle="How the NPC generator works"
          steps={STEPS}
          faqs={FAQS}
          relatedTools={RELATED_TOOLS}
        />
      </div>
    </div>
  );
};

export default NpcGeneratorPage;
