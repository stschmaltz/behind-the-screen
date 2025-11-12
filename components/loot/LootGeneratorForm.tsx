import React from 'react';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { ErrorIcon, TreasureChestIcon } from '../icons';

export type LootQuality = 'basic' | 'standard' | 'good' | 'major' | 'legendary';

interface LootGeneratorFormProps {
  partyLevel: number;
  setPartyLevel: (value: number) => void;
  srdItemCount: number;
  setSrdItemCount: (value: number) => void;
  randomItemCount: number;
  setRandomItemCount: (value: number) => void;
  context: string;
  setContext: (value: string) => void;
  lootQuality: LootQuality;
  setLootQuality: (value: LootQuality) => void;
  includeEffects: boolean;
  setIncludeEffects: (value: boolean) => void;
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

const LootGeneratorForm: React.FC<LootGeneratorFormProps> = ({
  partyLevel,
  setPartyLevel,
  srdItemCount,
  setSrdItemCount,
  randomItemCount,
  setRandomItemCount,
  context,
  setContext,
  lootQuality,
  setLootQuality,
  includeEffects,
  setIncludeEffects,
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
  const getLootQualityDescription = (quality: LootQuality): string => {
    switch (quality) {
      case 'basic':
        return 'Mostly common items, trinkets';
      case 'standard':
        return 'Normal mix of items';
      case 'good':
        return 'More uncommon and rare items';
      case 'major':
        return 'Guaranteed rare+ items';
      case 'legendary':
        return 'Jackpot! Very rare or legendary';
      default:
        return '';
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl h-fit min-w-[250px]">
      <div className="card-body p-4 sm:p-6">
        <h1 className="card-title text-2xl font-bold text-center mb-3 flex items-center justify-center gap-2">
          <TreasureChestIcon className="w-6 h-6 text-primary" />
          Loot Table Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="form-control">
              <FormInput
                id="partyLevel"
                label="Party Level"
                type="number"
                value={partyLevel}
                onChange={(e) => setPartyLevel(parseInt(e.target.value))}
                min={1}
                max={20}
                required
                className="input-bordered w-full input-sm"
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <FormInput
                id="srdItemCount"
                label="Official Source Items"
                type="number"
                value={srdItemCount}
                onChange={(e) => setSrdItemCount(parseInt(e.target.value))}
                min={0}
                max={10}
                required
                className="input-bordered w-full input-sm"
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <FormInput
                id="randomItemCount"
                label="AI Generated Items"
                type="number"
                value={randomItemCount}
                onChange={(e) => setRandomItemCount(parseInt(e.target.value))}
                min={0}
                max={5}
                className="input-bordered w-full input-sm"
                disabled={isLoading || !useAiEnhanced}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="form-control">
              <FormInput
                id="context"
                label="Location (Optional)"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="input-bordered w-full input-sm"
                placeholder="e.g., ancient tomb, dragon's hoard, enchanted forest"
                disabled={isLoading || !useAiEnhanced}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium text-sm">
                    Loot Quality
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={lootQuality}
                  onChange={(e) =>
                    setLootQuality(e.target.value as LootQuality)
                  }
                  disabled={isLoading || !useAiEnhanced}
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="good">Good</option>
                  <option value="major">Major</option>
                  <option value="legendary">Legendary</option>
                </select>
                <label className="label py-0">
                  <span className="label-text-alt text-xs">
                    {getLootQualityDescription(lootQuality)}
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium text-sm">
                    Item Effects
                  </span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border border-base-300 rounded-lg px-3 py-2 bg-base-200">
                  <input
                    type="checkbox"
                    checked={includeEffects}
                    onChange={(e) => setIncludeEffects(e.target.checked)}
                    className="checkbox checkbox-sm checkbox-primary"
                    disabled={isLoading || !useAiEnhanced}
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
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="grid grid-cols-1 gap-3">
            <div className="form-control hidden">
              <label className="label py-1">
                <span className="label-text font-medium text-sm">
                  Loot Quality (old)
                </span>
              </label>
              <select
                className="select select-bordered select-sm w-full hidden"
                value={lootQuality}
                onChange={(e) => setLootQuality(e.target.value as LootQuality)}
                disabled={isLoading || !useAiEnhanced}
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="good">Good</option>
                <option value="major">Major</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

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
              label={isLoading ? 'Generating...' : 'Generate Loot'}
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

export default LootGeneratorForm;
