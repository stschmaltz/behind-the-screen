import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import posthog from 'posthog-js';
import NewEnemiesSection from './NewEnemiesSection';
import { useNewEncounter } from '../../../hooks/encounter/use-new-encounter';
import { NewEncounterTemplate } from '../../../types/encounters';
import { FormInput } from '../../../components/ui/FormInput';
import { Button } from '../../../components/ui/Button';
import { showDaisyToast } from '../../../lib/daisy-toast';
import {
  useManageEncounter,
  validateNewEncounter,
} from '../../../hooks/encounter/use-manage-encounter';
import { useManageCampaign } from '../../../hooks/campaign/use-manage-campaign';
import { useManageAdventure } from '../../../hooks/adventure/use-manage-adventure';
import { getAllAdventures } from '../../../hooks/adventure/get-all-adventures';
import {
  campaignHasAdventuresNow,
  DEFAULT_ADVENTURE_NAME,
  DEFAULT_CAMPAIGN_NAME,
  needsDefaultAdventure,
  resolveEncounterHome,
} from '../../../lib/encounterHome';
import { logger } from '../../../lib/logger';
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
  const { activeCampaignId: contextCampaignId, setActiveCampaignId } =
    useActiveCampaign();
  const activeCampaignId = contextCampaignId || undefined;
  const {
    campaigns,
    loading: campaignsLoading,
    error: campaignsError,
    refresh: refreshCampaigns,
  } = getAllCampaigns();
  const { handleSave: saveCampaign } = useManageCampaign();
  const { handleSave: saveAdventure } = useManageAdventure();
  const [isPreparingHome, setIsPreparingHome] = useState(false);

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

  const hasCampaigns = !campaignsLoading && campaigns.length > 0;
  const isFirstCampaign =
    !campaignsLoading && !campaignsError && campaigns.length === 0;
  const targetCampaignId = isFirstCampaign ? undefined : campaignId;
  const {
    adventures,
    loading: adventuresLoading,
    error: adventuresError,
    refresh: refreshAdventures,
  } = getAllAdventures({ campaignId: targetCampaignId });
  const campaignHasAdventures = adventures.length > 0 || !!adventuresError;
  const willCreateAdventure =
    !!targetCampaignId &&
    !adventuresLoading &&
    needsDefaultAdventure({ adventureId, campaignHasAdventures });

  const handleFieldChange = useCallback(
    (field: keyof NewEncounterTemplate) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        originalHandleFieldChange(field)(event);
        setHasUnsavedChanges(true);
      },
    [originalHandleFieldChange],
  );

  const onSave = useCallback(async () => {
    const encounterFields = {
      name: newEncounter.name,
      description: newEncounter.description,
      notes: newEncounter.notes || [],
      enemies: newEncounter.enemies,
      status: newEncounter.status,
    };

    const fieldErrors = validateNewEncounter({
      ...encounterFields,
      campaignId: campaignId ?? '',
    });
    if (fieldErrors.length > 0) {
      fieldErrors.forEach((err) => showDaisyToast('error', err));

      return;
    }

    setIsPreparingHome(true);
    const chosenAdventureId = isFirstCampaign ? undefined : adventureId;
    const home = await resolveEncounterHome(
      {
        campaignId: targetCampaignId,
        adventureId: chosenAdventureId,
        hasCampaigns: !isFirstCampaign,
        campaignHasAdventures:
          targetCampaignId && !chosenAdventureId
            ? await campaignHasAdventuresNow(refreshAdventures)
            : campaignHasAdventures,
      },
      {
        createCampaign: (name) => saveCampaign({ name, status: 'active' }),
        createAdventure: (forCampaignId, name) =>
          saveAdventure({ name, campaignId: forCampaignId, status: 'active' }),
      },
    );
    setIsPreparingHome(false);

    if (home.campaignId && home.campaignId !== campaignId) {
      setCampaignId(home.campaignId);
      setActiveCampaignId(home.campaignId);
    }
    if (home.createdCampaign) {
      refreshCampaigns().catch((err) =>
        logger.warn('Could not refresh campaigns after creating one', err),
      );
    }
    if (!home.ok) {
      showDaisyToast('error', home.error);

      return;
    }
    setAdventureId(home.adventureId);

    const encounterInput: EncounterInputData = {
      ...encounterFields,
      campaignId: home.campaignId,
      adventureId: home.adventureId,
    };

    const { success, errors } = await handleSave(encounterInput, {
      requireAdventure: true,
    });
    if (success) {
      setHasUnsavedChanges(false);
      await setActiveCampaign(home.campaignId);
      showDaisyToast('success', 'Encounter saved');

      // Track encounter created event
      posthog.capture('encounter_created', {
        encounter_name: newEncounter.name,
        enemy_count: newEncounter.enemies.length,
        has_description: !!newEncounter.description,
        campaign_id: home.campaignId,
        adventure_id: home.adventureId,
        created_default_campaign: home.createdCampaign,
        created_default_adventure: home.createdAdventure,
      });

      router.push({
        pathname: '/encounters',
        query: {
          selectedCampaign: home.campaignId,
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
    targetCampaignId,
    isFirstCampaign,
    campaignHasAdventures,
    refreshAdventures,
    saveCampaign,
    saveAdventure,
    refreshCampaigns,
    setActiveCampaignId,
    handleSave,
    router,
    setActiveCampaign,
  ]);

  const handleCampaignChange = useCallback((id: string | undefined) => {
    setCampaignId(id);
    setAdventureId(undefined);
    setHasUnsavedChanges(true);
  }, []);

  const handleAdventureChange = useCallback(
    (id: string | undefined) => {
      setAdventureId(id);
      setHasUnsavedChanges(true);
      refreshAdventures().catch((err) =>
        logger.warn('Could not refresh adventures', err),
      );
    },
    [refreshAdventures],
  );

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

          {isFirstCampaign ? (
            <p className="mb-4 text-sm opacity-70">
              This encounter will be saved to &ldquo;
              {DEFAULT_CAMPAIGN_NAME}&rdquo;. You can rename it later from
              Manage Campaigns.
            </p>
          ) : (
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
              {willCreateAdventure && (
                <p className="text-sm opacity-70">
                  Leave this blank to save to &ldquo;
                  {DEFAULT_ADVENTURE_NAME}&rdquo;.
                </p>
              )}
            </div>
          )}

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
        </div>

        {!campaignsLoading && (
          <div className="sticky bottom-4 w-full max-w-xl px-8 z-10">
            <Button
              className="w-full"
              onClick={onSave}
              disabled={
                isSaving ||
                isPreparingHome ||
                (hasCampaigns && !campaignId) ||
                (!!campaignId && adventuresLoading)
              }
              label="Save"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default NewEncounterPage;
