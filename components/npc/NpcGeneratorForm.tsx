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
  hasRequestedMoreUses: boolean;
  onRequestMoreUses: () => void;
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
  hasRequestedMoreUses,
  onRequestMoreUses,
}) => {
  const randomizeRace = () => {
    if (!isLoading) {
      const randomIndex = Math.floor(Math.random() * RACE_OPTIONS.length);
      setRace(RACE_OPTIONS[randomIndex].value);
    }
  };

  const randomizeOccupation = () => {
    if (!isLoading) {
      const randomIndex = Math.floor(Math.random() * OCCUPATION_OPTIONS.length);
      setOccupation(OCCUPATION_OPTIONS[randomIndex].value);
    }
  };

  const randomizeContext = () => {
    if (!isLoading) {
      const randomIndex = Math.floor(Math.random() * SETTING_OPTIONS.length);
      setContext(SETTING_OPTIONS[randomIndex].value);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl h-fit min-w-[250px]">
      <div className="card-body p-4 sm:p-6">
        <h1 className="card-title text-2xl font-bold text-center mb-3 flex items-center justify-center gap-2">
          <UserIcon className="w-6 h-6 text-primary" />
          NPC Generator
        </h1>

        <div className="alert alert-info shadow-sm text-sm py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs">
            Empty fields will be randomly generated
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Combobox
                  options={RACE_OPTIONS}
                  value={race}
                  onChange={setRace}
                  placeholder="Type or select a race..."
                  label="Race (Optional)"
                  disabled={isLoading}
                  size="sm"
                />
              </div>
              <button
                type="button"
                onClick={randomizeRace}
                disabled={isLoading}
                className="btn btn-sm btn-square btn-outline"
                title="Randomize Race"
              >
                <DiceIcon className="w-4 h-4" />
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
                  disabled={isLoading}
                  size="sm"
                />
              </div>
              <button
                type="button"
                onClick={randomizeOccupation}
                disabled={isLoading}
                className="btn btn-sm btn-square btn-outline"
                title="Randomize Occupation"
              >
                <DiceIcon className="w-4 h-4" />
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
                  disabled={isLoading}
                  size="sm"
                />
              </div>
              <button
                type="button"
                onClick={randomizeContext}
                disabled={isLoading}
                className="btn btn-sm btn-square btn-outline"
                title="Randomize Setting"
              >
                <DiceIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3 py-1">
                <input
                  type="checkbox"
                  checked={includeSecret}
                  onChange={(e) => setIncludeSecret(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary"
                  disabled={isLoading}
                />
                <span className="label-text text-sm">Include Secret</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3 py-1">
                <input
                  type="checkbox"
                  checked={includeBackground}
                  onChange={(e) => setIncludeBackground(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary"
                  disabled={isLoading}
                />
                <span className="label-text text-sm">
                  Include Background Story
                </span>
              </label>
            </div>

            <div className="divider my-2"></div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3 py-1">
                <input
                  type="checkbox"
                  checked={useAiEnhanced}
                  onChange={(e) => setUseAiEnhanced(e.target.checked)}
                  className="toggle toggle-primary toggle-sm"
                  disabled={isLoading || !hasAvailableAiUses}
                />
                <div className="flex flex-col flex-1">
                  <span className="label-text font-semibold text-sm">
                    AI Enhanced Mode
                  </span>
                  <span className="label-text-alt text-xs">
                    {hasAvailableAiUses
                      ? remainingAiUses > 1000
                        ? 'Unlimited'
                        : `${remainingAiUses}/25 remaining (7-day window)`
                      : 'No generations remaining'}
                  </span>
                  {!hasAvailableAiUses && !hasRequestedMoreUses && (
                    <button
                      type="button"
                      onClick={onRequestMoreUses}
                      className="btn btn-xs btn-ghost mt-1 self-start p-0 h-auto min-h-0"
                    >
                      Request More Uses
                    </button>
                  )}
                  {hasRequestedMoreUses && (
                    <span className="text-xs text-success mt-1">
                      ✓ Request submitted
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              label={isLoading ? 'Generating...' : 'Generate NPC'}
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
              className="w-full py-2"
            />
          </div>
        </form>

        {error && (
          <div className="mt-3 alert alert-error shadow-lg text-sm">
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
