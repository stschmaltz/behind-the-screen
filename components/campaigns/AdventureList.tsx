import React, { FormEvent } from 'react';
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
    <form onSubmit={onCreate} className="mb-4 flex gap-2">
      <input
        type="text"
        placeholder="New adventure name"
        className="input input-bordered flex-grow"
        value={newAdventureName}
        onChange={(e) => setNewAdventureName(e.target.value)}
        required
      />
      <Button
        type="submit"
        label={isSaving ? '' : 'Create Adventure'}
        loading={isSaving}
        disabled={isSaving || !newAdventureName.trim()}
        className="btn-primary"
      />
    </form>
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
      <div className="text-center py-8 bg-base-200 rounded-lg">
        <p className="text-base-content opacity-70">
          No adventures yet. Create your first one!
        </p>
      </div>
    )}
  </div>
);

export default AdventureList;
