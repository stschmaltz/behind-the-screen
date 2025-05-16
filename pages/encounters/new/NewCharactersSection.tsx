import React from 'react';
import CharacterCard from './CharacterCard';
import { EncounterCharacter } from '../../../types/encounters';
import { Button } from '../../../components/ui/Button';
import { useCharacterState } from '../../../hooks/useCharacterState';

interface NewCharactersSectionProps {
  characters: EncounterCharacter[];
  onCharactersChange: (updatedCharacters: EncounterCharacter[]) => void;
}

const NewCharactersSection: React.FC<NewCharactersSectionProps> = ({
  characters,
  onCharactersChange,
}) => {
  const {
    monsters,
    monsterOptions,
    isLoading,
    error,
    selectedMonsterNames,
    collapseRefs,
    handleCharacterFieldChange,
    handleMonsterSelectChange,
    handleAbilityScoreChange,
    addCharacter,
    removeCharacter,
    duplicateCharacter,
  } = useCharacterState(characters, onCharactersChange);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Characters</h2>

      <Button
        variant="secondary"
        label={
          characters.length > 0 ? 'Add Another Character' : 'Add Character'
        }
        onClick={addCharacter}
        className="my-4 w-full"
      />

      <div className="mb-4">
        <label className="label text-lg font-semibold">Characters</label>

        {isLoading && <p>Loading monster list...</p>}
        {error && <p className="text-error">Error loading monsters: {error}</p>}

        <div className="space-y-4">
          {characters.map((character, index) => (
            <CharacterCard
              key={character._id}
              character={character}
              index={index}
              selectedMonsterName={selectedMonsterNames[index] || ''}
              isLoading={isLoading}
              monsterOptions={monsterOptions}
              collapseRef={(el) => {
                collapseRefs.current[index] = el;
              }}
              error={error}
              monsters={monsters}
              onMonsterSelectChange={handleMonsterSelectChange}
              onCharacterFieldChange={handleCharacterFieldChange}
              onAbilityScoreChange={handleAbilityScoreChange}
              onRemove={removeCharacter}
              onDuplicate={duplicateCharacter}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewCharactersSection;
