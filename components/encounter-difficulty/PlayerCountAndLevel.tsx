import React from 'react';

export interface PlayerCountAndLevelProps {
  playerCount: number;
  setPlayerCount: (v: number) => void;
  uniformLevel: number;
  setUniformLevel: (v: number) => void;
  useCampaignPlayers: boolean;
  hasCampaignPlayers: boolean;
  useCustomLevels: boolean;
}

export function PlayerCountAndLevel({
  playerCount,
  setPlayerCount,
  uniformLevel,
  setUniformLevel,
  useCampaignPlayers,
  hasCampaignPlayers,
  useCustomLevels,
}: PlayerCountAndLevelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Number of Players</span>
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
          disabled={useCampaignPlayers && hasCampaignPlayers}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Level</span>
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          value={uniformLevel}
          onChange={(e) => setUniformLevel(Number(e.target.value))}
          disabled={
            (useCampaignPlayers && hasCampaignPlayers) || useCustomLevels
          }
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
