import React from 'react';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { ErrorIcon, TreasureChestIcon } from '../icons';

// ============================================================================
// Types
// ============================================================================

export type LootQuality = 'basic' | 'standard' | 'good' | 'major' | 'legendary';

export interface LootFormValues {
  partyLevel: number;
  srdItemCount: number;
  randomItemCount: number;
  context: string;
  lootQuality: LootQuality;
  includeEffects: boolean;
}

export interface AiModeConfig {
  enabled: boolean;
  remainingUses: number;
  hasAvailableUses: boolean;
  hasRequestedMoreUses: boolean;
}

interface LootGeneratorFormProps {
  values: LootFormValues;
  onChange: (values: Partial<LootFormValues>) => void;
  aiMode: AiModeConfig;
  onAiModeChange: (enabled: boolean) => void;
  onRequestMoreUses: () => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const LOOT_QUALITY_DESCRIPTIONS: Record<LootQuality, string> = {
  basic: 'Mostly common items, trinkets',
  standard: 'Normal mix of items',
  good: 'More uncommon and rare items',
  major: 'Guaranteed rare+ items',
  legendary: 'Jackpot! Very rare or legendary',
};

const LOOT_QUALITY_OPTIONS: { value: LootQuality; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'standard', label: 'Standard' },
  { value: 'good', label: 'Good' },
  { value: 'major', label: 'Major' },
  { value: 'legendary', label: 'Legendary' },
];

// ============================================================================
// Sub-components
// ============================================================================

interface AiModeToggleProps {
  aiMode: AiModeConfig;
  onAiModeChange: (enabled: boolean) => void;
  onRequestMoreUses: () => void;
  disabled: boolean;
}

const AiModeToggle: React.FC<AiModeToggleProps> = ({
  aiMode,
  onAiModeChange,
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
      <label className="label cursor-pointer justify-start gap-3 py-1">
        <input
          type="checkbox"
          checked={aiMode.enabled}
          onChange={(e) => onAiModeChange(e.target.checked)}
          className="toggle toggle-primary toggle-sm"
          disabled={disabled || !aiMode.hasAvailableUses}
        />
        <div className="flex flex-col flex-1">
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
    </div>
  );
};

interface LootQualitySelectProps {
  value: LootQuality;
  onChange: (value: LootQuality) => void;
  disabled: boolean;
}

const LootQualitySelect: React.FC<LootQualitySelectProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <div className="form-control">
    <label className="label py-1">
      <span className="label-text font-medium text-sm">Loot Quality</span>
    </label>
    <select
      className="select select-bordered select-sm w-full"
      value={value}
      onChange={(e) => onChange(e.target.value as LootQuality)}
      disabled={disabled}
    >
      {LOOT_QUALITY_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <label className="label py-0">
      <span className="label-text-alt text-xs">
        {LOOT_QUALITY_DESCRIPTIONS[value]}
      </span>
    </label>
  </div>
);

interface EffectsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}

const EffectsToggle: React.FC<EffectsToggleProps> = ({
  checked,
  onChange,
  disabled,
}) => (
  <div className="form-control">
    <label className="label py-1">
      <span className="label-text font-medium text-sm">Item Effects</span>
    </label>
    <label className="label cursor-pointer justify-start gap-2 border border-base-300 rounded-lg px-3 py-2 bg-base-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox checkbox-sm checkbox-primary"
        disabled={disabled}
      />
      <span className="label-text text-xs">
        Include effects when applicable
      </span>
    </label>
    <label className="label py-0">
      <span className="label-text-alt text-xs">
        Mechanical or flavor effects
      </span>
    </label>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const LootGeneratorForm: React.FC<LootGeneratorFormProps> = ({
  values,
  onChange,
  aiMode,
  onAiModeChange,
  onRequestMoreUses,
  isLoading,
  error,
  onSubmit,
}) => {
  const isAiDisabled = isLoading || !aiMode.enabled;

  return (
    <div className="card bg-base-100 shadow-xl h-fit min-w-[250px]">
      <div className="card-body p-4 sm:p-6">
        <h1 className="card-title text-2xl font-bold text-center mb-3 flex items-center justify-center gap-2">
          <TreasureChestIcon className="w-6 h-6 text-primary" />
          Loot Table Generator
        </h1>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Core Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormInput
              id="partyLevel"
              label="Party Level"
              type="number"
              value={values.partyLevel}
              onChange={(e) =>
                onChange({ partyLevel: parseInt(e.target.value) })
              }
              min={1}
              max={20}
              required
              className="input-bordered w-full input-sm"
              disabled={isLoading}
            />

            <FormInput
              id="srdItemCount"
              label="Official Source Items"
              type="number"
              value={values.srdItemCount}
              onChange={(e) =>
                onChange({ srdItemCount: parseInt(e.target.value) })
              }
              min={0}
              max={10}
              required
              className="input-bordered w-full input-sm"
              disabled={isLoading}
            />

            <FormInput
              id="randomItemCount"
              label="AI Generated Items"
              type="number"
              value={values.randomItemCount}
              onChange={(e) =>
                onChange({ randomItemCount: parseInt(e.target.value) })
              }
              min={0}
              max={5}
              className="input-bordered w-full input-sm"
              disabled={isAiDisabled}
            />
          </div>

          {/* AI-Enhanced Options */}
          <div className="grid grid-cols-1 gap-3">
            <FormInput
              id="context"
              label="Location (Optional)"
              type="text"
              value={values.context}
              onChange={(e) => onChange({ context: e.target.value })}
              className="input-bordered w-full input-sm"
              placeholder="e.g., ancient tomb, dragon's hoard, enchanted forest"
              disabled={isAiDisabled}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LootQualitySelect
                value={values.lootQuality}
                onChange={(val) => onChange({ lootQuality: val })}
                disabled={isAiDisabled}
              />

              <EffectsToggle
                checked={values.includeEffects}
                onChange={(checked) => onChange({ includeEffects: checked })}
                disabled={isAiDisabled}
              />
            </div>
          </div>

          <div className="divider my-2" />

          {/* AI Mode Toggle */}
          <AiModeToggle
            aiMode={aiMode}
            onAiModeChange={onAiModeChange}
            onRequestMoreUses={onRequestMoreUses}
            disabled={isLoading}
          />

          {/* Submit Button */}
          <div className="mt-4">
            <Button
              type="submit"
              label={isLoading ? 'Generating...' : 'Generate Loot'}
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
              className="w-full py-2"
            />
          </div>
        </form>

        {/* Error Display */}
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

export default LootGeneratorForm;
