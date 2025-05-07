import React from 'react';
import { capitalizeFirstLetter } from './DifficultyCalculatorCore';
import { EncounterCharacter } from '../types/encounters';
import { getEncounterDifficulty } from '../lib/encounterUtils';

interface EncounterDifficultyBadgeProps {
  enemies: EncounterCharacter[];
  playerLevels: number[];
  className?: string;
}

const EncounterDifficultyBadge: React.FC<EncounterDifficultyBadgeProps> = ({
  enemies,
  playerLevels,
  className = '',
}) => {
  if (
    !enemies ||
    enemies.length === 0 ||
    !playerLevels ||
    playerLevels.length === 0
  ) {
    return null;
  }

  const difficultyResult = getEncounterDifficulty(enemies, playerLevels);

  const badgeClass =
    `badge badge-outline ${className} ` +
    (difficultyResult.difficulty === 'deadly'
      ? 'badge-error'
      : difficultyResult.difficulty === 'hard'
        ? 'badge-warning'
        : difficultyResult.difficulty === 'medium'
          ? 'badge-success'
          : 'badge-info');

  return (
    <span className={`${badgeClass} cursor-help text-center`}>
      {capitalizeFirstLetter(difficultyResult.difficulty)}
    </span>
  );
};

export default EncounterDifficultyBadge;
