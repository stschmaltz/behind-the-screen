import { useEffect, useMemo, useState } from 'react';
import { DifficultyResult } from './DifficultyCalculatorCore';
import { getEncounterDifficulty } from '../../lib/encounterUtils';
import { getAllPlayers } from '../../hooks/get-all-players.hook';
import { useActiveCampaign } from '../../context/ActiveCampaignContext';
import {
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../types/encounters';
import type { Player } from '../../src/generated/graphql';

interface HookProps {
  enemies: EncounterCharacter[];
  initiativeOrder?: InitiativeOrderCharacter[];
  players?: Player[];
}

export function useEncounterDifficultyCalculatorState({
  enemies,
  initiativeOrder = [],
  players = [],
}: HookProps) {
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

  return {
    useCampaignPlayers,
    setUseCampaignPlayers,
    useCustomLevels,
    setUseCustomLevels,
    playerCount,
    setPlayerCount,
    uniformLevel,
    setUniformLevel,
    customLevels,
    setCustomLevels,
    difficultyResult,
    playersLoading,
    campaignId: campaignId ?? undefined,
    campaignPlayers,
    hasCampaignPlayers,
    campaignPlayerLevels,
    hasVaryingLevels,
    handleLevelChange,
    resetToDefaultLevels,
  };
}
