import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAllAdventures } from '../../hooks/adventure/get-all-adventures';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import { saveAdventureMutation } from '../../data/graphql/snippets/adventure';
import { logger } from '../../lib/logger';

export interface AdventureChangeMeta {
  isAutomatic: boolean;
}

interface AdventureSelectorProps {
  onAdventureChange: (
    adventureId: string | undefined,
    meta?: AdventureChangeMeta,
  ) => void;
  selectedAdventureId?: string;
  selectedCampaignId: string;
  required?: boolean;
  onPendingNameChange?: (name: string) => void;
  onCreatingChange?: (isCreating: boolean) => void;
}

interface SaveAdventureResponse {
  saveAdventure: {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

const AdventureSelector: React.FC<AdventureSelectorProps> = ({
  onAdventureChange,
  selectedAdventureId,
  selectedCampaignId: campaignId,
  required = false,
  onPendingNameChange,
  onCreatingChange,
}) => {
  const {
    adventures,
    loading: adventuresLoading,
    refresh: refreshAdventures,
  } = getAllAdventures({
    campaignId: campaignId ?? undefined,
  });
  const [isCreatingAdventure, setIsCreatingAdventure] = useState(false);
  const [newAdventureName, setNewAdventureNameState] = useState('');
  const setNewAdventureName = useCallback(
    (name: string) => {
      setNewAdventureNameState(name);
      onPendingNameChange?.(name);
    },
    [onPendingNameChange],
  );
  const autoSelectedCampaignId = useRef<string | null>(null);
  const previousCampaignId = useRef(campaignId);
  const isSubmittingAdventure = useRef(false);

  useEffect(() => {
    if (previousCampaignId.current === campaignId) return;
    previousCampaignId.current = campaignId;
    autoSelectedCampaignId.current = null;
    setIsCreatingAdventure(false);
    setNewAdventureName('');
  }, [campaignId, setNewAdventureName]);
  const newAdventureInputRef = useRef<HTMLInputElement>(null);

  const filteredAdventures = useMemo(() => {
    return adventures || [];
  }, [adventures]);

  const sortedAdventuresForDropdown = useMemo(() => {
    if (!filteredAdventures) return [];

    const sorted = [...filteredAdventures].sort((a, b) => {
      const statusOrder = { active: 1, completed: 2, archived: 3 };
      const orderA = statusOrder[a.status as keyof typeof statusOrder] ?? 99;
      const orderB = statusOrder[b.status as keyof typeof statusOrder] ?? 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [filteredAdventures]);

  useEffect(() => {
    if (!required || !campaignId || adventuresLoading) return;
    if (selectedAdventureId || autoSelectedCampaignId.current === campaignId)
      return;

    const activeAdventures = sortedAdventuresForDropdown.filter(
      (adventure) =>
        adventure.status === 'active' && adventure.campaignId === campaignId,
    );
    if (activeAdventures.length !== 1) return;

    autoSelectedCampaignId.current = campaignId;
    onAdventureChange(activeAdventures[0]._id, { isAutomatic: true });
  }, [
    required,
    campaignId,
    adventuresLoading,
    selectedAdventureId,
    sortedAdventuresForDropdown,
    onAdventureChange,
  ]);

  const handleAdventureChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;

      if (value === 'new') {
        setIsCreatingAdventure(true);
        setTimeout(() => {
          newAdventureInputRef.current?.focus();
        }, 0);

        return;
      }

      autoSelectedCampaignId.current = campaignId;
      onAdventureChange(value === 'all' ? undefined : value);
    },
    [onAdventureChange, campaignId],
  );

  const handleCreateAdventure = useCallback(async () => {
    if (!newAdventureName.trim() || !campaignId) return;
    if (isSubmittingAdventure.current) return;

    isSubmittingAdventure.current = true;
    onCreatingChange?.(true);
    try {
      const result = await asyncFetch<SaveAdventureResponse>(
        saveAdventureMutation,
        {
          input: {
            name: newAdventureName,
            campaignId: campaignId,
            status: 'active',
          },
        },
      );

      const newAdventureId = result?.saveAdventure?._id;

      if (newAdventureId) {
        autoSelectedCampaignId.current = campaignId;
        onAdventureChange(newAdventureId);

        setNewAdventureName('');
        setIsCreatingAdventure(false);

        await refreshAdventures();
      }
    } catch (error) {
      logger.error('Failed to create adventure', error);
    } finally {
      isSubmittingAdventure.current = false;
      onCreatingChange?.(false);
    }
  }, [
    newAdventureName,
    campaignId,
    onAdventureChange,
    refreshAdventures,
    setNewAdventureName,
    onCreatingChange,
  ]);

  const handleCancelCreate = useCallback(() => {
    setIsCreatingAdventure(false);
    setNewAdventureName('');
  }, [setNewAdventureName]);

  return (
    <div className="w-full max-w-md">
      {(!adventuresLoading && sortedAdventuresForDropdown.length === 0) ||
      isCreatingAdventure ? (
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">New Adventure Name</span>
            {required && (
              <span className="label-text-alt">
                Groups encounters, like a chapter or module
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              ref={newAdventureInputRef}
              className="input input-bordered w-full"
              value={newAdventureName}
              onChange={(e) => setNewAdventureName(e.target.value)}
              placeholder="Enter adventure name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateAdventure();
                if (e.key === 'Escape') handleCancelCreate();
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateAdventure}
              disabled={!newAdventureName.trim()}
            >
              Create
            </button>
            {!(
              sortedAdventuresForDropdown.length === 0 && !adventuresLoading
            ) && (
              <button className="btn btn-ghost" onClick={handleCancelCreate}>
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Adventure</span>
          </label>
          <select
            className="select select-bordered"
            value={selectedAdventureId || 'all'}
            onChange={handleAdventureChange}
            disabled={adventuresLoading || !campaignId}
          >
            <option value="all">
              {required ? 'Select an adventure' : 'All Adventures'}
            </option>
            {sortedAdventuresForDropdown?.map((adventure) => (
              <option key={adventure._id} value={adventure._id}>
                {adventure.name}
                {adventure.status === 'completed' ? ' (Completed)' : ''}
              </option>
            ))}
            {campaignId && (
              <option value="new" className="text-primary font-semibold">
                + Create New Adventure
              </option>
            )}
          </select>
          {!campaignId && (
            <label className="label">
              <span className="label-text-alt text-warning">
                Select a campaign first
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default AdventureSelector;
