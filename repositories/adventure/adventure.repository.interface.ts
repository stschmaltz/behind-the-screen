import { Adventure } from '../../types/adventures';

export interface AdventureRepositoryInterface {
  saveAdventure(
    input: Partial<Adventure> & { userId: string; campaignId: string },
  ): Promise<Adventure>;
  getAdventureById(input: {
    id: string;
    userId: string;
  }): Promise<Adventure | null>;
  deleteAdventure(input: { id: string; userId: string }): Promise<boolean>;
  getAllAdventures(input: { userId: string }): Promise<Adventure[]>;
  getAdventuresByCampaign(input: {
    userId: string;
    campaignId: string;
  }): Promise<Adventure[]>;
}
