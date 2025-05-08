import { useState, useMemo } from 'react';
import { useActiveCampaign } from '../../context/ActiveCampaignContext';
import { getAllPlayers } from '../get-all-players.hook';

export function useCampaignPlayerToggleState() {
  const { activeCampaignId: campaignId } = useActiveCampaign();
  const [useCampaignPlayers, setUseCampaignPlayers] = useState(true);
  const [useCustomLevels, setUseCustomLevels] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);
  const [uniformLevel, setUniformLevel] = useState(1);
  const { players: allPlayers, loading: playersLoading } = getAllPlayers();

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

  return {
    campaignId,
    useCampaignPlayers,
    setUseCampaignPlayers,
    hasCampaignPlayers,
    playersLoading,
    campaignPlayers,
    campaignPlayerLevels,
    hasVaryingLevels,
    setPlayerCount,
    setUseCustomLevels,
    setUniformLevel,
  };
}
