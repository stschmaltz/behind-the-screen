import React from 'react';
import { Button } from '../../../components/Button';
import { useModal } from '../../../hooks/use-modal';
import { FormInput } from '../../../components/FormInput';
import { Player } from '../../../types/player';
import { Encounter } from '../../../types/encounters';

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

  return (
    <>
      <Button variant="primary" label="Add Players" onClick={showModal} />
      <dialog className="modal" id="add-players-modal">
        <div className="modal-box">
          <h2 className="text-2xl font-bold mb-4">Add Players</h2>
          {players.map((player, index) => (
            <div key={index} className="mb-2 flex items-center gap-2">
              <input type="checkbox" id={`player-${index}`} />
              <label htmlFor={`player-${index}`}>{player.name}</label>
            </div>
          ))}
          <Button
            variant="primary"
            label="Add Players"
            onClick={handleSubmit}
          />
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export { AddPlayersModal };
