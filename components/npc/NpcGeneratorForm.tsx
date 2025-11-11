import React from 'react';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { ErrorIcon, UserIcon } from '../icons';

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
}) => {
  return (
    <div className="card bg-base-100 shadow-xl h-fit min-w-[250px]">
      <div className="card-body">
        <h1 className="card-title text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3">
          <UserIcon className="w-8 h-8 text-primary" />
          NPC Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="form-control">
              <FormInput
                id="race"
                label="Race (Optional)"
                type="text"
                value={race}
                onChange={(e) => setRace(e.target.value)}
                className="input-bordered w-full"
                placeholder="e.g., Human, Elf, Dwarf, or leave blank"
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <FormInput
                id="occupation"
                label="Occupation (Optional)"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="input-bordered w-full"
                placeholder="e.g., Merchant, Guard, Innkeeper"
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <FormInput
                id="context"
                label="Setting/Context (Optional)"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="input-bordered w-full"
                placeholder="e.g., tavern, royal court, village"
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  checked={includeSecret}
                  onChange={(e) => setIncludeSecret(e.target.checked)}
                  className="checkbox checkbox-primary"
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <span className="label-text">Include Background Story</span>
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
