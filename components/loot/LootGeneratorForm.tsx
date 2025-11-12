import React from 'react';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { ErrorIcon, TreasureChestIcon } from '../icons';

interface LootGeneratorFormProps {
  partyLevel: number;
  setPartyLevel: (value: number) => void;
  srdItemCount: number;
  setSrdItemCount: (value: number) => void;
  randomItemCount: number;
  setRandomItemCount: (value: number) => void;
  context: string;
  setContext: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  error: string | null;
  useAiEnhanced: boolean;
  setUseAiEnhanced: (value: boolean) => void;
  remainingAiUses: number;
  hasAvailableAiUses: boolean;
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
  isLoading,
  handleSubmit,
  error,
  useAiEnhanced,
  setUseAiEnhanced,
  remainingAiUses,
  hasAvailableAiUses,
}) => {
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
                max={10}
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
                      ? `${remainingAiUses} uses remaining`
                      : 'No uses remaining - using free mode'}
                  </span>
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
