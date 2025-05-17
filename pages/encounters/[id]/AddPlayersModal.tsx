import React from 'react';
import { Button } from '../../../components/ui/Button';
import { useModal } from '../../../hooks/use-modal';
import type { Player } from '../../../src/generated/graphql';
import { PlayerWithInitiative } from '../../../types/player';

interface Props {
  players: Player[];
  onAddPlayers: (players: PlayerWithInitiative[]) => void;
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

  requireInitiative?: boolean;
}

const AddPlayersModal: React.FC<Props> = ({
  onAddPlayers,
  players,
  selectedCampaignId,
  currentPlayerIds = [],
  className,
  buttonVariant = 'primary',
  requireInitiative = false,
}) => {
  const { closeModal, showModal } = useModal('add-players-modal');
  const [toggledPlayers, setToggledPlayers] = React.useState<
    PlayerWithInitiative[]
  >([]);

  const availablePlayers = players.filter(
    (player) =>
      player.campaignId === selectedCampaignId &&
      !currentPlayerIds.includes(player._id),
  );

  const handleTogglePlayer = (player: Player, checked: boolean) => {
    if (checked) {
      setToggledPlayers([...toggledPlayers, { player, initiative: '' }]);
    } else {
      setToggledPlayers(
        toggledPlayers.filter((p) => p.player._id !== player._id),
      );
    }
  };

  const handleInitiativeChange = (playerId: string, value: string) => {
    setToggledPlayers((prev) =>
      prev.map((p) =>
        p.player._id === playerId
          ? { ...p, initiative: value === '' ? '' : Number(value) }
          : p,
      ),
    );
  };

  const isInitiativeValid = (initiative: number | ''): initiative is number =>
    typeof initiative === 'number' && !isNaN(initiative) && initiative > 0;

  const hasValidInitiative = () =>
    !requireInitiative ||
    toggledPlayers.every((p) => isInitiativeValid(p.initiative));

  const canSubmit = toggledPlayers.length > 0 && hasValidInitiative();

  const handleSubmit = () => {
    if (!canSubmit) return;
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
            availablePlayers.map((player, index) => {
              const toggled = toggledPlayers.find(
                (p) => p.player._id === player._id,
              );

              return (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`player-${index}`}
                    checked={!!toggled}
                    onChange={(e) =>
                      handleTogglePlayer(player, e.target.checked)
                    }
                  />
                  <label htmlFor={`player-${index}`}>{player.name}</label>
                  {toggled && (
                    <input
                      type="number"
                      min={1}
                      className="input input-bordered input-sm w-24 ml-2"
                      placeholder="Initiative"
                      value={toggled.initiative ?? ''}
                      onChange={(e) =>
                        handleInitiativeChange(player._id, e.target.value)
                      }
                      required
                    />
                  )}
                </div>
              );
            })
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
                      : setToggledPlayers(
                          availablePlayers.map((player) => ({
                            player,
                            initiative: '',
                          })),
                        )
                  }
                />
                <Button
                  variant="primary"
                  label="Add Players"
                  className="ml-4"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
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
