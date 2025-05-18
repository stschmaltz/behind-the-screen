import React from 'react';
import PlayerManagementSection from '../../pages/encounters/PlayerManagementSection';
import { Player } from '../../src/generated/graphql';
import { TransformedCampaignData } from '../../hooks/campaign/get-campaign.hook';

const CampaignHeader = ({
  campaign,
  players,
  campaignId,
}: {
  campaign: TransformedCampaignData;
  players: Player[];
  campaignId: string;
}) => (
  <div className="bg-base-200 rounded-lg p-6 mb-8 shadow-sm">
    <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
    <div className="flex items-center gap-3 mb-2">
      <div
        className={`badge ${campaign.status === 'active' ? 'badge-outline badge-success' : 'badge-ghost'}`}
      >
        {campaign.status === 'active' ? 'Active' : 'Completed'}
      </div>
    </div>
    <div className="mt-4">
      {campaignId && (
        <PlayerManagementSection
          startingPlayers={players ?? []}
          campaignId={campaignId}
          buttonClassName="btn-sm"
        />
      )}
    </div>
  </div>
);

export default CampaignHeader;
