import React, { useEffect, useMemo, useState } from 'react';
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
import { getAllPlayers } from '../hooks/get-all-players.hook';
import { Player } from '../types/player';
import { useActiveCampaign } from '../context/ActiveCampaignContext';

interface EncounterDifficultyProps {
  enemies: EncounterCharacter[];
  initiativeOrder?: InitiativeOrderCharacter[];
  players?: Player[];
}

const EncounterDifficultyCalculator: React.FC<EncounterDifficultyProps> = ({
  enemies,
  initiativeOrder = [],
  players = [],
}) => {
  const { activeCampaignId: campaignId } = useActiveCampaign();
  const [useCampaignPlayers, setUseCampaignPlayers] = useState<boolean>(true);
  const [useCustomLevels, setUseCustomLevels] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [uniformLevel, setUniformLevel] = useState<number>(1);
  const [customLevels, setCustomLevels] = useState<number[]>([]);
  const [difficultyResult, setDifficultyResult] =
    useState<DifficultyResult | null>(null);

  const { players: allPlayers, loading: playersLoading } = getAllPlayers();

  const encounterPlayers = useMemo(() => {
    if (initiativeOrder && initiativeOrder.length > 0) {
      return initiativeOrder.filter((char) => char.type === 'player');
    }

    return [];
  }, [initiativeOrder]);

  const encounterPlayerLevels = useMemo(() => {
    if (encounterPlayers.length > 0) {
      const playerLevels: number[] = [];

      for (const player of encounterPlayers) {
        const fullPlayer = players.find((p) => p._id === player._id);

        if (fullPlayer && fullPlayer.level) {
          playerLevels.push(fullPlayer.level);
        } else {
          playerLevels.push(1);
        }
      }

      return playerLevels;
    }

    return [];
  }, [encounterPlayers, players]);

  const campaignPlayers = useMemo(() => {
    if (!campaignId) return [];

    return allPlayers.filter((player) => player.campaignId === campaignId);
  }, [campaignId, allPlayers]);

  const hasCampaignPlayers = campaignPlayers.length > 0;

  const campaignPlayerLevels = useMemo(() => {
    return campaignPlayers.map((player) => player.level || 1);
  }, [campaignPlayers]);

  const hasVaryingLevels = useMemo(() => {
    if (campaignPlayerLevels.length <= 1) return false;
    const firstLevel = campaignPlayerLevels[0];

    return campaignPlayerLevels.some((level) => level !== firstLevel);
  }, [campaignPlayerLevels]);

  useEffect(() => {
    if (encounterPlayerLevels.length > 0) {
      setCustomLevels(encounterPlayerLevels);
      setPlayerCount(encounterPlayerLevels.length);
      setUseCustomLevels(
        encounterPlayerLevels.some(
          (level) => level !== encounterPlayerLevels[0],
        ),
      );
    } else if (hasCampaignPlayers && useCampaignPlayers) {
      setCustomLevels(campaignPlayerLevels);
      setPlayerCount(campaignPlayerLevels.length);
      setUseCustomLevels(false);
      if (!hasVaryingLevels && campaignPlayerLevels[0]) {
        setUniformLevel(campaignPlayerLevels[0]);
      }
    }
  }, [
    encounterPlayerLevels,
    campaignPlayerLevels,
    hasCampaignPlayers,
    useCampaignPlayers,
    hasVaryingLevels,
  ]);

  const defaultCustomLevels = useMemo(() => {
    return Array(playerCount).fill(uniformLevel);
  }, [playerCount, uniformLevel]);

  const allPlayerLevels = useMemo(() => {
    return useCustomLevels
      ? customLevels
      : Array(playerCount).fill(uniformLevel);
  }, [useCustomLevels, customLevels, playerCount, uniformLevel]);

  useEffect(() => {
    if (customLevels.length !== playerCount) {
      if (playerCount > customLevels.length) {
        setCustomLevels([
          ...customLevels,
          ...Array(playerCount - customLevels.length).fill(uniformLevel),
        ]);
      } else {
        setCustomLevels(customLevels.slice(0, playerCount));
      }
    }
  }, [playerCount, customLevels, uniformLevel]);

  useEffect(() => {
    const result = getEncounterDifficulty(enemies, allPlayerLevels);
    setDifficultyResult(result);
  }, [enemies, allPlayerLevels]);

  const handleLevelChange = (index: number, level: number) => {
    const newLevels = [...customLevels];
    newLevels[index] = level;
    setCustomLevels(newLevels);
  };

  const resetToDefaultLevels = () => {
    if (encounterPlayerLevels.length > 0) {
      setCustomLevels(encounterPlayerLevels);
    } else if (useCampaignPlayers && hasCampaignPlayers) {
      setCustomLevels(campaignPlayerLevels);
    } else {
      setCustomLevels(defaultCustomLevels);
    }
  };

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-lg font-medium flex items-center peer-checked:bg-base-200 peer-checked:text-base-content">
        <span>Encounter Difficulty</span>
        {difficultyResult && (
          <div
            className="tooltip tooltip-right ml-2"
            data-tip={getDifficultyTooltip(
              difficultyResult.difficulty,
              difficultyResult.adjustedXp,
              difficultyResult.thresholds,
            )}
            data-tip-class="max-w-md whitespace-pre-line p-2"
          >
            <span
              className={`${getDifficultyClass(difficultyResult.difficulty)} cursor-help`}
            >
              ({capitalizeFirstLetter(difficultyResult.difficulty)})
            </span>
          </div>
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
                  onChange={(e) => {
                    setUseCampaignPlayers(e.target.checked);
                    if (e.target.checked && hasCampaignPlayers) {
                      setPlayerCount(campaignPlayers.length);
                      if (hasVaryingLevels) {
                        setUseCustomLevels(true);
                        setCustomLevels(campaignPlayerLevels);
                      } else if (campaignPlayerLevels[0]) {
                        setUniformLevel(campaignPlayerLevels[0]);
                      }
                    }
                  }}
                  disabled={!hasCampaignPlayers}
                />
                <span className="label-text">Use campaign players</span>
              </label>

              {useCampaignPlayers && !hasCampaignPlayers && playersLoading && (
                <div className="text-sm text-info mt-1">
                  Loading campaign players...
                </div>
              )}

              {useCampaignPlayers && !hasCampaignPlayers && !playersLoading && (
                <div className="text-sm text-warning mt-1">
                  No players found for this campaign
                </div>
              )}

              {useCampaignPlayers && hasCampaignPlayers && (
                <div className="text-sm text-success mt-1">
                  Using {campaignPlayers.length} players from this campaign
                  (levels: {campaignPlayerLevels.join(', ')})
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
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
                  onChange={(e) => {
                    const level = Number(e.target.value);
                    setUniformLevel(level);
                    if (!useCustomLevels) {
                      setCustomLevels(Array(playerCount).fill(level));
                    }
                  }}
                  disabled={
                    (useCampaignPlayers && hasCampaignPlayers) ||
                    useCustomLevels
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

            <div className="mb-2 flex items-center justify-between">
              {(!useCampaignPlayers || !hasCampaignPlayers) && (
                <label className="label cursor-pointer inline-flex items-center">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mr-2"
                    checked={useCustomLevels}
                    onChange={(e) => {
                      setUseCustomLevels(e.target.checked);
                      if (e.target.checked) {
                        resetToDefaultLevels();
                      }
                    }}
                    disabled={
                      useCampaignPlayers &&
                      hasCampaignPlayers &&
                      hasVaryingLevels
                    }
                  />
                  <span className="label-text">Use custom player levels</span>
                </label>
              )}
            </div>

            {useCustomLevels && !useCampaignPlayers && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="label-text">Individual Player Levels</label>
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={resetToDefaultLevels}
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {customLevels.map((level, index) => {
                    const player =
                      useCampaignPlayers && hasCampaignPlayers
                        ? campaignPlayers[index]
                        : null;

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
                            handleLevelChange(index, Number(e.target.value))
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

          {useCampaignPlayers && hasCampaignPlayers && hasVaryingLevels && (
            <div className="text-sm text-info mt-1">
              Campaign players have different levels, using individual levels by
              default
            </div>
          )}

          {difficultyResult && (
            <div className="bg-base-300 p-3 rounded-md">
              <div className="mb-2">
                <span className="font-semibold">Difficulty: </span>
                <span
                  className={getDifficultyClass(difficultyResult.difficulty)}
                >
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
