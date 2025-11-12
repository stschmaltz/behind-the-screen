import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import posthog from 'posthog-js';
import NewEnemiesSection from './NewEnemiesSection';
import { useNewEncounter } from '../../../hooks/encounter/use-new-encounter';
import { NewEncounterTemplate } from '../../../types/encounters';
import { FormInput } from '../../../components/ui/FormInput';
import { Button } from '../../../components/ui/Button';
import { showDaisyToast } from '../../../lib/daisy-toast';
import { useManageEncounter } from '../../../hooks/encounter/use-manage-encounter';
import { useUserPreferences } from '../../../hooks/user-preferences/use-user-preferences';
import { useActiveCampaign } from '../../../context/ActiveCampaignContext';
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
  const { setActiveCampaign } = useUserPreferences();
  const { activeCampaignId: contextCampaignId } = useActiveCampaign();
  const activeCampaignId = contextCampaignId || undefined;
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();

  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const [adventureId, setAdventureId] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useUnsavedChangesWarning(hasUnsavedChanges);

  useEffect(() => {
    const queryCampaignId = router.query.campaignId as string | undefined;
    const queryAdventureId = router.query.adventureId as string | undefined;

    const campaignToSet = queryCampaignId ?? activeCampaignId;
    if (campaignToSet) setCampaignId(campaignToSet);

    if (queryAdventureId) setAdventureId(queryAdventureId);
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

    const { success, errors } = await handleSave(encounterInput, {
      requireAdventure: true,
    });
    if (success) {
      setHasUnsavedChanges(false);
      await setActiveCampaign(campaignId);
      showDaisyToast('success', 'Encounter saved');

      // Track encounter created event
      posthog.capture('encounter_created', {
        encounter_name: newEncounter.name,
        enemy_count: newEncounter.enemies.length,
        has_description: !!newEncounter.description,
        campaign_id: campaignId,
        adventure_id: adventureId,
      });

      router.push({
        pathname: '/encounters',
        query: {
          selectedCampaign: campaignId,
          newEncounterCreated: 'true',
          newEncounterName: encodeURIComponent(newEncounter.name),
        },
      });
    } else if (errors && errors.length > 0) {
      errors.forEach((err) => showDaisyToast('error', err));
    } else {
      showDaisyToast('error', 'Failed to save encounter');
    }
  }, [
    newEncounter,
    campaignId,
    adventureId,
    handleSave,
    router,
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
    <>
      <Head>
        <title>Create New Encounter | Tabletop RPG Combat Management</title>
        <meta
          name="description"
          content="Create and customize new encounters for tabletop RPGs. Add enemies, set initiative, and manage combat scenarios for D&D and other TTRPGs with advanced encounter management tools."
        />
        <meta
          name="keywords"
          content="Create Encounter, Combat Management, Tabletop RPG, D&D, Initiative Tracker, Enemy Management, Encounter Builder, RPG Tools, Dungeon Master, Combat Tracker"
        />
      </Head>
      <div className="flex flex-col items-center justify-center relative">
        <h1 className="text-xl font-bold mb-2">New Encounter</h1>

        <div className="w-full max-w-xl bg-base-300 shadow-md rounded px-8 pt-6 pb-8 mb-4 h-[72vh] sm:h-auto max-h-[72vh] overflow-y-auto relative">
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
                label="Short Summary"
                value={newEncounter.description}
                onChange={handleFieldChange('description')}
              />

              <div className="mb-4 grid grid-cols-1 gap-1">
                <CampaignSelector
                  selectedCampaignId={campaignId}
                  onCampaignChange={handleCampaignChange}
                />
                <AdventureSelector
                  selectedAdventureId={adventureId}
                  selectedCampaignId={campaignId ?? activeCampaignId ?? ''}
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
            </>
          )}
        </div>

        {hasCampaigns && !campaignsLoading && (
          <div className="sticky bottom-4 w-full max-w-xl px-8 z-10">
            <Button
              className="w-full"
              onClick={onSave}
              disabled={isSaving || !campaignId}
              label="Save"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default NewEncounterPage;
