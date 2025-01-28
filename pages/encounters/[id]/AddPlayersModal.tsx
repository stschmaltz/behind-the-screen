import React from 'react';
import { Button } from '../../../components/Button';
import { useModal } from '../../../hooks/use-modal';
import { Player } from '../../../types/player';

interface Props {
  players: Player[];
  onAddPlayers: (players: Player[]) => void;
}

const AddPlayersModal: React.FC<Props> = ({ onAddPlayers, players }) => {
  const { closeModal, showModal } = useModal('add-players-modal');
  const [toggledPlayers, setToggledPlayers] = React.useState<Player[]>(players);
  const handleSubmit = () => {
    onAddPlayers(toggledPlayers);

    setToggledPlayers([]);
    closeModal();
  };

  const areAllPlayersSelected = toggledPlayers.length === players.length;

  return (
    <>
      <Button variant="primary" label="Add Players" onClick={showModal} />
      <dialog className="modal" id="add-players-modal">
        <div className="modal-box">
          <h2 className="text-2xl font-bold mb-4">Add Players</h2>
          {players.map((player, index) => (
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
          ))}
          <div className="flex justify-end">
            <Button
              variant="secondary"
              label={
                toggledPlayers.length === players.length
                  ? 'Deselect All'
                  : 'Select All'
              }
              onClick={() =>
                toggledPlayers.length === players.length
                  ? setToggledPlayers([])
                  : setToggledPlayers(players)
              }
            />
            <Button
              variant="primary"
              label="Add Players"
              className="ml-4"
              onClick={handleSubmit}
            />
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

export { AddPlayersModal };
