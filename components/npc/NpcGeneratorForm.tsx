import React from 'react';
import { Button } from '../ui/Button';
import { Combobox } from '../ui/Combobox';
import { DiceIcon, ErrorIcon, UserIcon } from '../icons';
import {
  OCCUPATION_OPTIONS,
  RACE_OPTIONS,
  SETTING_OPTIONS,
} from '../../data/npc-data';

interface NpcGeneratorFormProps {
  race: string;
  setRace: (value: string) => void;
  occupation: string;
  setOccupation: (value: string) => void;
  context: string;
  setContext: (value: string) => void;
  includeSecret: boolean;
  setIncludeSecret: (value: boolean) => void;
  includeBackground: boolean;
  setIncludeBackground: (value: boolean) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  error: string | null;
  useAiEnhanced: boolean;
  setUseAiEnhanced: (value: boolean) => void;
  remainingAiUses: number;
  hasAvailableAiUses: boolean;
}

const NpcGeneratorForm: React.FC<NpcGeneratorFormProps> = ({
  race,
  setRace,
  occupation,
  setOccupation,
  context,
  setContext,
  includeSecret,
  setIncludeSecret,
  includeBackground,
  setIncludeBackground,
  isLoading,
  handleSubmit,
  error,
  useAiEnhanced,
  setUseAiEnhanced,
  remainingAiUses,
  hasAvailableAiUses,
}) => {
  const randomizeRace = () => {
    if (!isLoading && useAiEnhanced) {
      const randomIndex = Math.floor(Math.random() * RACE_OPTIONS.length);
      setRace(RACE_OPTIONS[randomIndex].value);
    }
  };

  const randomizeOccupation = () => {
    if (!isLoading && useAiEnhanced) {
      const randomIndex = Math.floor(Math.random() * OCCUPATION_OPTIONS.length);
      setOccupation(OCCUPATION_OPTIONS[randomIndex].value);
    }
  };

  const randomizeContext = () => {
    if (!isLoading && useAiEnhanced) {
      const randomIndex = Math.floor(Math.random() * SETTING_OPTIONS.length);
      setContext(SETTING_OPTIONS[randomIndex].value);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl h-fit min-w-[250px]">
      <div className="card-body">
        <h1 className="card-title text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3">
          <UserIcon className="w-8 h-8 text-primary" />
          NPC Generator
        </h1>

        <div className="alert alert-info shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">
            Empty fields will be randomly generated
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Combobox
                  options={RACE_OPTIONS}
                  value={race}
                  onChange={setRace}
                  placeholder="Type or select a race..."
                  label="Race (Optional)"
                  disabled={isLoading || !useAiEnhanced}
                />
              </div>
              <button
                type="button"
                onClick={randomizeRace}
                disabled={isLoading || !useAiEnhanced}
                className="btn btn-square btn-outline"
                title="Randomize Race"
              >
                <DiceIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Combobox
                  options={OCCUPATION_OPTIONS}
                  value={occupation}
                  onChange={setOccupation}
                  placeholder="Type or select an occupation..."
                  label="Occupation (Optional)"
                  disabled={isLoading || !useAiEnhanced}
                />
              </div>
              <button
                type="button"
                onClick={randomizeOccupation}
                disabled={isLoading || !useAiEnhanced}
                className="btn btn-square btn-outline"
                title="Randomize Occupation"
              >
                <DiceIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Combobox
                  options={SETTING_OPTIONS}
                  value={context}
                  onChange={setContext}
                  placeholder="Type or select a setting..."
                  label="Setting/Context (Optional)"
                  disabled={isLoading || !useAiEnhanced}
                />
              </div>
              <button
                type="button"
                onClick={randomizeContext}
                disabled={isLoading || !useAiEnhanced}
                className="btn btn-square btn-outline"
                title="Randomize Setting"
              >
                <DiceIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  checked={includeSecret}
                  onChange={(e) => setIncludeSecret(e.target.checked)}
                  className="checkbox checkbox-primary"
                  disabled={isLoading || !useAiEnhanced}
                />
                <span className="label-text">Include Secret</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  checked={includeBackground}
                  onChange={(e) => setIncludeBackground(e.target.checked)}
                  className="checkbox checkbox-primary"
                  disabled={isLoading || !useAiEnhanced}
                />
                <span className="label-text">Include Background Story</span>
              </label>
            </div>

            <div className="divider"></div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  checked={useAiEnhanced}
                  onChange={(e) => setUseAiEnhanced(e.target.checked)}
                  className="toggle toggle-primary"
                  disabled={isLoading || !hasAvailableAiUses}
                />
                <div className="flex flex-col">
                  <span className="label-text font-semibold">
                    AI Enhanced Mode
                  </span>
                  <span className="label-text-alt text-xs">
                    {hasAvailableAiUses
                      ? `${remainingAiUses} of 25 uses remaining this week`
                      : 'No uses remaining - resets weekly'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              label={isLoading ? 'Generating NPC...' : 'Generate NPC'}
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
              className="w-full py-3 text-lg"
            />
          </div>
        </form>

        {error && (
          <div className="mt-6 alert alert-error shadow-lg">
            <div>
              <ErrorIcon className="stroke-current flex-shrink-0 h-6 w-6" />
              <span>Error: {error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NpcGeneratorForm;
