import React from 'react';
import type { Player } from '../../generated/graphql';

interface CampaignPlayerToggleProps {
  campaignId: string | undefined;
  useCampaignPlayers: boolean;
  setUseCampaignPlayers: (v: boolean) => void;
  hasCampaignPlayers: boolean;
  playersLoading: boolean;
  campaignPlayers: Player[];
  campaignPlayerLevels: number[];
  hasVaryingLevels: boolean;
  setPlayerCount: (v: number) => void;
  setUseCustomLevels: (v: boolean) => void;
  setUniformLevel: (v: number) => void;
}

export function CampaignPlayerToggle({
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
}: CampaignPlayerToggleProps) {
  if (!campaignId) return null;

  return (
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
          Using {campaignPlayers.length} players from this campaign (levels:{' '}
          {campaignPlayerLevels.join(', ')})
        </div>
      )}
    </div>
  );
}
