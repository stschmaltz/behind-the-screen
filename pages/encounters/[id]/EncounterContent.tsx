import { useRouter } from 'next/router';
import { useState } from 'react';
import InactiveEncounterTable from './InactiveEncounter/InactiveEncounterTable';
import ActiveEncounterTable from './ActiveEncounter/ActiveEncounterTable';
import { Player } from '../../../types/player';
import { useEncounterContext } from '../../../context/EncounterContext';
import { Button } from '../../../components/Button';
import { useModal } from '../../../hooks/use-modal';
import { showDaisyToast } from '../../../lib/daisy-toast';
import { logger } from '../../../lib/logger';
import DescriptionDisplay from '../../../components/DescriptionDisplay';
import EncounterDifficultyBadge from '../../../components/EncounterDifficultyBadge';

const EncounterContent = ({ players }: { players: Player[] }) => {
  const { encounter, deleteEncounter, updateEncounterDescription, handleSave } =
    useEncounterContext();
  const { closeModal, showModal } = useModal('delete-encounter-modal');
  const [isFinishingEncounter, setIsFinishingEncounter] = useState(false);
  const router = useRouter();

  const handleFinishEncounter = async () => {
    setIsFinishingEncounter(true);

    try {
      const finishedEncounter = {
        ...encounter,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };

      await handleSave(finishedEncounter);
      showDaisyToast('success', 'Encounter completed successfully!');
      router.replace('/encounters');
    } catch (error) {
      logger.error('Failed to complete encounter', error);
      showDaisyToast('error', 'Failed to complete encounter');
      setIsFinishingEncounter(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4 sm:gap-2">
            <div className="flex flex-col w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <h1 className="card-title text-3xl font-bold">
                  {encounter.name}
                </h1>
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
                      showDaisyToast('success', 'Description updated');
                    } catch (error) {
                      logger.error(
                        'Failed to update encounter description',
                        error,
                      );
                      showDaisyToast('error', 'Failed to update description');
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex flex-row gap-2 w-full sm:w-auto">
              <Button
                label="Delete Encounter"
                variant="error"
                tooltip="Delete Encounter"
                onClick={() => showModal()}
                className="btn-sm btn-error"
              />
              {encounter.status === 'active' && (
                <Button
                  label="Finish Encounter"
                  variant="accent"
                  tooltip="Complete this encounter"
                  onClick={handleFinishEncounter}
                  disabled={isFinishingEncounter}
                  loading={isFinishingEncounter}
                  className="btn-sm"
                />
              )}
            </div>
          </div>

          <div className="my-4">
            <div
              className={`badge badge-lg ${
                encounter.status === 'active'
                  ? 'badge-primary'
                  : 'badge-secondary'
              }`}
            >
              {encounter.status.charAt(0).toUpperCase() +
                encounter.status.slice(1)}
            </div>
            <EncounterDifficultyBadge
              enemies={encounter.enemies}
              playerLevels={encounter.initiativeOrder
                .filter((char) => char.type === 'player')
                .map((playerChar) => {
                  const matchedPlayer = players.find(
                    (p) => p._id === playerChar._id,
                  );

                  return matchedPlayer?.level || 1;
                })}
              className="badge-lg ml-2"
            />
          </div>

          <div>
            {encounter.status === 'active' ? (
              <ActiveEncounterTable players={players} />
            ) : (
              <InactiveEncounterTable encounter={encounter} players={players} />
            )}
          </div>
        </div>
      </div>

      <dialog id="delete-encounter-modal" className="modal modal-center">
        <div className="modal-box">
          <p>Are you sure you want to delete this encounter?</p>
          <div className="modal-action">
            <Button label="Cancel" variant="secondary" onClick={closeModal} />
            <Button
              label="Delete"
              variant="error"
              onClick={async () => {
                const result = await deleteEncounter(encounter._id);

                closeModal();
                if (!result) {
                  logger.error('Failed to delete encounter');
                  showDaisyToast('error', 'Failed to delete encounter');

                  return false;
                } else {
                  showDaisyToast('success', 'Encounter deleted');

                  router.replace('/encounters');
                }
              }}
            />
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default EncounterContent;
