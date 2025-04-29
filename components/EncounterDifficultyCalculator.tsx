import React, { useEffect, useMemo, useState } from 'react';
import { EncounterCharacter } from '../types/encounters';
import { getEncounterDifficulty } from '../lib/encounterUtils';
import { getAllPlayers } from '../hooks/get-all-players.hook';
import { logger } from '../lib/logger';

interface EncounterDifficultyProps {
  enemies: EncounterCharacter[];
  campaignId?: string;
}

const EncounterDifficultyCalculator: React.FC<EncounterDifficultyProps> = ({
  enemies,
  campaignId,
}) => {
  const [useCampaignPlayers, setUseCampaignPlayers] =
    useState<boolean>(!!campaignId);
  const { players, loading: playersLoading } = getAllPlayers();

  const campaignPlayers = useMemo(() => {
    if (!campaignId) return [];
    const filtered = players.filter(
      (player) => player.campaignId === campaignId,
    );
    logger.info('Filtered campaign players:', {
      campaignId,
      filteredCount: filtered.length,
      totalPlayers: players.length,
    });

    return filtered;
  }, [campaignId, players]);

  const campaignHasVaryingLevels = useMemo(() => {
    if (campaignPlayers.length <= 1) return false;
    const firstLevel = campaignPlayers[0]?.level || 1;

    return campaignPlayers.some((player) => (player.level || 1) !== firstLevel);
  }, [campaignPlayers]);

  const initialPlayerCount = useMemo(() => {
    return campaignId && useCampaignPlayers && campaignPlayers.length > 0
      ? campaignPlayers.length
      : 4;
  }, [campaignId, useCampaignPlayers, campaignPlayers]);

  const initialPlayerLevel = useMemo(() => {
    if (
      campaignId &&
      useCampaignPlayers &&
      campaignPlayers.length > 0 &&
      !campaignHasVaryingLevels
    ) {
      return campaignPlayers[0]?.level || 1;
    }

    return 1;
  }, [
    campaignId,
    useCampaignPlayers,
    campaignPlayers,
    campaignHasVaryingLevels,
  ]);

  const initialPlayerLevels = useMemo(() => {
    if (campaignId && useCampaignPlayers && campaignPlayers.length > 0) {
      return campaignPlayers.map((player) => player.level || 1);
    }

    return Array(initialPlayerCount).fill(initialPlayerLevel);
  }, [
    campaignId,
    useCampaignPlayers,
    campaignPlayers,
    initialPlayerCount,
    initialPlayerLevel,
  ]);

  const [playerCount, setPlayerCount] = useState<number>(initialPlayerCount);
  const [playerLevel, setPlayerLevel] = useState<number>(initialPlayerLevel);
  const [playerLevels, setPlayerLevels] =
    useState<number[]>(initialPlayerLevels);
  const [useUniformLevels, setUseUniformLevels] = useState<boolean>(
    !campaignHasVaryingLevels,
  );

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

  useEffect(() => {
    if (campaignId && useCampaignPlayers && campaignPlayers.length > 0) {
      logger.info('Force updating from campaign players', {
        campaignId,
        playerCount: campaignPlayers.length,
        levels: campaignPlayers.map((p) => p.level || 1),
      });
      setPlayerCount(campaignPlayers.length);
      const levels = campaignPlayers.map((player) => player.level || 1);
      setPlayerLevels(levels);
      if (!campaignHasVaryingLevels) {
        setPlayerLevel(levels[0]);
      }
      setUseUniformLevels(!campaignHasVaryingLevels);
    }
  }, [
    campaignId,
    useCampaignPlayers,
    campaignPlayers,
    campaignHasVaryingLevels,
  ]);

  useEffect(() => {
    if (useUniformLevels) {
      setPlayerLevels(Array(playerCount).fill(playerLevel));
    } else if (
      playerLevels.length !== playerCount &&
      (!useCampaignPlayers || !campaignPlayers.length)
    ) {
      if (playerCount > playerLevels.length) {
        setPlayerLevels([
          ...playerLevels,
          ...Array(playerCount - playerLevels.length).fill(1),
        ]);
      } else {
        setPlayerLevels(playerLevels.slice(0, playerCount));
      }
    }
  }, [
    playerCount,
    playerLevel,
    useUniformLevels,
    useCampaignPlayers,
    campaignPlayers.length,
  ]);

  useEffect(() => {
    const result = getEncounterDifficulty(enemies, playerLevels);
    setDifficultyResult(result);
  }, [enemies, playerLevels]);

  const handlePlayerLevelChange = (index: number, level: number) => {
    const newLevels = [...playerLevels];
    newLevels[index] = level;
    setPlayerLevels(newLevels);
  };

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
          {campaignId && (
            <div className="mb-4">
              <label className="label cursor-pointer inline-flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-2"
                  checked={useCampaignPlayers}
                  onChange={(e) => setUseCampaignPlayers(e.target.checked)}
                />
                <span className="label-text">Use campaign players</span>
              </label>
              {useCampaignPlayers &&
                campaignPlayers.length === 0 &&
                !playersLoading && (
                  <div className="text-sm text-warning mt-1">
                    No players found for this campaign
                  </div>
                )}
              {playersLoading && (
                <div className="text-sm text-info mt-1">
                  Loading campaign players...
                </div>
              )}
              {useCampaignPlayers && campaignPlayers.length > 0 && (
                <div className="text-sm text-success mt-1">
                  Using {campaignPlayers.length} players from this campaign
                  (levels: {campaignPlayers.map((p) => p.level || 1).join(', ')}
                  )
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              {(!useCampaignPlayers || !campaignId) && (
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
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Player Level</span>
                </label>
                <select
                  className="select select-bordered w-full max-w-xs"
                  value={playerLevel}
                  onChange={(e) => setPlayerLevel(Number(e.target.value))}
                  disabled={!useUniformLevels}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-2">
              <label className="label cursor-pointer inline-flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-2"
                  checked={useUniformLevels}
                  onChange={(e) => setUseUniformLevels(e.target.checked)}
                  disabled={useCampaignPlayers && campaignHasVaryingLevels}
                />
                <span className="label-text">Same level for all players</span>
                {useCampaignPlayers &&
                  campaignHasVaryingLevels &&
                  useUniformLevels && (
                    <span className="text-sm text-warning ml-2">
                      Campaign players have different levels
                    </span>
                  )}
              </label>
            </div>

            {!useUniformLevels && (
              <div className="mt-4">
                <label className="label">
                  <span className="label-text">Individual Player Levels</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {playerLevels.map((level, index) => {
                    const player = useCampaignPlayers && campaignPlayers[index];

                    return (
                      <div key={index} className="flex items-center gap-2">
                        <span
                          className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                          style={{ maxWidth: '120px' }}
                        >
                          {player ? player.name : `Player ${index + 1}`}:
                        </span>
                        <select
                          className="select select-bordered select-sm w-20"
                          value={level}
                          onChange={(e) =>
                            handlePlayerLevelChange(
                              index,
                              Number(e.target.value),
                            )
                          }
                        >
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(
                            (lvl) => (
                              <option key={lvl} value={lvl}>
                                {lvl}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
