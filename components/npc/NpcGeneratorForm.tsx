import React from 'react';
import { Button } from '../ui/Button';
import { Combobox } from '../ui/Combobox';
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

const RACE_OPTIONS = [
  { value: 'Human', label: 'Human' },
  { value: 'Elf', label: 'Elf' },
  { value: 'Dwarf', label: 'Dwarf' },
  { value: 'Halfling', label: 'Halfling' },
  { value: 'Gnome', label: 'Gnome' },
  { value: 'Half-Elf', label: 'Half-Elf' },
  { value: 'Half-Orc', label: 'Half-Orc' },
  { value: 'Tiefling', label: 'Tiefling' },
  { value: 'Dragonborn', label: 'Dragonborn' },
  { value: 'Aasimar', label: 'Aasimar' },
  { value: 'Genasi', label: 'Genasi' },
  { value: 'Goliath', label: 'Goliath' },
  { value: 'Tabaxi', label: 'Tabaxi' },
  { value: 'Firbolg', label: 'Firbolg' },
  { value: 'Kenku', label: 'Kenku' },
  { value: 'Goblin', label: 'Goblin' },
  { value: 'Kobold', label: 'Kobold' },
];

const OCCUPATION_OPTIONS = [
  { value: 'Merchant', label: 'Merchant' },
  { value: 'Guard', label: 'Guard' },
  { value: 'Innkeeper', label: 'Innkeeper' },
  { value: 'Blacksmith', label: 'Blacksmith' },
  { value: 'Farmer', label: 'Farmer' },
  { value: 'Scholar', label: 'Scholar' },
  { value: 'Priest', label: 'Priest' },
  { value: 'Baker', label: 'Baker' },
  { value: 'Fisherman', label: 'Fisherman' },
  { value: 'Tailor', label: 'Tailor' },
  { value: 'Carpenter', label: 'Carpenter' },
  { value: 'Alchemist', label: 'Alchemist' },
  { value: 'Herbalist', label: 'Herbalist' },
  { value: 'Town Crier', label: 'Town Crier' },
  { value: 'Stable Hand', label: 'Stable Hand' },
  { value: 'Cook', label: 'Cook' },
  { value: 'Bard', label: 'Bard' },
  { value: 'Apothecary', label: 'Apothecary' },
  { value: 'Librarian', label: 'Librarian' },
  { value: 'Street Performer', label: 'Street Performer' },
  { value: 'Miner', label: 'Miner' },
  { value: 'Sailor', label: 'Sailor' },
  { value: 'Hunter', label: 'Hunter' },
  { value: 'Scribe', label: 'Scribe' },
  { value: 'Jeweler', label: 'Jeweler' },
];

const SETTING_OPTIONS = [
  { value: 'Tavern', label: 'Tavern' },
  { value: 'Market', label: 'Market' },
  { value: 'Temple', label: 'Temple' },
  { value: 'Royal Court', label: 'Royal Court' },
  { value: 'Village', label: 'Village' },
  { value: 'City', label: 'City' },
  { value: 'Forest', label: 'Forest' },
  { value: 'Mountain', label: 'Mountain' },
  { value: 'Coast', label: 'Coast' },
  { value: 'Dungeon', label: 'Dungeon' },
  { value: 'Guild Hall', label: 'Guild Hall' },
  { value: 'Docks', label: 'Docks' },
  { value: 'Slums', label: 'Slums' },
  { value: 'Noble District', label: 'Noble District' },
  { value: 'Wilderness', label: 'Wilderness' },
  { value: 'Ruins', label: 'Ruins' },
  { value: 'Prison', label: 'Prison' },
  { value: 'Library', label: 'Library' },
  { value: 'Academy', label: 'Academy' },
  { value: 'Bazaar', label: 'Bazaar' },
];

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
            <Combobox
              options={RACE_OPTIONS}
              value={race}
              onChange={setRace}
              placeholder="Type or select a race..."
              label="Race (Optional)"
              disabled={isLoading}
            />

            <Combobox
              options={OCCUPATION_OPTIONS}
              value={occupation}
              onChange={setOccupation}
              placeholder="Type or select an occupation..."
              label="Occupation (Optional)"
              disabled={isLoading}
            />

            <Combobox
              options={SETTING_OPTIONS}
              value={context}
              onChange={setContext}
              placeholder="Type or select a setting..."
              label="Setting/Context (Optional)"
              disabled={isLoading}
            />

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
