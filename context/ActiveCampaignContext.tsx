'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  FC,
  useEffect,
  useMemo,
} from 'react';
import { useUserPreferences } from '../hooks/user-preferences/use-user-preferences';
import { getAllCampaigns } from '../hooks/campaign/get-all-campaigns';
import { getAllPlayers } from '../hooks/get-all-players.hook';

interface ActiveCampaignContextType {
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
  campaigns: any[] | null;
  campaignsLoading: boolean;
  players: any[] | null;
  playersLoading: boolean;
}

const ActiveCampaignContext = createContext<
  ActiveCampaignContextType | undefined
>(undefined);

interface ActiveCampaignProviderProps {
  children: ReactNode;
}

export const ActiveCampaignProvider: FC<ActiveCampaignProviderProps> = ({
  children,
}) => {
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const { activeCampaignId: userPreferenceCampaignId } = useUserPreferences();

  // Fetch campaigns and players directly (not in useMemo)
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();
  const { players, loading: playersLoading } = getAllPlayers();

  // Initialize with user preferences
  useEffect(() => {
    if (userPreferenceCampaignId) {
      setActiveCampaignId(userPreferenceCampaignId);
    }
  }, [userPreferenceCampaignId]);

  const contextValue = useMemo(
    () => ({
      activeCampaignId,
      setActiveCampaignId,
      campaigns,
      campaignsLoading,
      players,
      playersLoading,
    }),
    [activeCampaignId, campaigns, campaignsLoading, players, playersLoading],
  );

  return (
    <ActiveCampaignContext.Provider value={contextValue}>
      {children}
    </ActiveCampaignContext.Provider>
  );
};

export const useActiveCampaign = (): ActiveCampaignContextType => {
  const context = useContext(ActiveCampaignContext);
  if (context === undefined) {
    throw new Error(
      'useActiveCampaign must be used within an ActiveCampaignProvider',
    );
  }
  return context;
};
