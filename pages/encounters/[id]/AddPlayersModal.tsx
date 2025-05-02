import React from 'react';
import { Button } from '../../../components/Button';
import { useModal } from '../../../hooks/use-modal';
import { Player } from '../../../types/player';

interface Props {
  players: Player[];
  onAddPlayers: (players: Player[]) => void;
  selectedCampaignId: string;
  currentPlayerIds?: string[];
  className?: string;
  buttonVariant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
}

const AddPlayersModal: React.FC<Props> = ({
  onAddPlayers,
  players,
  selectedCampaignId,
  currentPlayerIds = [],
  className,
  buttonVariant = 'primary',
}) => {
  const { closeModal, showModal } = useModal('add-players-modal');
  const [toggledPlayers, setToggledPlayers] = React.useState<Player[]>([]);

  // Filter players that are not already in the encounter
  const availablePlayers = players.filter(
    (player) =>
      player.campaignId === selectedCampaignId &&
      !currentPlayerIds.includes(player._id),
  );

  const handleSubmit = () => {
    onAddPlayers(toggledPlayers);
    setToggledPlayers([]);
    closeModal();
  };

  const areAllPlayersSelected =
    toggledPlayers.length === availablePlayers.length;

  return (
    <>
      <Button
        variant={buttonVariant}
        label="Add Players"
        onClick={showModal}
        className={className}
      />
      <dialog className="modal" id="add-players-modal">
        <div className="modal-box">
          <h2 className="text-2xl font-bold mb-4">Add Players</h2>

          {availablePlayers.length === 0 ? (
            <div className="alert alert-info mb-4">
              All campaign players are already in this encounter.
            </div>
          ) : (
            availablePlayers.map((player, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`player-${index}`}
                  checked={toggledPlayers.includes(player)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setToggledPlayers([...toggledPlayers, player]);
                    } else {
                      setToggledPlayers(
                        toggledPlayers.filter((p) => p._id !== player._id),
                      );
                    }
                  }}
                />
                <label htmlFor={`player-${index}`}>{player.name}</label>
              </div>
            ))
          )}

          <div className="flex justify-end mt-4">
            {availablePlayers.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  label={areAllPlayersSelected ? 'Deselect All' : 'Select All'}
                  onClick={() =>
                    areAllPlayersSelected
                      ? setToggledPlayers([])
                      : setToggledPlayers(availablePlayers)
                  }
                />
                <Button
                  variant="primary"
                  label="Add Players"
                  className="ml-4"
                  onClick={handleSubmit}
                  disabled={toggledPlayers.length === 0}
                />
              </>
            )}
            <Button
              variant="error"
              label="Cancel"
              className="ml-4"
              onClick={closeModal}
            />
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default AddPlayersModal;
