import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import InlineEditableText from '../ui/InlineEditableText';
import { TransformedAdventure } from '../../hooks/adventure/get-all-adventures';

const AdventureListItem = ({
  adventure,
  onRename,
  onDelete,
  onMarkComplete,
  isRenaming,
  isSaving,
  isDeleting,
  adventureToDeleteId,
}: {
  adventure: TransformedAdventure;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onMarkComplete: () => void;
  isRenaming: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  adventureToDeleteId: string | null;
}) => {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={`p-4 bg-base-200 border border-base-300 rounded shadow-sm ${adventure.status === 'completed' ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {editing ? (
            <InlineEditableText
              initialValue={adventure.name}
              onSave={(val) => {
                onRename(val);
                setEditing(false);
              }}
              isSaving={isSaving}
              inputClassName="input input-bordered input-sm flex-grow"
              displayClassName=""
            />
          ) : (
            <Link
              href={`/encounters?campaignId=${adventure.campaignId}&adventureId=${adventure._id}`}
              className={`text-lg font-semibold hover:underline ${adventure.status === 'completed' ? 'line-through' : ''}`}
            >
              {adventure.name}
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Button
              label="Rename"
              variant="secondary"
              className="btn-xs"
              onClick={() => setEditing(true)}
              disabled={isDeleting || isRenaming}
            />
            <Button
              label={
                isDeleting && adventureToDeleteId === adventure._id
                  ? ''
                  : 'Delete'
              }
              variant="error"
              className="btn-xs btn-ghost"
              onClick={onDelete}
              loading={isDeleting && adventureToDeleteId === adventure._id}
              disabled={isRenaming || isDeleting}
            />
            {adventure.status === 'active' && (
              <Button
                label="Mark Complete"
                variant="secondary"
                className="btn-xs btn-outline"
                onClick={onMarkComplete}
                disabled={isSaving || isDeleting || isRenaming}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`badge ${adventure.status === 'active' ? 'badge-outline badge-success' : 'badge-ghost'}`}
            >
              {adventure.status === 'active'
                ? 'Active'
                : adventure.status === 'completed'
                  ? 'Completed'
                  : 'Archived'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdventureListItem;
