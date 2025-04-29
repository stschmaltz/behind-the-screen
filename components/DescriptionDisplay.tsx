import { MouseEvent, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import { logger } from '../lib/logger';

interface DescriptionDisplayProps {
  description?: string;
  encounterId: string;
  isEditable?: boolean;
  onUpdateDescription?: (newDescription: string) => Promise<void>;
  className?: string; // Allow passing additional classes
}

const DescriptionDisplay: React.FC<DescriptionDisplayProps> = ({
  description,
  encounterId,
  isEditable = false,
  onUpdateDescription,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasDescription = description && description.trim().length > 0;
  const tooltipId = `desc-tooltip-${encounterId}`;

  const handleSave = async () => {
    if (!onUpdateDescription || !isEditable) return;

    setIsSaving(true);
    setError(null);
    try {
      await onUpdateDescription(editedDescription);
      setIsEditing(false);
    } catch (err) {
      logger.error('Failed to update description:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedDescription(description || '');
    setIsEditing(false);
    setError(null);
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  if (!isEditable && !hasDescription) {
    return null;
  }

  return (
    <div className={`inline-block flex items-center ${className}`}>
      <button
        type="button"
        data-tooltip-id={tooltipId}
        className="p-0 border-none bg-transparent cursor-pointer align-middle"
        aria-label="View description"
        onClick={handleButtonClick}
      >
        <InformationCircleIcon className="h-5 w-5 text-info hover:text-info-focus" />
      </button>

      <Tooltip
        id={tooltipId}
        clickable
        events={['click']}
        place="top"
        variant="info"
        className="!opacity-100 !z-50 max-w-xs"
      >
        <div className="p-2 text-sm bg-base-100 text-base-content shadow-lg rounded-md border border-base-300">
          {!isEditing ? (
            <>
              <p className="whitespace-pre-wrap break-words">
                {hasDescription ? description : 'No description provided.'}
              </p>
              {isEditable && (
                <button
                  className="btn btn-xs btn-outline btn-info mt-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                className="textarea textarea-bordered textarea-sm w-full"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
                placeholder="Enter encounter description"
                autoFocus
                disabled={isSaving}
              />
              {error && <p className="text-error text-xs">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  className={`btn btn-xs btn-info ${isSaving ? 'loading' : ''}`}
                  onClick={handleSave}
                  disabled={isSaving || editedDescription === description}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </Tooltip>
    </div>
  );
};

export default DescriptionDisplay;
