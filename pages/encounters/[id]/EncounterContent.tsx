import { useRouter } from 'next/router';
import InactiveEncounterTable from './InactiveEncounter/InactiveEncounterTable';
import ActiveEncounterTable from './ActiveEncounter/ActiveEncounterTable';
import { Player } from '../../../types/player';
import { useEncounterContext } from '../../../context/EncounterContext';
import { Button } from '../../../components/Button';
import { useModal } from '../../../hooks/use-modal';
import { showDaisyToast } from '../../../lib/daisy-toast';

const EncounterContent = ({ players }: { players: Player[] }) => {
  const { encounter, deleteEncounter } = useEncounterContext();
  const { closeModal, showModal } = useModal('delete-encounter-modal');
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h1 className="card-title text-3xl font-bold">{encounter.name}</h1>
            <Button
              label="Delete Encounter"
              variant="error"
              tooltip="Delete Encounter"
              onClick={() => showModal()}
              className="btn btn-error ml-auto"
            />
            <dialog id="delete-encounter-modal" className="modal modal-center">
              <div className="modal-box">
                <p>Are you sure you want to delete this encounter?</p>
                <div className="modal-action">
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={closeModal}
                  />
                  <Button
                    label="Delete"
                    variant="error"
                    onClick={async () => {
                      const result = await deleteEncounter(encounter._id);
                      // TODO: better error handling?
                      closeModal();
                      if (!result) {
                        console.error('Failed to delete encounter');
                        showDaisyToast('error', 'Failed to delete encounter');

                        return false;
                      } else {
                        showDaisyToast('success', 'Encounter deleted');

                        router.push('/encounters');
                      }
                    }}
                  />
                </div>
              </div>
            </dialog>
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
          </div>

          <div className="overflow-x-auto">
            {encounter.status === 'active' ? (
              <ActiveEncounterTable players={players} />
            ) : (
              <InactiveEncounterTable encounter={encounter} players={players} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncounterContent;
