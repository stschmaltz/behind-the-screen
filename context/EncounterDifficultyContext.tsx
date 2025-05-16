import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { useActiveCampaign } from './ActiveCampaignContext';
import { getAllPlayers } from '../hooks/get-all-players.hook';

interface EncounterDifficultyContextType {
  campaignId: string | undefined;
  useCampaignPlayers: boolean;
  setUseCampaignPlayers: Dispatch<SetStateAction<boolean>>;
  hasCampaignPlayers: boolean;
  playersLoading: boolean;
  campaignPlayers: any[];
  campaignPlayerLevels: number[];
  hasVaryingLevels: boolean;
  setPlayerCount: Dispatch<SetStateAction<number>>;
  setUseCustomLevels: Dispatch<SetStateAction<boolean>>;
  setUniformLevel: Dispatch<SetStateAction<number>>;
  playerCount: number;
  useCustomLevels: boolean;
  uniformLevel: number;
  customLevels: number[];
  handleLevelChange: (index: number, level: number) => void;
  resetToDefaultLevels: () => void;
}

const EncounterDifficultyContext = createContext<
  EncounterDifficultyContextType | undefined
>(undefined);

export function EncounterDifficultyProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { activeCampaignId: campaignId } = useActiveCampaign();
  const [useCampaignPlayers, setUseCampaignPlayers] = useState<boolean>(true);
  const [useCustomLevels, setUseCustomLevels] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [uniformLevel, setUniformLevel] = useState<number>(1);
  const [customLevels, setCustomLevels] = useState<number[]>([]);
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

  const handleLevelChange = (index: number, level: number) => {
    const newLevels = [...customLevels];
    newLevels[index] = level;
    setCustomLevels(newLevels);
  };

  const resetToDefaultLevels = () => {
    if (hasCampaignPlayers && useCampaignPlayers) {
      setCustomLevels(campaignPlayerLevels);
    } else {
      setCustomLevels(Array(playerCount).fill(uniformLevel));
    }
  };

  return (
    <EncounterDifficultyContext.Provider
      value={{
        campaignId: campaignId ?? undefined,
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
        playerCount,
        useCustomLevels,
        uniformLevel,
        customLevels,
        handleLevelChange,
        resetToDefaultLevels,
      }}
    >
      {children}
    </EncounterDifficultyContext.Provider>
  );
}

export function useEncounterDifficultyContext() {
  const ctx = useContext(EncounterDifficultyContext);
  if (!ctx)
    throw new Error(
      'useEncounterDifficultyContext must be used within EncounterDifficultyProvider',
    );
  return ctx;
}
