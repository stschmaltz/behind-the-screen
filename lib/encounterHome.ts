export const DEFAULT_CAMPAIGN_NAME = 'My Campaign';
export const DEFAULT_ADVENTURE_NAME = 'My Adventure';

export interface EncounterHomeRequest {
  campaignId?: string;
  adventureId?: string;
  hasCampaigns: boolean;
  campaignHasAdventures: boolean;
}

export interface EncounterHomeCreators {
  createCampaign: (name: string) => Promise<string | null>;
  createAdventure: (campaignId: string, name: string) => Promise<string | null>;
}

export type EncounterHome =
  | {
      ok: true;
      campaignId: string;
      adventureId: string;
      createdCampaign: boolean;
      createdAdventure: boolean;
    }
  | {
      ok: false;
      error: string;
      campaignId?: string;
      createdCampaign: boolean;
    };

export const needsDefaultAdventure = (
  request: Pick<EncounterHomeRequest, 'adventureId' | 'campaignHasAdventures'>,
): boolean => !request.adventureId && !request.campaignHasAdventures;

export const resolveEncounterHome = async (
  request: EncounterHomeRequest,
  creators: EncounterHomeCreators,
): Promise<EncounterHome> => {
  let campaignId = request.campaignId;
  let createdCampaign = false;

  if (!campaignId) {
    if (request.hasCampaigns) {
      return {
        ok: false,
        error: 'Please select a campaign',
        createdCampaign,
      };
    }
    campaignId = (await creators.createCampaign(DEFAULT_CAMPAIGN_NAME)) ?? '';
    if (!campaignId) {
      return {
        ok: false,
        error: 'Could not create a campaign for this encounter',
        createdCampaign,
      };
    }
    createdCampaign = true;
  }

  if (request.adventureId) {
    return {
      ok: true,
      campaignId,
      adventureId: request.adventureId,
      createdCampaign,
      createdAdventure: false,
    };
  }

  if (!createdCampaign && request.campaignHasAdventures) {
    return {
      ok: false,
      error: 'Please select an adventure',
      campaignId,
      createdCampaign,
    };
  }

  const adventureId = await creators.createAdventure(
    campaignId,
    DEFAULT_ADVENTURE_NAME,
  );
  if (!adventureId) {
    return {
      ok: false,
      error: 'Could not create an adventure for this encounter',
      campaignId,
      createdCampaign,
    };
  }

  return {
    ok: true,
    campaignId,
    adventureId,
    createdCampaign,
    createdAdventure: true,
  };
};
