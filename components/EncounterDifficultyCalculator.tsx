import React, { useEffect, useState } from 'react';
import { EncounterCharacter } from '../types/encounters';
import { getEncounterDifficulty } from '../lib/encounterUtils';

interface EncounterDifficultyProps {
  enemies: EncounterCharacter[];
}

const EncounterDifficultyCalculator: React.FC<EncounterDifficultyProps> = ({
  enemies,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [difficultyResult, setDifficultyResult] = useState<{
    difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
    adjustedXp: number;
    thresholds: {
      easy: number;
      medium: number;
      hard: number;
      deadly: number;
    };
  } | null>(null);

  // Calculate difficulty whenever enemies, player count, or level changes
  useEffect(() => {
    if (enemies.length > 0) {
      // Create an array of player levels (all the same level for now)
      const partyLevels = Array(playerCount).fill(playerLevel);

      // Calculate encounter difficulty
      const result = getEncounterDifficulty(enemies, partyLevels);
      setDifficultyResult(result);
    } else {
      setDifficultyResult(null);
    }
  }, [enemies, playerCount, playerLevel]);

  // Get class for difficulty color
  const getDifficultyClass = (difficulty: string): string => {
    switch (difficulty) {
      case 'trivial':
        return 'text-info';
      case 'easy':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'hard':
        return 'text-error';
      case 'deadly':
        return 'text-error font-bold';
      default:
        return '';
    }
  };

  if (enemies.length === 0) {
    return null;
  }

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-lg font-medium flex items-center peer-checked:bg-base-200 peer-checked:text-base-content">
        <span>Encounter Difficulty</span>
        {difficultyResult && (
          <span
            className={`ml-2 ${getDifficultyClass(difficultyResult.difficulty)}`}
          >
            (
            {difficultyResult.difficulty.charAt(0).toUpperCase() +
              difficultyResult.difficulty.slice(1)}
            )
          </span>
        )}
      </div>
      <div className="collapse-content peer-checked:bg-base-100 peer-checked:text-base-content">
        <div className="p-2">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Number of Players</span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Player Level</span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={playerLevel}
                onChange={(e) => setPlayerLevel(Number(e.target.value))}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {difficultyResult && (
            <div className="bg-base-300 p-3 rounded-md">
              <div className="mb-2">
                <span className="font-semibold">Difficulty: </span>
                <span
                  className={getDifficultyClass(difficultyResult.difficulty)}
                >
                  {difficultyResult.difficulty.charAt(0).toUpperCase() +
                    difficultyResult.difficulty.slice(1)}
                </span>
              </div>

              <div className="mb-2">
                <span className="font-semibold">Adjusted XP: </span>
                {difficultyResult.adjustedXp.toLocaleString()} XP
              </div>

              <div className="text-sm">
                <p className="font-semibold mb-1">Party Thresholds:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-info">
                    Easy: {difficultyResult.thresholds.easy.toLocaleString()} XP
                  </div>
                  <div className="text-success">
                    Medium:{' '}
                    {difficultyResult.thresholds.medium.toLocaleString()} XP
                  </div>
                  <div className="text-warning">
                    Hard: {difficultyResult.thresholds.hard.toLocaleString()} XP
                  </div>
                  <div className="text-error">
                    Deadly:{' '}
                    {difficultyResult.thresholds.deadly.toLocaleString()} XP
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncounterDifficultyCalculator;
