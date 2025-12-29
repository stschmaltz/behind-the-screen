import React from 'react';
import { Button } from '../ui/Button';
import { Combobox } from '../ui/Combobox';
import { DiceIcon, ErrorIcon, UserIcon } from '../icons';
import {
  GENDER_OPTIONS,
  OCCUPATION_OPTIONS,
  RACE_OPTIONS,
  SETTING_OPTIONS,
} from '../../data/npc-data';

// ============================================================================
// Types
// ============================================================================

export interface NpcFormValues {
  gender: string;
  race: string;
  occupation: string;
  context: string;
  includeSecret: boolean;
  includeBackground: boolean;
}

export interface AiModeConfig {
  enabled: boolean;
  fastMode: boolean;
  remainingUses: number;
  hasAvailableUses: boolean;
  hasRequestedMoreUses: boolean;
}

interface NpcGeneratorFormProps {
  values: NpcFormValues;
  onChange: (values: Partial<NpcFormValues>) => void;
  aiMode: AiModeConfig;
  onAiModeChange: (enabled: boolean) => void;
  onFastModeChange: (fastMode: boolean) => void;
  onRequestMoreUses: () => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

// ============================================================================
// Sub-components
// ============================================================================

interface RandomizeButtonProps {
  onClick: () => void;
  disabled: boolean;
  title: string;
}

const RandomizeButton: React.FC<RandomizeButtonProps> = ({
  onClick,
  disabled,
  title,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="btn btn-sm btn-square btn-outline"
    title={title}
  >
    <DiceIcon className="w-4 h-4" />
  </button>
);

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  label: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  checked,
  onChange,
  disabled,
  label,
}) => (
  <div className="form-control">
    <label className="label cursor-pointer justify-start gap-3 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox checkbox-sm checkbox-primary"
        disabled={disabled}
      />
      <span className="label-text text-sm">{label}</span>
    </label>
  </div>
);

interface AiModeToggleProps {
  aiMode: AiModeConfig;
  onAiModeChange: (enabled: boolean) => void;
  onFastModeChange: (fastMode: boolean) => void;
  onRequestMoreUses: () => void;
  disabled: boolean;
}

const AiModeToggle: React.FC<AiModeToggleProps> = ({
  aiMode,
  onAiModeChange,
  onFastModeChange,
  onRequestMoreUses,
  disabled,
}) => {
  const usageText = aiMode.hasAvailableUses
    ? aiMode.remainingUses > 1000
      ? 'Unlimited'
      : `${aiMode.remainingUses}/25 remaining (7-day window)`
    : 'No generations remaining';

  return (
    <div className="form-control">
      <div className="flex flex-wrap items-start gap-6">
        {/* AI Enhanced Toggle */}
        <label className="label cursor-pointer justify-start gap-3 py-1">
          <input
            type="checkbox"
            checked={aiMode.enabled}
            onChange={(e) => onAiModeChange(e.target.checked)}
            className="toggle toggle-primary toggle-sm"
            disabled={disabled || !aiMode.hasAvailableUses}
          />
          <div className="flex flex-col">
            <span className="label-text font-semibold text-sm">
              AI Enhanced Mode
            </span>
            <span className="label-text-alt text-xs">{usageText}</span>
            {!aiMode.hasAvailableUses && !aiMode.hasRequestedMoreUses && (
              <button
                type="button"
                onClick={onRequestMoreUses}
                className="btn btn-xs btn-ghost mt-1 self-start p-0 h-auto min-h-0"
              >
                Request More Uses
              </button>
            )}
            {aiMode.hasRequestedMoreUses && (
              <span className="text-xs text-success mt-1">
                ✓ Request submitted
              </span>
            )}
          </div>
        </label>

        {/* Fast/Pro Mode Toggle - only shown when AI is enabled */}
        {aiMode.enabled && (
          <label className="label cursor-pointer justify-start gap-3 py-1 min-w-[160px]">
            <input
              type="checkbox"
              checked={!aiMode.fastMode}
              onChange={(e) => onFastModeChange(!e.target.checked)}
              className="toggle toggle-secondary toggle-sm"
              disabled={disabled}
            />
            <div className="flex flex-col">
              <span className="label-text font-semibold text-sm">
                {aiMode.fastMode ? 'Fast' : 'Pro'}
              </span>
              <span className="label-text-alt text-xs">
                {aiMode.fastMode ? 'Quick generation' : 'Higher quality'}
              </span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const NpcGeneratorForm: React.FC<NpcGeneratorFormProps> = ({
  values,
  onChange,
  aiMode,
  onAiModeChange,
  onFastModeChange,
  onRequestMoreUses,
  isLoading,
  error,
  onSubmit,
}) => {
  const randomize = (
    field: keyof NpcFormValues,
    options: { value: string }[],
  ) => {
    if (!isLoading) {
      const randomIndex = Math.floor(Math.random() * options.length);
      onChange({ [field]: options[randomIndex].value });
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

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {/* Gender and Race Fields - side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Race Field */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Combobox
                    options={RACE_OPTIONS}
                    value={values.race}
                    onChange={(val) => onChange({ race: val })}
                    placeholder="Type or select a race..."
                    label="Race (Optional)"
                    disabled={isLoading}
                    size="sm"
                  />
                </div>
                <RandomizeButton
                  onClick={() => randomize('race', RACE_OPTIONS)}
                  disabled={isLoading}
                  title="Randomize Race"
                />
              </div>
              {/* Gender Field */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Combobox
                    options={GENDER_OPTIONS}
                    value={values.gender}
                    onChange={(val) => onChange({ gender: val })}
                    placeholder="Any gender..."
                    label="Gender (Optional)"
                    disabled={isLoading}
                    size="sm"
                  />
                </div>
                <RandomizeButton
                  onClick={() => randomize('gender', GENDER_OPTIONS)}
                  disabled={isLoading}
                  title="Randomize Gender"
                />
              </div>
            </div>

            {/* Occupation Field */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Combobox
                  options={OCCUPATION_OPTIONS}
                  value={values.occupation}
                  onChange={(val) => onChange({ occupation: val })}
                  placeholder="Type or select an occupation..."
                  label="Occupation (Optional)"
                  disabled={isLoading}
                  size="sm"
                />
              </div>
              <RandomizeButton
                onClick={() => randomize('occupation', OCCUPATION_OPTIONS)}
                disabled={isLoading}
                title="Randomize Occupation"
              />
            </div>

            {/* Context Field */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Combobox
                  options={SETTING_OPTIONS}
                  value={values.context}
                  onChange={(val) => onChange({ context: val })}
                  placeholder="Type or select a setting..."
                  label="Setting/Context (Optional)"
                  disabled={isLoading}
                  size="sm"
                />
              </div>
              <RandomizeButton
                onClick={() => randomize('context', SETTING_OPTIONS)}
                disabled={isLoading}
                title="Randomize Setting"
              />
            </div>

            {/* Optional Fields */}
            <CheckboxField
              checked={values.includeSecret}
              onChange={(checked) => onChange({ includeSecret: checked })}
              disabled={isLoading}
              label="Include Secret"
            />

            <CheckboxField
              checked={values.includeBackground}
              onChange={(checked) => onChange({ includeBackground: checked })}
              disabled={isLoading}
              label="Include Background Story"
            />

            <div className="divider my-2" />

            {/* AI Mode Toggle */}
            <AiModeToggle
              aiMode={aiMode}
              onAiModeChange={onAiModeChange}
              onFastModeChange={onFastModeChange}
              onRequestMoreUses={onRequestMoreUses}
              disabled={isLoading}
            />
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
