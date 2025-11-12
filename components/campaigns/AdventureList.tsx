import React, { FormEvent } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import AdventureListItem from './AdventureListItem';
import { Button } from '../ui/Button';
import { TransformedAdventure } from '../../hooks/adventure/get-all-adventures';

const AdventureList = ({
  adventures,
  onCreate,
  onRename,
  onDelete,
  onMarkComplete,
  isSaving,
  isDeleting,
  renamingAdventureId,
  adventureToDeleteId,
  newAdventureName,
  setNewAdventureName,
}: {
  adventures: TransformedAdventure[];
  onCreate: (e: FormEvent) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onMarkComplete: (adventure: TransformedAdventure) => void;
  isSaving: boolean;
  isDeleting: boolean;
  renamingAdventureId: string | null;
  adventureToDeleteId: string | null;
  newAdventureName: string;
  setNewAdventureName: (val: string) => void;
}) => (
  <div>
    <div className="card bg-base-100 shadow-md mb-6 border-2 border-primary/20">
      <div className="card-body p-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
          <PlusIcon className="w-5 h-5 text-primary" />
          Create New Adventure
        </h3>
        <form onSubmit={onCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter adventure name..."
            className="input input-bordered flex-grow"
            value={newAdventureName}
            onChange={(e) => setNewAdventureName(e.target.value)}
            required
            autoFocus
          />
          <Button
            type="submit"
            label={isSaving ? '' : 'Create'}
            loading={isSaving}
            disabled={isSaving || !newAdventureName.trim()}
            className="btn-primary"
          />
        </form>
      </div>
    </div>
    {adventures && adventures.length > 0 ? (
      <div className="space-y-4">
        {adventures.map((adventure) => (
          <AdventureListItem
            key={adventure._id}
            adventure={adventure}
            onRename={(newName) => onRename(adventure._id, newName)}
            onDelete={() => onDelete(adventure._id)}
            onMarkComplete={() => onMarkComplete(adventure)}
            isRenaming={renamingAdventureId === adventure._id}
            isSaving={isSaving}
            isDeleting={isDeleting}
            adventureToDeleteId={adventureToDeleteId}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-12 bg-base-200 rounded-lg">
        <p className="text-base-content opacity-70 text-lg">
          No adventures yet. Create your first one above! ⬆️
        </p>
      </div>
    )}
  </div>
);

export default AdventureList;
