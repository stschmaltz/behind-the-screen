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
      <div className="card-body">
        <h1 className="card-title text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3">
          <TreasureChestIcon className="w-8 h-8 text-primary" />
          Loot Table Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="form-control">
              <FormInput
                id="partyLevel"
                label="Party Level (1-20)"
                type="number"
                value={partyLevel}
                onChange={(e) => setPartyLevel(parseInt(e.target.value))}
                min={1}
                max={20}
                required
                className="input-bordered w-full"
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <FormInput
                id="srdItemCount"
                label="# of Official Source Items"
                type="number"
                value={srdItemCount}
                onChange={(e) => setSrdItemCount(parseInt(e.target.value))}
                min={0}
                max={10}
                required
                className="input-bordered w-full"
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <FormInput
                id="randomItemCount"
                label="# of AI Generated Items"
                type="number"
                value={randomItemCount}
                onChange={(e) => setRandomItemCount(parseInt(e.target.value))}
                min={0}
                max={5}
                className="input-bordered w-full"
                disabled={isLoading || !useAiEnhanced}
              />
            </div>

            <div className="form-control">
              <FormInput
                id="context"
                label="Context/Theme (Optional)"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="input-bordered w-full"
                placeholder="e.g., forest, dungeon, underwater"
                disabled={isLoading || !useAiEnhanced}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Loot Quality</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={lootQuality}
                onChange={(e) => setLootQuality(e.target.value as LootQuality)}
                disabled={isLoading || !useAiEnhanced}
              >
                <option value="basic">Basic - Trinkets & Common Items</option>
                <option value="standard">Standard - Normal Mix</option>
                <option value="good">Good - Better Items</option>
                <option value="major">Major - Rare Treasure</option>
                <option value="legendary">Legendary - Jackpot!</option>
              </select>
              <label className="label">
                <span className="label-text-alt">
                  {getLootQualityDescription(lootQuality)}
                </span>
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
                <div className="flex flex-col flex-1">
                  <span className="label-text font-semibold">
                    AI Enhanced Mode
                  </span>
                  <span className="label-text-alt text-xs">
                    {hasAvailableAiUses
                      ? `${remainingAiUses} of 25 AI generations remaining (rolling 7-day window)`
                      : 'No AI generations remaining (rolling 7-day window)'}
                  </span>
                  {!hasAvailableAiUses && !hasRequestedMoreUses && (
                    <button
                      type="button"
                      onClick={onRequestMoreUses}
                      className="btn btn-xs btn-ghost mt-1 self-start"
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

          <div className="mt-6">
            <Button
              type="submit"
              label={isLoading ? 'Generating Treasure...' : 'Generate Loot'}
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

export default LootGeneratorForm;
