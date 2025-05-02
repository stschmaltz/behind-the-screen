import { useCallback, useMemo, useRef, useState } from 'react';
import { getAllAdventures } from '../../hooks/adventure/get-all-adventures';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import { saveAdventureMutation } from '../../data/graphql/snippets/adventure';
import { logger } from '../../lib/logger';

interface AdventureSelectorProps {
  campaignId?: string;
  selectedAdventureId?: string;
  onAdventureChange: (adventureId: string | undefined) => void;
}

interface SaveAdventureResponse {
  saveAdventure: {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

const AdventureSelector = ({
  campaignId,
  selectedAdventureId,
  onAdventureChange,
}: AdventureSelectorProps) => {
  const {
    adventures: allAdventures,
    loading: adventuresLoading,
    refresh: refreshAdventures,
  } = getAllAdventures({
    campaignId,
  });
  const [isCreatingAdventure, setIsCreatingAdventure] = useState(false);
  const [newAdventureName, setNewAdventureName] = useState('');
  const newAdventureInputRef = useRef<HTMLInputElement>(null);

  const sortedAdventuresForDropdown = useMemo(() => {
    if (!campaignId || !allAdventures) return [];

    const filtered = allAdventures.filter(
      (adv) => adv.campaignId === campaignId,
    );

    return filtered.sort((a, b) => {
      const statusOrder = { active: 1, completed: 2, archived: 3 };
      const orderA = statusOrder[a.status as keyof typeof statusOrder] ?? 99;
      const orderB = statusOrder[b.status as keyof typeof statusOrder] ?? 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.name.localeCompare(b.name);
    });
  }, [allAdventures, campaignId]);

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

      onAdventureChange(value === 'all' ? undefined : value);
    },
    [onAdventureChange],
  );

  const handleCreateAdventure = useCallback(async () => {
    if (!newAdventureName.trim() || !campaignId) return;

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
        onAdventureChange(newAdventureId);

        setNewAdventureName('');
        setIsCreatingAdventure(false);

        await refreshAdventures();
      }
    } catch (error) {
      logger.error('Failed to create adventure', error);
    }
  }, [newAdventureName, campaignId, onAdventureChange, refreshAdventures]);

  const handleCancelCreate = useCallback(() => {
    setIsCreatingAdventure(false);
    setNewAdventureName('');
  }, []);

  return (
    <div className="w-full max-w-md">
      {!isCreatingAdventure ? (
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
            <option value="all">All Adventures</option>
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
      ) : (
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">New Adventure Name</span>
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
            <button className="btn btn-ghost" onClick={handleCancelCreate}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdventureSelector;
