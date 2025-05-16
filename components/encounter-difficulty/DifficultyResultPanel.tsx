import React from 'react';
import {
  capitalizeFirstLetter,
  DifficultyResult,
  getDifficultyClass,
} from './DifficultyCalculatorCore';

interface DifficultyResultPanelProps {
  difficultyResult: DifficultyResult | null;
}

export function DifficultyResultPanel({
  difficultyResult,
}: DifficultyResultPanelProps) {
  if (!difficultyResult) return null;

  return (
    <div className="bg-base-300 p-3 rounded-md">
      <div className="mb-2">
        <span className="font-semibold">Difficulty: </span>
        <span className={getDifficultyClass(difficultyResult.difficulty)}>
          {capitalizeFirstLetter(difficultyResult.difficulty)}
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
            Medium: {difficultyResult.thresholds.medium.toLocaleString()} XP
          </div>
          <div className="text-warning">
            Hard: {difficultyResult.thresholds.hard.toLocaleString()} XP
          </div>
          <div className="text-error">
            Deadly: {difficultyResult.thresholds.deadly.toLocaleString()} XP
          </div>
        </div>
      </div>
    </div>
  );
}
