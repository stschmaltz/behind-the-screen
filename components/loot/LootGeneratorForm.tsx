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
}) => {
  return (
    <div className="card bg-base-100 shadow-xl h-fit min-w-[250px]">
      <div className="card-body">
        <h1 className="card-title text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3">
          <TreasureChestIcon className="w-8 h-8 text-primary" />
          Loot Generator
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
                label="Number of Official Source Items (0-10)"
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
                label="Number of Random Items (0-10)"
                type="number"
                value={randomItemCount}
                onChange={(e) => setRandomItemCount(parseInt(e.target.value))}
                min={0}
                max={10}
                className="input-bordered w-full"
                disabled={isLoading}
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
                disabled={isLoading}
              />
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
