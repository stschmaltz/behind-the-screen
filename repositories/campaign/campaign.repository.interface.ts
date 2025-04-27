import { Campaign } from '../../types/campaigns';

export interface CampaignRepositoryInterface {
  saveCampaign(
    input: Partial<Campaign> & { userId: string },
  ): Promise<Campaign>;
  getCampaignById(input: {
    id: string;
    userId: string;
  }): Promise<Campaign | null>;
  deleteCampaign(input: { id: string; userId: string }): Promise<boolean>;
  getAllCampaigns(input: { userId: string }): Promise<Campaign[]>;
}
