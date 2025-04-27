import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import NewEnemiesSection from './NewEnemiesSection';
import { useNewEncounter } from '../../../hooks/encounter/use-new-encounter';
import { NewEncounterTemplate } from '../../../types/encounters';
import { FormInput } from '../../../components/FormInput';
import { Button } from '../../../components/Button';
import { showDaisyToast } from '../../../lib/daisy-toast';
import { useManageEncounter } from '../../../hooks/encounter/use-manage-encounter';
import { useUserPreferences } from '../../../hooks/user-preferences/use-user-preferences';
import { getAllCampaigns } from '../../../hooks/campaign/get-all-campaigns';
import CampaignSelector from '../../../components/selectors/CampaignSelector';
import AdventureSelector from '../../../components/selectors/AdventureSelector';

export const INITIAL_NEW_ENCOUNTER: NewEncounterTemplate = {
  name: '',
  description: '',
  notes: [],
  enemies: [],
  status: 'inactive',
  userId: '',
  campaignId: '',
};

const NewEncounterPage: NextPage = () => {
  const router = useRouter();
  const { handleSave, isSaving } = useManageEncounter();
  const { newEncounter, setNewEncounter, handleFieldChange } =
    useNewEncounter();
  const { activeCampaignId, setActiveCampaign } = useUserPreferences();
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();

  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const [adventureId, setAdventureId] = useState<string | undefined>(undefined);

  // Load query parameters
  useEffect(() => {
    const queryCampaignId = router.query.campaignId as string | undefined;
    const queryAdventureId = router.query.adventureId as string | undefined;

    if (queryCampaignId) {
      setCampaignId(queryCampaignId);
    } else if (activeCampaignId) {
      setCampaignId(activeCampaignId);
    }

    if (queryAdventureId) {
      setAdventureId(queryAdventureId);
    }
  }, [router.query, activeCampaignId]);

  const hasCampaigns = !campaignsLoading && campaigns && campaigns.length > 0;

  const onSave = useCallback(async () => {
    if (!campaignId) {
      showDaisyToast('error', 'Please select a campaign');

      return;
    }

    const encounterInput: NewEncounterTemplate = {
      name: newEncounter.name,
      description: newEncounter.description,
      notes: newEncounter.notes || [],
      enemies: newEncounter.enemies,
      status: newEncounter.status,
      campaignId,
      adventureId,
      userId: '',
    };

    const success = await handleSave(encounterInput);
    if (success) {
      // Update the active campaign ID in user preferences to ensure it's selected on the index page
      if (campaignId !== activeCampaignId) {
        await setActiveCampaign(campaignId);
      }

      showDaisyToast('success', 'Encounter saved');

      // Add campaign ID to query params to ensure it's selected when redirected
      router.push({
        pathname: '/encounters',
        query: { selectedCampaign: campaignId },
      });
    } else {
      showDaisyToast('error', 'Failed to save encounter');
    }
  }, [
    newEncounter,
    campaignId,
    adventureId,
    handleSave,
    router,
    activeCampaignId,
    setActiveCampaign,
  ]);

  // Memoize state setters
  const handleCampaignChange = useCallback((id: string | undefined) => {
    setCampaignId(id);
    setAdventureId(undefined); // Reset adventure when campaign changes
  }, []);

  const handleAdventureChange = useCallback((id: string | undefined) => {
    setAdventureId(id);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">New Encounter</h1>

      <form className="w-full max-w-xl bg-base-300 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-h-[70vh] overflow-y-auto">
        {!hasCampaigns && !campaignsLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center mb-4">
              You need to create a campaign before you can create encounters.
            </p>
            <Link href="/campaigns/new">
              <button className="btn btn-primary">Create New Campaign</button>
            </Link>
          </div>
        ) : (
          <>
            <FormInput
              id="name"
              label="Name"
              value={newEncounter.name}
              onChange={handleFieldChange('name')}
            />
            <FormInput
              id="description"
              label="Description"
              value={newEncounter.description}
              onChange={handleFieldChange('description')}
            />

            {/* Campaign & Adventure Selection using shared components */}
            <div className="mb-6 grid grid-cols-1 gap-4">
              <CampaignSelector
                selectedCampaignId={campaignId}
                onCampaignChange={handleCampaignChange}
              />
              <AdventureSelector
                campaignId={campaignId}
                selectedAdventureId={adventureId}
                onAdventureChange={handleAdventureChange}
              />
            </div>

            <NewEnemiesSection
              enemies={newEncounter.enemies}
              onEnemiesChange={(updatedEnemies) =>
                setNewEncounter((prev) => ({
                  ...prev,
                  enemies: updatedEnemies,
                }))
              }
            />

            <div className="mt-10">
              <Button
                className="w-full"
                onClick={onSave}
                disabled={isSaving || !campaignId}
                label="Save"
              />
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default NewEncounterPage;
