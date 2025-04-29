import React, { useEffect, useState } from 'react';
import {
  capitalizeFirstLetter,
  DifficultyResult,
  getDifficultyClass,
  getDifficultyTooltip,
} from './DifficultyCalculatorCore';
import {
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../types/encounters';
import { getEncounterDifficulty } from '../lib/encounterUtils';
import { Player } from '../types/player';

interface CondensedDifficultyCalculatorProps {
  enemies: EncounterCharacter[];
  encounterPlayers?: InitiativeOrderCharacter[];
  players?: Player[];
  className?: string;
}

const CondensedDifficultyCalculator: React.FC<
  CondensedDifficultyCalculatorProps
> = ({ enemies, encounterPlayers = [], players = [], className = '' }) => {
  const [difficultyResult, setDifficultyResult] =
    useState<DifficultyResult | null>(null);

  const getPlayerLevels = (): number[] => {
    // First check for player entries in the initiative order
    if (
      encounterPlayers.length > 0 &&
      encounterPlayers.some((p) => p.type === 'player')
    ) {
      const playerData: { id: string; level: number }[] = [];

      // For each player in initiative order
      for (const player of encounterPlayers.filter(
        (p) => p.type === 'player',
      )) {
        // Try to find matching player in the players array to get current level
        const fullPlayer = players.find((p) => p._id === player._id);

        if (fullPlayer && fullPlayer.level) {
          // Use the level from the player data (most up-to-date)
          playerData.push({
            id: player._id,
            level: fullPlayer.level,
          });
        } else {
          // Default to level 1 if no player data is available
          playerData.push({
            id: player._id,
            level: 1,
          });
        }
      }

      // Return just the levels
      return playerData.map((p) => p.level);
    }

    // If we have players array but no encounter players, use those players
    if (players.length > 0) {
      return players.map((player) => player.level || 1);
    }

    // Default case if no player data is available - standard 4 level 1 players
    return [1, 1, 1, 1];
  };

  const playerLevels = getPlayerLevels();

  useEffect(() => {
    const result = getEncounterDifficulty(enemies, playerLevels);
    setDifficultyResult(result);
  }, [enemies, playerLevels]);

  if (!difficultyResult) return null;

  const xpBudget = `${difficultyResult.adjustedXp.toLocaleString()} XP`;
  const thresholds = difficultyResult.thresholds;
  const tooltipText = getDifficultyTooltip(
    difficultyResult.difficulty,
    difficultyResult.adjustedXp,
    difficultyResult.thresholds,
  );

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2 font-medium">
        <span>Difficulty:</span>
        <div
          className="tooltip tooltip-right"
          data-tip={tooltipText}
          data-tip-class="max-w-md whitespace-pre-line p-2"
        >
          <span
            className={`${getDifficultyClass(difficultyResult.difficulty)} cursor-help`}
          >
            {capitalizeFirstLetter(difficultyResult.difficulty)}
          </span>
        </div>
        <span className="text-xs">({xpBudget})</span>
      </div>
      <div className="flex items-center gap-2 text-xs opacity-70">
        <span>Players: {playerLevels.length}</span>
        <span>•</span>
        <span>
          Avg Level:{' '}
          {Math.round(
            playerLevels.reduce((a, b) => a + b, 0) / playerLevels.length,
          )}
        </span>
      </div>
      <div className="text-xs grid grid-cols-4 gap-1 mt-1">
        <div>
          <span className="text-success font-medium">E:</span>{' '}
          {thresholds.easy.toLocaleString()}
        </div>
        <div>
          <span className="text-warning font-medium">M:</span>{' '}
          {thresholds.medium.toLocaleString()}
        </div>
        <div>
          <span className="text-error font-medium">H:</span>{' '}
          {thresholds.hard.toLocaleString()}
        </div>
        <div>
          <span className="text-error font-bold">D:</span>{' '}
          {thresholds.deadly.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CondensedDifficultyCalculator;
