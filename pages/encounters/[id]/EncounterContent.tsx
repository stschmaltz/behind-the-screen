import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ActiveEncounterTable from './ActiveEncounter/ActiveEncounterTable';
import InactiveEncounterTable from './InactiveEncounter/InactiveEncounterTable';
import { useEncounterContext } from '../../../context/EncounterContext';
import type { Player } from '../../../src/generated/graphql';
import { Button } from '../../../components/ui/Button';
import { useModal } from '../../../hooks/use-modal';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import DescriptionDisplay from '../../../components/DescriptionDisplay';
import EncounterDifficultyBadge from '../../../components/EncounterDifficultyBadge';
import InlineEditableText from '../../../components/ui/InlineEditableText';
import { logger } from '../../../lib/logger';

interface EncounterContentProps {
  players: Player[];
}

const EncounterContent: React.FC<EncounterContentProps> = ({ players }) => {
  const {
    encounter,
    handleSave,
    isSaving,
    deleteEncounter,
    updateEncounterDescription,
  } = useEncounterContext();

  const [draftName, setDraftName] = useState(encounter.name);
  const { showModal: showDeleteModal, closeModal: closeDeleteModal } = useModal(
    'delete-encounter-modal',
  );
  const [isDeleteModalActuallyOpen, setIsDeleteModalActuallyOpen] =
    useState(false);
  const [isFinishingEncounter, setIsFinishingEncounter] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDraftName(encounter.name);
  }, [encounter.name]);

  if (!encounter) {
    return <div>Loading encounter details...</div>;
  }

  const openDeleteModalAndSetState = () => {
    showDeleteModal();
    setIsDeleteModalActuallyOpen(true);
  };

  const closeDeleteModalAndSetState = () => {
    closeDeleteModal();
    setIsDeleteModalActuallyOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const result = await deleteEncounter(encounter._id);
    closeDeleteModalAndSetState();
    setIsDeleting(false);
    if (result) {
      router.push('/encounters');
    } else {
      logger.error('Failed to delete encounter.');
    }
  };

  const handleFinishEncounter = async () => {
    setIsFinishingEncounter(true);
    try {
      const finishedEncounter = {
        ...encounter,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };
      const success = await handleSave(finishedEncounter);
      if (success) {
        router.push('/encounters');
      } else {
        logger.error('Failed to finish encounter.');
      }
    } catch (error) {
      logger.error('Error finishing encounter:', error);
    } finally {
      setIsFinishingEncounter(false);
    }
  };

  const handleNameSave = async (newName: string) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || trimmedNewName === encounter.name) {
      setDraftName(encounter.name);

      return;
    }

    const updatedEncounterForSave = {
      ...encounter,
      name: trimmedNewName,
    };

    const success = await handleSave(updatedEncounterForSave);

    if (success) {
      logger.info('Encounter name updated successfully via inline edit.');
    } else {
      logger.error('Failed to save encounter name change via inline edit.');
      setDraftName(encounter.name);
    }
  };

  const { status } = encounter;

  return (
    <div className="p-4">
      <div className="card bg-base-100 shadow-sm mb-4">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <InlineEditableText
                  initialValue={draftName}
                  onSave={handleNameSave}
                  isSaving={isSaving}
                  placeholder="Enter Encounter Name"
                  displayClassName="card-title text-3xl font-bold cursor-pointer hover:bg-base-200 p-1 rounded"
                  inputClassName="input input-bordered input-lg w-full font-bold text-3xl"
                  ariaLabel="Encounter name"
                />
              </div>
              <div className="flex items-center gap-2">
                <DescriptionDisplay
                  encounterId={encounter._id}
                  description={encounter.description}
                  isEditable={true}
                  onUpdateDescription={async (newDescription) => {
                    try {
                      await updateEncounterDescription(
                        encounter._id,
                        newDescription,
                      );
                    } catch (_error) {
                      logger.error('Update description failed in component');
                    }
                  }}
                />
                <div
                  className={`badge badge-lg badge-outline ${
                    status === 'active' ? 'badge-primary' : 'badge-secondary'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <EncounterDifficultyBadge
                  enemies={encounter.enemies}
                  playerLevels={encounter.initiativeOrder
                    .filter((char) => char.type === 'player')
                    .map((playerChar) => {
                      const player = players.find(
                        (p) => p._id === playerChar._id,
                      );

                      return player?.level || 1;
                    })}
                  className="badge-md badge-outline"
                />
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3 w-full">
              <div className="card-actions flex w-full gap-2 sm:flex-row sm:w-auto sm:justify-end sm:gap-3">
                <Button
                  label="Delete Encounter"
                  onClick={openDeleteModalAndSetState}
                  variant="error"
                  className="btn-sm flex-1 w-auto min-w-[9rem]"
                  disabled={isSaving || isFinishingEncounter || isDeleting}
                />
                {status === 'active' && (
                  <Button
                    label="Finish Encounter"
                    onClick={handleFinishEncounter}
                    className="btn-sm btn-success flex-1 w-auto"
                    loading={isFinishingEncounter}
                    disabled={isSaving}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        {status === 'active' ? (
          <ActiveEncounterTable players={players} />
        ) : (
          <InactiveEncounterTable encounter={encounter} players={players} />
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalActuallyOpen}
        onClose={closeDeleteModalAndSetState}
        onConfirm={handleDeleteConfirm}
        title="Delete Encounter?"
        message={`Are you sure you want to delete the encounter "${encounter.name}"? This action cannot be undone.`}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default EncounterContent;
