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
import { useUnsavedChangesWarning } from '../../../hooks/use-unsaved-changes-warning';

type EncounterInputData = Omit<NewEncounterTemplate, 'userId' | '_id'> & {
  adventureId?: string;
  campaignId: string;
};

export const INITIAL_NEW_ENCOUNTER: NewEncounterTemplate = {
  name: '',
  description: '',
  notes: [],
  enemies: [],
  status: 'inactive',
  campaignId: '',
};

const NewEncounterPage: NextPage = () => {
  const router = useRouter();
  const { handleSave, isSaving } = useManageEncounter();
  const {
    newEncounter,
    setNewEncounter,
    handleFieldChange: originalHandleFieldChange,
  } = useNewEncounter();
  const { activeCampaignId, setActiveCampaign } = useUserPreferences();
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();

  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const [adventureId, setAdventureId] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useUnsavedChangesWarning(hasUnsavedChanges);

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

  const handleFieldChange = useCallback(
    (field: keyof NewEncounterTemplate) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        originalHandleFieldChange(field)(event);
        setHasUnsavedChanges(true);
      },
    [originalHandleFieldChange],
  );

  const onSave = useCallback(async () => {
    if (!campaignId) {
      showDaisyToast('error', 'Please select a campaign');

      return;
    }

    const encounterInput: EncounterInputData = {
      name: newEncounter.name,
      description: newEncounter.description,
      notes: newEncounter.notes || [],
      enemies: newEncounter.enemies,
      status: newEncounter.status,
      campaignId,
      adventureId,
    };

    const success = await handleSave(encounterInput);
    if (success) {
      setHasUnsavedChanges(false);
      if (campaignId !== activeCampaignId) {
        await setActiveCampaign(campaignId);
      }

      showDaisyToast('success', 'Encounter saved');

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

  const handleCampaignChange = useCallback((id: string | undefined) => {
    setCampaignId(id);
    setAdventureId(undefined);
    setHasUnsavedChanges(true);
  }, []);

  const handleAdventureChange = useCallback((id: string | undefined) => {
    setAdventureId(id);
    setHasUnsavedChanges(true);
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
              onEnemiesChange={(updatedEnemies) => {
                setNewEncounter((prev) => ({
                  ...prev,
                  enemies: updatedEnemies,
                }));
                setHasUnsavedChanges(true);
              }}
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
